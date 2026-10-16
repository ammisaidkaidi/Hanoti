#!/usr/bin/env node
/**
 * hanouti-db — command line entry point.
 *
 * Commands
 *   help      usage, environment and examples
 *   setup     provision the database when absent and check the prerequisites
 *   migrate   apply migrations/hanouti/*.sql in order, through the ledger
 *   seed      apply the optional seed SQL
 *   status    read-only report: connection, ledger, schemas, extensions
 *   check     fast production readiness test, non-zero exit on failure
 *   verify    compare the live database with the checked manifests
 *
 * Connection strings come from the environment only, never from arguments, so
 * they stay out of shell history and process listings.
 */
import type { LedgerConfiguration } from './config.js';
import {
  deriveDatabaseUrl,
  readConnectTimeoutMs,
  readDatabaseConfiguration,
  readDatabaseOwner,
  readLedgerConfiguration,
  readMaintenanceConfiguration,
} from './config.js';
import { databaseName } from './connection-policy.js';
import {
  databaseSummary,
  healthcheck,
  ledgerExists,
  ledgerRows,
  loadManifests,
  routines,
  summarize,
  verifyRoutineGrants,
  verifyRoutines,
  verifyTables,
  withClient,
  type Finding,
} from './helpers/index.js';
import { plan, type PlanEntry } from './runner.js';
import { runMigrate } from './migrate.js';
import { runSeed } from './seed.js';
import { listSqlFiles } from './sql-files.js';
import { resolveHanotiPaths, type HanotiPaths } from './paths.js';
import { runSetup, type SetupStep } from './setup.js';

interface Flags {
  dryRun: boolean;
  allowModifiedSql: boolean;
  privileges: boolean;
  acl: boolean;
  json: boolean;
  help: boolean;
}

const commands = ['help', 'setup', 'migrate', 'seed', 'status', 'check', 'verify'] as const;
type Command = (typeof commands)[number];

async function main(argv: readonly string[]): Promise<number> {
  const { command, flags, error } = parseArgs(argv);
  if (error !== undefined) {
    process.stderr.write(`hanouti-db: ${error}\n\n`);
    process.stdout.write(usage());
    return 2;
  }
  if (command === 'help' || flags.help) {
    process.stdout.write(usage());
    return 0;
  }

  const paths = resolveHanotiPaths();
  const ledger = readLedgerConfiguration();
  const connectTimeoutMs = readConnectTimeoutMs();

  switch (command) {
    case 'setup':
      return commandSetup(paths, ledger, connectTimeoutMs, flags);
    case 'migrate':
      return commandMigrate(paths, ledger, connectTimeoutMs, flags);
    case 'seed':
      return commandSeed(paths, ledger, connectTimeoutMs, flags);
    case 'status':
      return commandStatus(paths, ledger, connectTimeoutMs, flags);
    case 'check':
      return commandCheck(paths, ledger, connectTimeoutMs, flags);
    case 'verify':
      return commandVerify(paths, ledger, connectTimeoutMs, flags);
  }
}

// ── commands ────────────────────────────────────────────────────────────────

async function commandSetup(
  paths: HanotiPaths,
  ledger: LedgerConfiguration,
  connectTimeoutMs: number,
  flags: Flags,
): Promise<number> {
  const maintenance = readMaintenanceConfiguration();
  if (maintenance === undefined) {
    process.stderr.write(
      'hanouti-db setup: ADMIN_DATABASE_URL is required — a CREATEDB role on a maintenance\n' +
        '                database such as postgres. It stays separate from DATABASE_URL.\n',
    );
    return 1;
  }

  let appUrl: string | undefined;
  try {
    appUrl = readDatabaseConfiguration().url;
  } catch {
    appUrl = undefined;
  }

  const steps = await runSetup({
    adminUrl: maintenance.url,
    appUrl,
    owner: readDatabaseOwner(),
    databaseName,
    connectTimeoutMs,
    dryRun: flags.dryRun,
  });

  const failed = steps.filter((step) => step.status === 'failed');
  if (flags.json) printJson({ command: 'setup', steps, ok: failed.length === 0 });
  else {
    process.stdout.write('setup\n');
    printSteps(steps);
    if (failed.length === 0) {
      process.stdout.write(
        '\nNext: apply the reviewed migrations with `npm run migrate` (or `node dist/cli.js migrate`).\n',
      );
    }
  }
  return failed.length === 0 ? 0 : 1;
}

async function commandMigrate(
  paths: HanotiPaths,
  ledger: LedgerConfiguration,
  connectTimeoutMs: number,
  flags: Flags,
): Promise<number> {
  const { url } = readDatabaseConfiguration();
  const manifestHashes = readManifestHashes(paths);
  const events: string[] = [];

  const result = await runMigrate({
    url,
    migrationsDir: paths.migrationsDir,
    ledger,
    manifestHashes,
    allowModifiedSql: flags.allowModifiedSql,
    dryRun: flags.dryRun,
    connectTimeoutMs,
    onEvent: (event) => {
      if (event.type !== 'skip' || !flags.json) events.push(event.message);
      if (!flags.json) process.stdout.write(`  ${event.message}\n`);
    },
  });

  if (flags.json) {
    printJson({
      command: 'migrate',
      dryRun: flags.dryRun,
      plan: result.plan.map((entry) => ({ file: entry.file.name, state: entry.state })),
      outcomes: result.outcomes,
    });
  } else {
    const applied = result.outcomes.filter((outcome) => outcome.status === 'applied').length;
    const skipped = result.outcomes.length - applied;
    process.stdout.write(
      flags.dryRun
        ? `\ndry run: ${skipped} file(s) already applied, ${applied === 0 ? pendingCount(result.plan) : applied} would be applied\n`
        : `\n${applied} applied, ${skipped} already up to date\n`,
    );
  }
  return 0;
}

async function commandSeed(
  paths: HanotiPaths,
  ledger: LedgerConfiguration,
  connectTimeoutMs: number,
  flags: Flags,
): Promise<number> {
  const { url } = readDatabaseConfiguration();
  // The privileges seed creates roles, so it runs as the provisioning
  // administrator, re-targeted at hanouti on the same server.
  const maintenance = readMaintenanceConfiguration();
  const seedUrl =
    flags.privileges && maintenance !== undefined
      ? deriveDatabaseUrl(maintenance.url, databaseName)
      : url;

  const result = await runSeed({
    url: seedUrl,
    seedsDir: paths.seedsDir,
    ledger,
    privileges: flags.privileges,
    dryRun: flags.dryRun,
    connectTimeoutMs,
    onEvent: (event) => {
      if (!flags.json) process.stdout.write(`  ${event.message}\n`);
    },
  });

  if (flags.json) {
    printJson({
      command: 'seed',
      candidates: result.candidates.map((file) => file.name),
      skipped: result.skipped.map((file) => file.name),
      outcomes: result.outcomes,
    });
  } else {
    for (const file of result.skipped)
      process.stdout.write(`  skipped ${file.name}${reasonForSkip(file.name, flags)}\n`);
    process.stdout.write(`\n${result.outcomes.length} seed file(s) processed\n`);
  }
  return 0;
}

async function commandStatus(
  paths: HanotiPaths,
  ledger: LedgerConfiguration,
  connectTimeoutMs: number,
  flags: Flags,
): Promise<number> {
  const { url } = readDatabaseConfiguration();
  const report = await withClient(
    url,
    async (client) => {
      const health = await healthcheck(client);
      const summary = await databaseSummary(client);
      const hasLedger = await ledgerExists(client, ledger);
      const rows = hasLedger ? await ledgerRows(client, ledger) : [];
      const files = listSqlFiles(paths.migrationsDir);
      const entries = hasLedger ? await plan(client, files, ledger, 'migration') : [];
      const pending = entries.filter((entry) => entry.state === 'pending');
      const drift = entries.filter((entry) => entry.state === 'drift');
      return { health, summary, ledgerPresent: hasLedger, rows, pending, drift, total: files.length };
    },
    { connectTimeoutMs, applicationName: 'hanouti-db-status' },
  );

  if (flags.json) {
    printJson({
      command: 'status',
      database: databaseName,
      server: report.health,
      schemas: report.summary.schemas,
      extensions: report.summary.extensions,
      ledger: {
        present: report.ledgerPresent,
        entries: report.rows.map((row) => ({
          kind: row.kind,
          filename: row.filename,
          appliedAt: row.appliedAt,
          durationMs: row.durationMs,
          appliedBy: row.appliedBy,
        })),
      },
      pending: report.pending.map((entry) => entry.file.name),
      drift: report.drift.map((entry) => entry.file.name),
    });
    return 0;
  }

  process.stdout.write(`database ${databaseName}\n`);
  process.stdout.write(
    `  server        PostgreSQL ${report.health.version} (${report.health.latencyMs} ms round trip)\n` +
      `  connected as  ${report.health.role}\n`,
  );

  process.stdout.write('\nschemas\n');
  if (report.summary.schemas.length === 0)
    process.stdout.write('  none of auth, erp, app, settings exist yet — run `migrate`\n');
  for (const schema of report.summary.schemas)
    process.stdout.write(
      `  ${schema.schema.padEnd(10)} ${String(schema.tables).padStart(3)} tables  ${String(schema.routines).padStart(3)} routines\n`,
    );

  process.stdout.write('\nextensions\n');
  for (const extension of report.summary.extensions)
    process.stdout.write(`  ${extension.name.padEnd(18)} ${extension.version} (schema ${extension.schema})\n`);

  process.stdout.write('\nledger\n');
  if (!report.ledgerPresent) process.stdout.write('  not created yet\n');
  else if (report.rows.length === 0) process.stdout.write('  empty\n');
  else
    for (const row of report.rows)
      process.stdout.write(
        `  ${row.kind.padEnd(9)} ${row.filename.padEnd(34)} ${row.appliedAt.toISOString()}  ${row.appliedBy}\n`,
      );

  process.stdout.write(
    `\nmigrations    ${report.total - report.pending.length - report.drift.length}/${report.total} up to date` +
      `${report.pending.length > 0 ? `, ${report.pending.length} pending` : ''}` +
      `${report.drift.length > 0 ? `, ${report.drift.length} drifted` : ''}\n`,
  );
  return 0;
}

async function commandCheck(
  paths: HanotiPaths,
  ledger: LedgerConfiguration,
  connectTimeoutMs: number,
  flags: Flags,
): Promise<number> {
  const { url } = readDatabaseConfiguration();
  const fixtures = readManifestsOrUndefined(paths);

  const checks = await withClient(
    url,
    async (client) => {
      const findings: Array<{ name: string; ok: boolean; detail: string }> = [];
      const health = await healthcheck(client);
      findings.push({
        name: 'connection',
        ok: health.reachable,
        detail: `PostgreSQL ${health.version} as ${health.role}`,
      });
      findings.push({
        name: 'server version',
        ok: health.versionNumber >= 140000,
        detail: health.versionNumber >= 140000 ? '14 or newer' : `too old (${health.version})`,
      });

      const summary = await databaseSummary(client);
      const vector = summary.extensions.find((extension) => extension.name === 'vector');
      findings.push({
        name: 'pgvector',
        ok: vector !== undefined,
        detail: vector === undefined ? 'extension is not installed' : `vector ${vector.version}`,
      });

      const expectedSchemas = ['auth', 'erp', 'app', 'settings'];
      const present = new Set(summary.schemas.map((schema) => schema.schema));
      const missing = expectedSchemas.filter((schema) => !present.has(schema));
      findings.push({
        name: 'business schemas',
        ok: missing.length === 0,
        detail: missing.length === 0 ? 'auth, erp, app, settings' : `missing ${missing.join(', ')}`,
      });

      if (fixtures !== undefined) {
        findings.push({
          name: 'tables',
          ok: summary.totalTables === fixtures.tables.length,
          detail: `${summary.totalTables} of ${fixtures.tables.length} declared tables`,
        });
        findings.push({
          name: 'routines',
          ok: summary.totalRoutines === fixtures.routines.length,
          detail: `${summary.totalRoutines} of ${fixtures.routines.length} declared routines`,
        });
      }

      const files = listSqlFiles(paths.migrationsDir);
      const entries = (await ledgerExists(client, ledger))
        ? await plan(client, files, ledger, 'migration')
        : files.map((file) => ({ file, state: 'pending' as const, recordedChecksum: undefined }));
      const pending = entries.filter((entry) => entry.state === 'pending');
      const drift = entries.filter((entry) => entry.state === 'drift');
      findings.push({
        name: 'migrations',
        ok: pending.length === 0 && drift.length === 0,
        detail:
          pending.length === 0 && drift.length === 0
            ? `${files.length} applied, no drift`
            : `${pending.length} pending, ${drift.length} drifted`,
      });

      return findings;
    },
    { connectTimeoutMs, applicationName: 'hanouti-db-check' },
  );

  const failed = checks.filter((check) => !check.ok);
  if (flags.json) printJson({ command: 'check', ok: failed.length === 0, checks });
  else {
    process.stdout.write('check\n');
    for (const check of checks)
      process.stdout.write(`  ${check.ok ? 'ok  ' : 'FAIL'} ${check.name.padEnd(18)} ${check.detail}\n`);
    process.stdout.write(
      failed.length === 0
        ? '\nready: the database matches the reviewed declarations\n'
        : `\n${failed.length} check(s) failed\n`,
    );
  }
  return failed.length === 0 ? 0 : 1;
}

async function commandVerify(
  paths: HanotiPaths,
  ledger: LedgerConfiguration,
  connectTimeoutMs: number,
  flags: Flags,
): Promise<number> {
  const manifests = readManifestsOrUndefined(paths);
  if (manifests === undefined) {
    process.stderr.write(
      'hanouti-db verify: the checked fixtures are unavailable. Point HANOTI_FIXTURES_DIR at\n' +
        '                  the .test/data/fixtures directory, or run `check` instead.\n',
    );
    return 1;
  }

  const { url } = readDatabaseConfiguration();
  const findings = await withClient(
    url,
    async (client) => {
      const collected: Finding[] = [];
      collected.push(...(await verifyTables(client, manifests.tables)));
      collected.push(...(await verifyRoutines(client, manifests.routines)));
      if (flags.acl) {
        const live = await routines(client);
        const grants = new Map(live.map((row) => [row.signature, row.grantedTo]));
        collected.push(...(await verifyRoutineGrants(client, manifests.routines, grants)));
      }
      return collected;
    },
    { connectTimeoutMs, applicationName: 'hanouti-db-verify' },
  );

  const summary = summarize(findings);
  if (flags.json) printJson({ command: 'verify', ...summary });
  else {
    process.stdout.write('verify: live database against the checked manifests\n');
    process.stdout.write(
      `  ${manifests.tables.length} tables, ${manifests.routines.length} routines expected\n\n`,
    );
    for (const finding of summary.errors)
      process.stdout.write(`  FAIL ${finding.object}\n       ${finding.message}\n`);
    for (const finding of summary.warnings)
      process.stdout.write(`  warn ${finding.object}\n       ${finding.message}\n`);
    process.stdout.write(
      summary.ok
        ? `\nmatch${summary.warnings.length > 0 ? ` (${summary.warnings.length} advisory difference(s))` : ''}\n`
        : `\n${summary.errors.length} structural mismatch(es)\n`,
    );
  }
  return summary.ok ? 0 : 1;
}

// ── helpers ─────────────────────────────────────────────────────────────────

function parseArgs(argv: readonly string[]): {
  command: Command;
  flags: Flags;
  error?: string;
} {
  const flags: Flags = {
    dryRun: false,
    allowModifiedSql: false,
    privileges: false,
    acl: false,
    json: false,
    help: false,
  };
  let command: Command | undefined;

  for (const arg of argv) {
    if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--allow-modified-sql') flags.allowModifiedSql = true;
    else if (arg === '--privileges') flags.privileges = true;
    else if (arg === '--acl') flags.acl = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg.startsWith('-')) return { command: 'help', flags, error: `unknown option ${arg}` };
    else if (command === undefined) {
      if (!(commands as readonly string[]).includes(arg))
        return { command: 'help', flags, error: `unknown command ${arg}` };
      command = arg as Command;
    } else return { command: 'help', flags, error: `unexpected argument ${arg}` };
  }

  return { command: command ?? 'help', flags };
}

function readManifestHashes(paths: HanotiPaths): Record<string, string> | undefined {
  return readManifestsOrUndefined(paths)?.files;
}

function readManifestsOrUndefined(paths: HanotiPaths) {
  const fixturesDir = paths.fixturesDir;
  if (fixturesDir === undefined) return undefined;
  try {
    return loadManifests(fixturesDir);
  } catch {
    return undefined;
  }
}

function pendingCount(entries: readonly PlanEntry[]): number {
  return entries.filter((entry) => entry.state === 'pending').length;
}

function reasonForSkip(name: string, flags: Flags): string {
  if (name === '000_create_database.sql') return ' (provisioning — handled by `setup`)';
  if (name.includes('privileges') && !flags.privileges) return ' (opt-in — pass --privileges)';
  return '';
}

function printSteps(steps: readonly SetupStep[]): void {
  for (const step of steps)
    process.stdout.write(
      `  ${statusLabel(step.status).padEnd(5)} ${step.step.padEnd(22)} ${step.detail}\n`,
    );
}

function statusLabel(status: SetupStep['status']): string {
  return status === 'failed' ? 'FAIL' : status === 'warning' ? 'warn' : status === 'skipped' ? 'skip' : 'ok';
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function usage(): string {
  return `hanouti-db — provisioning, migrations and inspection for the ${databaseName} database

Usage
  hanouti-db <command> [options]

Commands
  help      this text
  setup     create ${databaseName} when absent, check server prerequisites
  migrate   apply migrations/hanouti/*.sql in order (ledger-tracked)
  seed      apply the optional seed SQL
  status    read-only report: connection, ledger, schemas, extensions
  check     fast readiness test for deployments; non-zero exit on failure
  verify    compare the live database with the checked manifests

Options
  --dry-run             report what would change, change nothing
  --allow-modified-sql  apply migrations whose hash differs from the manifest
  --privileges          seed: include the restricted-role privileges SQL
  --acl                 verify: also compare routine grants with the manifest
  --json                machine-readable output
  -h, --help            this text

Environment
  DATABASE_URL          required — postgresql://…@host:5432/${databaseName}
  ADMIN_DATABASE_URL    setup — CREATEDB role on a maintenance database
  HANOTI_DB_OWNER       owner for a newly created database (default: DATABASE_URL role)
  HANOTI_DATA_DIR       hanouti/data directory (default: discovered from this package)
  HANOTI_FIXTURES_DIR   .test/data/fixtures (default: discovered from this package)
  HANOTI_LEDGER_SCHEMA  ledger schema (default: public)
  HANOTI_LEDGER_TABLE   ledger table (default: migration_ledger)
  HANOTI_CONNECT_TIMEOUT_MS  connection timeout (default: 10000)

Connection strings are read from the environment only, so they never appear in
shell history. The CLI never loads .env itself; use Node's loader:

  node --env-file=.env dist/cli.js setup
  node --env-file=.env dist/cli.js migrate
  node --env-file=.env dist/cli.js check
`;
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'unexpected failure';
    process.stderr.write(`hanouti-db: ${message}\n`);
    process.exitCode = 1;
  });
