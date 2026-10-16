/**
 * Public API for the hanouti database package.
 *
 * Everything is explicit: importing this module never opens a connection and
 * never touches the file system. The CLI is a thin wrapper over these exports.
 */
export { databaseName, parseDatabaseUrl, type ConnectionConsumer } from './connection-policy.js';
export {
  readConnectTimeoutMs,
  readDatabaseConfiguration,
  readDatabaseOwner,
  readLedgerConfiguration,
  readMaintenanceConfiguration,
  type DatabaseConfiguration,
  type LedgerConfiguration,
  type MaintenanceConfiguration,
} from './config.js';
export { resolveHanotiPaths, isFile, type HanotiPaths } from './paths.js';
export { findHashMismatches, listSqlFiles, readSqlFile, sha256, type SqlFile } from './sql-files.js';
export {
  apply,
  ensureLedger,
  isUpToDate,
  plan,
  readLedger,
  type ApplyOptions,
  type ApplyOutcome,
  type LedgerKind,
  type LedgerRow,
  type PlanEntry,
  type PlanState,
  type RunnerEvent,
} from './runner.js';
export { listMigrations, runMigrate, type MigrateInput, type MigrateResult } from './migrate.js';
export { runSeed, selectSeeds, type SeedInput, type SeedResult } from './seed.js';
export { runSetup, type SetupInput, type SetupStep, type StepStatus } from './setup.js';
export {
  businessSchemas,
  clientConfigFromUrl,
  databaseSummary,
  extensions,
  healthcheck,
  ledgerExists,
  ledgerRows,
  loadManifests,
  routines,
  schemaSummary,
  serverIdentity,
  summarize,
  verifyRoutineGrants,
  verifyRoutines,
  verifyTables,
  withClient,
  type ColumnExpectation,
  type ConnectionHealth,
  type DatabaseSummary,
  type Finding,
  type FindingSummary,
  type ManifestSet,
  type RoutineExpectation,
  type RoutineRow,
  type SchemaSummary,
  type ServerIdentity,
  type TableExpectation,
} from './helpers/index.js';
