/**
 * The migration runner.
 *
 * Design rules taken from the hanouti documentation:
 *   - the SQL files are executed exactly as reviewed — the runner never rewrites,
 *     splits or wraps them; the declaration transactions belong to the files,
 *   - one migration history covers all four business schemas,
 *   - nothing runs automatically: every apply is an explicit command,
 *   - a file whose checksum changed after review is refused, not re-applied.
 */
import type { Client } from 'pg';
import type { LedgerConfiguration } from './config.js';
import { findHashMismatches, type SqlFile } from './sql-files.js';

export type LedgerKind = 'migration' | 'seed';

export interface LedgerRow {
  filename: string;
  checksum: string;
  appliedAt: Date;
  durationMs: number;
  appliedBy: string;
}

export type PlanState = 'pending' | 'applied' | 'drift';

export interface PlanEntry {
  file: SqlFile;
  state: PlanState;
  recordedChecksum: string | undefined;
}

export interface ApplyOutcome {
  file: string;
  status: 'applied' | 'skipped';
  checksum: string;
  durationMs: number;
}

export interface ApplyOptions {
  kind: LedgerKind;
  ledger: LedgerConfiguration;
  manifestHashes?: Readonly<Record<string, string>> | undefined;
  /** Apply files whose checksum differs from the reviewed manifest. */
  allowModifiedSql?: boolean | undefined;
  /** Report the plan without sending any statement. */
  dryRun?: boolean | undefined;
  onEvent?: ((event: RunnerEvent) => void) | undefined;
}

export interface RunnerEvent {
  type: 'skip' | 'apply' | 'applied' | 'notice';
  message: string;
}

const identifier = /^[a-z_][a-z0-9_]*$/;

/**
 * Create the ledger when absent. The ledger records what has been applied so a
 * deployment can be inspected without reading the SQL files, and so a changed
 * file is detected instead of silently re-run.
 */
export async function ensureLedger(client: Client, ledger: LedgerConfiguration): Promise<void> {
  const target = qualified(ledger);
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${target} (
       kind text NOT NULL DEFAULT 'migration',
       filename text NOT NULL,
       checksum text NOT NULL,
       applied_at timestamptz NOT NULL DEFAULT now(),
       duration_ms integer NOT NULL,
       applied_by text NOT NULL DEFAULT current_user,
       PRIMARY KEY (kind, filename)
     )`,
  );
}

/** Ledger contents for one kind. A ledger that does not exist yet reads as empty. */
export async function readLedger(
  client: Client,
  ledger: LedgerConfiguration,
  kind: LedgerKind,
): Promise<LedgerRow[]> {
  let result;
  try {
    result = await client.query<{
      filename: string;
      checksum: string;
      applied_at: Date;
      duration_ms: number;
      applied_by: string;
    }>(
      `SELECT filename, checksum, applied_at, duration_ms, applied_by
         FROM ${qualified(ledger)}
        WHERE kind = $1
        ORDER BY filename`,
      [kind],
    );
  } catch (error) {
    // 42P01: undefined_table — nothing has been recorded on this database yet.
    if (isUndefinedTable(error)) return [];
    throw error;
  }

  return result.rows.map((row) => ({
    filename: row.filename,
    checksum: row.checksum,
    appliedAt: row.applied_at,
    durationMs: row.duration_ms,
    appliedBy: row.applied_by,
  }));
}

function isUndefinedTable(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '42P01'
  );
}

/** Classify every discovered file without changing anything. */
export async function plan(
  client: Client,
  files: readonly SqlFile[],
  ledger: LedgerConfiguration,
  kind: LedgerKind,
): Promise<PlanEntry[]> {
  const recorded = new Map(
    (await readLedger(client, ledger, kind)).map((row) => [row.filename, row.checksum]),
  );
  return files.map((file) => {
    const recordedChecksum = recorded.get(file.name);
    if (recordedChecksum === undefined) return { file, state: 'pending', recordedChecksum };
    return {
      file,
      state: recordedChecksum === file.checksum ? 'applied' : 'drift',
      recordedChecksum,
    };
  });
}

/**
 * Apply every pending file in order. Applied files are skipped; a file whose
 * checksum differs from the ledger, or from the reviewed manifest, aborts the
 * run before the first statement is sent.
 */
export async function apply(
  client: Client,
  files: readonly SqlFile[],
  options: ApplyOptions,
): Promise<ApplyOutcome[]> {
  const emit = options.onEvent ?? (() => {});
  const manifestHashes = options.manifestHashes;
  if (manifestHashes !== undefined && options.allowModifiedSql !== true) {
    const mismatches = findHashMismatches(files, manifestHashes);
    if (mismatches.length > 0) {
      const list = mismatches.map((item) => `  ${item.file}`).join('\n');
      throw new Error(
        `Refusing to apply: ${mismatches.length} SQL file(s) no longer match the reviewed manifest.\n${list}\n` +
          'Re-review the changes, or pass --allow-modified-sql to apply them anyway.',
      );
    }
  }

  await ensureLedger(client, options.ledger);
  const entries = await plan(client, files, options.ledger, options.kind);

  const drift = entries.filter((entry) => entry.state === 'drift');
  if (drift.length > 0) {
    const list = drift
      .map((entry) => `  ${entry.file.name}: ledger ${short(entry.recordedChecksum)} ≠ file ${short(entry.file.checksum)}`)
      .join('\n');
    throw new Error(
      `Refusing to apply: ${drift.length} file(s) changed after they were recorded as applied.\n${list}\n` +
        'Prepare a follow-up migration instead of editing applied history.',
    );
  }

  const outcomes: ApplyOutcome[] = [];
  for (const entry of entries) {
    if (entry.state !== 'pending') {
      emit({ type: 'skip', message: `${entry.file.name} already applied` });
      outcomes.push({
        file: entry.file.name,
        status: 'skipped',
        checksum: entry.file.checksum,
        durationMs: 0,
      });
      continue;
    }

    if (options.dryRun === true) {
      emit({ type: 'notice', message: `would apply ${entry.file.name}` });
      outcomes.push({
        file: entry.file.name,
        status: 'skipped',
        checksum: entry.file.checksum,
        durationMs: 0,
      });
      continue;
    }

    emit({ type: 'apply', message: `applying ${entry.file.name}` });
    const started = performance.now();
    const contents = await import('node:fs').then((fs) => fs.readFileSync(entry.file.path, 'utf8'));
    try {
      // Executed verbatim: the file owns its BEGIN/COMMIT, and its \gexec-free
      // statements are valid for pg's simple query protocol.
      await client.query(contents);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown driver error';
      throw new Error(`Applying ${entry.file.name} failed: ${reason}${hintFor(reason)}`);
    }
    const durationMs = Math.round(performance.now() - started);

    // Recorded immediately after success. If this insert fails the run aborts
    // loudly rather than continuing with an untracked migration.
    await client.query(
      `INSERT INTO ${qualified(options.ledger)} (kind, filename, checksum, duration_ms, applied_by)
       VALUES ($1, $2, $3, $4, current_user)
       ON CONFLICT (kind, filename)
       DO UPDATE SET checksum = EXCLUDED.checksum,
                     applied_at = now(),
                     duration_ms = EXCLUDED.duration_ms,
                     applied_by = EXCLUDED.applied_by`,
      [options.kind, entry.file.name, entry.file.checksum, durationMs],
    );
    emit({ type: 'applied', message: `${entry.file.name} applied in ${durationMs} ms` });
    outcomes.push({
      file: entry.file.name,
      status: 'applied',
      checksum: entry.file.checksum,
      durationMs,
    });
  }

  return outcomes;
}

/** True when no pending or drifted files remain. */
export async function isUpToDate(
  client: Client,
  files: readonly SqlFile[],
  ledger: LedgerConfiguration,
  kind: LedgerKind,
): Promise<boolean> {
  const entries = await plan(client, files, ledger, kind);
  return entries.every((entry) => entry.state === 'applied');
}

/**
 * Add the operator's next step for failures whose fix is a one-time action.
 * The message is derived from the driver text only — never from the URL.
 */
function hintFor(reason: string): string {
  if (reason.includes('permission denied to create role'))
    return (
      '\n  This seed creates PostgreSQL roles and must run as a provisioning administrator.\n' +
      '  Provide ADMIN_DATABASE_URL for a role with CREATEROLE, or apply the file by hand as\n' +
      '  described in hanoti/data/ERP_ROUTINES.md.'
    );
  if (reason.includes('permission denied to create extension'))
    return (
      '\n  pgvector is not a trusted extension, so a superuser must install it once per database:\n' +
      "    psql \"$DATABASE_URL\" -c 'CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;'\n" +
      '  Re-run migrate afterwards: 001 detects the existing extension and continues.'
    );
  return '';
}

function qualified(ledger: LedgerConfiguration): string {
  return `"${assertIdentifier(ledger.schema, 'ledger schema')}"."${assertIdentifier(ledger.table, 'ledger table')}"`;
}

function assertIdentifier(value: string, label: string): string {
  if (!identifier.test(value))
    throw new Error(`${label} must be a lowercase SQL identifier, received an unsafe value.`);
  return value;
}

function short(checksum: string | undefined): string {
  return checksum === undefined ? '(none)' : checksum.slice(0, 12);
}
