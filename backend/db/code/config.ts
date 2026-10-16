/**
 * Environment reading for every command and helper. No I/O, no .env loading,
 * no connection: this module only turns process environment into validated
 * configuration objects, matching the `@app/data` convention that the caller
 * decides how secrets are loaded.
 */
import { parseDatabaseUrl } from './connection-policy.js';

/** The validated application target: always the hanouti database. */
export interface DatabaseConfiguration {
  url: string;
}

/**
 * The maintenance target used for provisioning. Provisioning talks to a
 * different database on purpose, so the shared hanouti-only policy cannot be
 * reused here; this parser keeps the same discipline (fixed error message, no
 * causes, no TLS-value interpretation) while allowing a maintenance database.
 */
export interface MaintenanceConfiguration {
  url: string;
  database: string;
  role: string;
}

export interface LedgerConfiguration {
  schema: string;
  table: string;
}

const tlsQueryKeys = new Set(['sslmode', 'sslrootcert', 'sslcert', 'sslkey']);
const identifier = /^[a-z_][a-z0-9_]*$/;

/**
 * Read `DATABASE_URL` and validate it targets hanouti.
 * Throws without echoing the value: URLs carry credentials.
 */
export function readDatabaseConfiguration(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseConfiguration {
  const value = env.DATABASE_URL;
  if (!value) throw new Error('DATABASE_URL must be set to the hanouti PostgreSQL connection URL.');
  parseDatabaseUrl(value, 'libpq');
  return { url: value };
}

/**
 * Validate a maintenance URL: PostgreSQL, host present, no fragment, TLS-only
 * query keys, and a target other than hanouti. The last rule is the whole point
 * of this parser — provisioning must not accidentally run against the
 * application database, where CREATE DATABASE cannot succeed anyway.
 *
 * Exported so connection helpers can ask for a maintenance target explicitly
 * instead of relaxing the shared hanouti-only policy.
 */
export function parseMaintenanceUrl(value: string): URL {
  try {
    const url = new URL(value);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.hash)
      throw new Error();
    const database = decodeURIComponent(url.pathname.slice(1));
    if (!database) throw new Error();
    if (database === 'hanouti')
      throw new Error(
        'ADMIN_DATABASE_URL must target a maintenance database such as postgres, not hanouti.',
      );
    for (const key of url.searchParams.keys()) {
      if (!tlsQueryKeys.has(key) && key !== 'connect_timeout') throw new Error();
    }
    return url;
  } catch (error) {
    // Re-raise our own explanatory error, otherwise keep the fixed message.
    if (error instanceof Error && error.message.startsWith('ADMIN_DATABASE_URL must target'))
      throw error;
    throw new Error('Invalid PostgreSQL maintenance URL.');
  }
}

/**
 * Read `ADMIN_DATABASE_URL` — a CREATEDB role on a maintenance database.
 * Returns undefined when unset so callers can degrade with a clear message.
 */
export function readMaintenanceConfiguration(
  env: NodeJS.ProcessEnv = process.env,
): MaintenanceConfiguration | undefined {
  const value = env.ADMIN_DATABASE_URL;
  if (!value) return undefined;
  const url = parseMaintenanceUrl(value);
  return {
    url: value,
    database: decodeURIComponent(url.pathname.slice(1)),
    role: decodeURIComponent(url.username),
  };
}

/**
 * Re-target a maintenance URL at the hanouti database on the same server, for
 * the one operation that needs provisioning rights *inside* hanouti: the
 * privileges seed, which creates PostgreSQL roles and transfers routine
 * ownership. The derived URL is validated by the shared policy, so it can only
 * ever point at hanouti.
 */
export function deriveDatabaseUrl(maintenanceUrl: string, database: string): string {
  const url = parseMaintenanceUrl(maintenanceUrl);
  url.pathname = `/${database}`;
  const derived = url.toString();
  parseDatabaseUrl(derived, 'libpq');
  return derived;
}

/** Ledger location. Lives in public because `public` holds no business tables. */
export function readLedgerConfiguration(
  env: NodeJS.ProcessEnv = process.env,
): LedgerConfiguration {
  return {
    schema: readIdentifier(env.HANOTI_LEDGER_SCHEMA, 'public', 'HANOTI_LEDGER_SCHEMA'),
    table: readIdentifier(env.HANOTI_LEDGER_TABLE, 'migration_ledger', 'HANOTI_LEDGER_TABLE'),
  };
}

/** Connection timeout shared by every helper. */
export function readConnectTimeoutMs(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.HANOTI_CONNECT_TIMEOUT_MS;
  if (raw === undefined || raw === '') return 10_000;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0)
    throw new Error('HANOTI_CONNECT_TIMEOUT_MS must be a positive integer.');
  return value;
}

/** Optional owner for a newly created database. */
export function readDatabaseOwner(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const raw = env.HANOTI_DB_OWNER;
  if (raw === undefined || raw === '') return undefined;
  return raw;
}

function readIdentifier(value: string | undefined, fallback: string, label: string): string {
  const resolved = value === undefined || value === '' ? fallback : value;
  if (!identifier.test(resolved))
    throw new Error(`${label} must be a lowercase SQL identifier such as ${fallback}.`);
  return resolved;
}
