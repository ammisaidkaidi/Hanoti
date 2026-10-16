/**
 * `migrate` — apply the eleven reviewed migrations in order.
 *
 * The runner reads `migrations/hanouti/*.sql` in filename order, refuses files
 * that no longer match the reviewed manifest hashes, skips files already in the
 * ledger and aborts on drift.
 */
import { withClient } from './helpers/connections.js';
import { listSqlFiles, type SqlFile } from './sql-files.js';
import {
  apply,
  ensureLedger,
  plan,
  type ApplyOutcome,
  type PlanEntry,
  type RunnerEvent,
} from './runner.js';
import type { LedgerConfiguration } from './config.js';

export interface MigrateInput {
  url: string;
  migrationsDir: string;
  ledger: LedgerConfiguration;
  manifestHashes?: Readonly<Record<string, string>> | undefined;
  allowModifiedSql?: boolean;
  dryRun?: boolean;
  connectTimeoutMs?: number | undefined;
  onEvent?: ((event: RunnerEvent) => void) | undefined;
}

export interface MigrateResult {
  plan: PlanEntry[];
  outcomes: ApplyOutcome[];
}

export async function runMigrate(input: MigrateInput): Promise<MigrateResult> {
  const files = listSqlFiles(input.migrationsDir);
  if (files.length === 0)
    throw new Error(`No migration files found in ${input.migrationsDir}.`);

  return withClient(
    input.url,
    async (client) => {
      // The ledger is created before planning so the plan reflects this database.
      await ensureLedger(client, input.ledger);
      const entries = await plan(client, files, input.ledger, 'migration');
      const outcomes = await apply(client, files, {
        kind: 'migration',
        ledger: input.ledger,
        manifestHashes: input.manifestHashes,
        allowModifiedSql: input.allowModifiedSql,
        dryRun: input.dryRun,
        onEvent: input.onEvent,
      });
      return { plan: entries, outcomes };
    },
    { connectTimeoutMs: input.connectTimeoutMs, applicationName: 'hanouti-db-migrate' },
  );
}

/** Files in the migrations directory, without touching the database. */
export function listMigrations(migrationsDir: string): SqlFile[] {
  return listSqlFiles(migrationsDir);
}
