/**
 * `seed` — apply the optional seed SQL.
 *
 * seeds/000_create_database.sql is provisioning and is handled by `setup`; it
 * uses \gexec and is psql-only. The remaining seeds are recorded in the same
 * ledger under the `seed` kind, so re-running is safe. The privileges seed
 * creates restricted PostgreSQL roles and is therefore opt-in.
 */
import type { LedgerConfiguration } from './config.js';
import { withClient } from './helpers/connections.js';
import { apply, type ApplyOutcome, type RunnerEvent } from './runner.js';
import { listSqlFiles, type SqlFile } from './sql-files.js';

export interface SeedInput {
  url: string;
  seedsDir: string;
  ledger: LedgerConfiguration;
  /** Include the privileges seed that creates restricted roles. */
  privileges?: boolean;
  dryRun?: boolean;
  connectTimeoutMs?: number | undefined;
  onEvent?: ((event: RunnerEvent) => void) | undefined;
}

export interface SeedResult {
  candidates: SqlFile[];
  skipped: SqlFile[];
  outcomes: ApplyOutcome[];
}

const provisioning = '000_create_database.sql';
const privilegesMarker = 'privileges';

export function selectSeeds(seedsDir: string, privileges: boolean): { selected: SqlFile[]; skipped: SqlFile[] } {
  const all = listSqlFiles(seedsDir);
  const skipped: SqlFile[] = [];
  const selected: SqlFile[] = [];

  for (const file of all) {
    if (file.name === provisioning) {
      skipped.push(file);
      continue;
    }
    if (file.name.includes(privilegesMarker) && !privileges) {
      skipped.push(file);
      continue;
    }
    selected.push(file);
  }
  return { selected, skipped };
}

export async function runSeed(input: SeedInput): Promise<SeedResult> {
  const { selected, skipped } = selectSeeds(input.seedsDir, input.privileges === true);

  if (selected.length === 0) return { candidates: [], skipped, outcomes: [] };

  const outcomes = await withClient(
    input.url,
    (client) =>
      apply(client, selected, {
        kind: 'seed',
        ledger: input.ledger,
        dryRun: input.dryRun,
        onEvent: input.onEvent,
      }),
    { connectTimeoutMs: input.connectTimeoutMs, applicationName: 'hanouti-db-seed' },
  );

  return { candidates: selected, skipped, outcomes };
}
