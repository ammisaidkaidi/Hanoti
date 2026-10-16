/**
 * Read-only inspection helpers.
 *
 * Everything here is a query against the catalog: no DDL, no writes, and no
 * assumption about which objects exist. Counts are reported as they are found.
 */
import type { Client } from 'pg';
import type { LedgerConfiguration } from '../config.js';
import type { LedgerRow, LedgerKind } from '../runner.js';
import { readLedger } from '../runner.js';
import { normalizeTypeName } from './verify.js';

/** The four business schemas. `public` holds the pgvector type only. */
export const businessSchemas = ['auth', 'erp', 'app', 'settings'] as const;
export type BusinessSchema = (typeof businessSchemas)[number];

export interface ServerIdentity {
  version: string;
  versionNumber: number;
  database: string;
  role: string;
  latencyMs: number;
}

export interface ConnectionHealth extends ServerIdentity {
  /** True when a trivial query succeeded. */
  reachable: boolean;
}

export interface SchemaSummary {
  schema: string;
  tables: number;
  views: number;
  routines: number;
}

export interface ExtensionSummary {
  name: string;
  version: string;
  schema: string;
}

export interface DatabaseSummary {
  schemas: SchemaSummary[];
  extensions: ExtensionSummary[];
  totalTables: number;
  totalRoutines: number;
}

/** Identity plus latency; throws if the database cannot be reached. */
export async function serverIdentity(client: Client): Promise<ServerIdentity> {
  const started = performance.now();
  const result = await client.query<{
    version: string;
    num: number;
    database: string;
    role: string;
  }>(
    `SELECT current_setting('server_version') AS version,
            current_setting('server_version_num')::int AS num,
            current_database() AS database,
            current_user AS role`,
  );
  const latencyMs = Math.round(performance.now() - started);
  const row = result.rows[0];
  if (row === undefined) throw new Error('The server returned no identity row.');
  return {
    version: row.version,
    versionNumber: row.num,
    database: row.database,
    role: row.role,
    latencyMs,
  };
}

/** Non-throwing reachability probe, for status screens and health checks. */
export async function healthcheck(client: Client): Promise<ConnectionHealth> {
  const started = performance.now();
  const identity = await serverIdentity(client);
  await client.query('SELECT 1');
  return { ...identity, reachable: true, latencyMs: Math.round(performance.now() - started) };
}

/** Table, view and routine counts for the four business schemas. */
export async function schemaSummary(client: Client): Promise<SchemaSummary[]> {
  const result = await client.query<{
    schema: string;
    tables: string;
    views: string;
    routines: string;
  }>(
    `SELECT n.nspname AS schema,
            count(*) FILTER (WHERE c.relkind = 'r')::text AS tables,
            count(*) FILTER (WHERE c.relkind = 'v')::text AS views,
            (SELECT count(*) FROM pg_proc p WHERE p.pronamespace = n.oid)::text AS routines
       FROM pg_namespace n
       LEFT JOIN pg_class c ON c.relnamespace = n.oid
      WHERE n.nspname = ANY($1::text[])
      GROUP BY n.oid, n.nspname
      ORDER BY n.nspname`,
    [businessSchemas],
  );
  return result.rows.map((row) => ({
    schema: row.schema,
    tables: Number.parseInt(row.tables, 10),
    views: Number.parseInt(row.views, 10),
    routines: Number.parseInt(row.routines, 10),
  }));
}

/** Installed extensions, with the schema each one lives in. */
export async function extensions(client: Client): Promise<ExtensionSummary[]> {
  const result = await client.query<{ name: string; version: string; schema: string }>(
    `SELECT e.extname AS name, e.extversion AS version, n.nspname AS schema
       FROM pg_extension e
       JOIN pg_namespace n ON n.oid = e.extnamespace
      ORDER BY e.extname`,
  );
  return result.rows.map((row) => ({ name: row.name, version: row.version, schema: row.schema }));
}

/** Everything a status screen needs, in one round trip set. */
export async function databaseSummary(client: Client): Promise<DatabaseSummary> {
  const [schemas, installed] = await Promise.all([schemaSummary(client), extensions(client)]);
  return {
    schemas,
    extensions: installed,
    totalTables: schemas.reduce((total, entry) => total + entry.tables, 0),
    totalRoutines: schemas.reduce((total, entry) => total + entry.routines, 0),
  };
}

/** Routines declared by the migrations, as the database sees them. */
export interface RoutineRow {
  schema: string;
  name: string;
  signature: string;
  /** Roles other than the owner that hold EXECUTE. Empty means owner-only. */
  grantedTo: string[];
}

export async function routines(client: Client): Promise<RoutineRow[]> {
  const result = await client.query<{
    schema: string;
    name: string;
    args: string[];
    granted_to: string[];
  }>(
    `SELECT n.nspname AS schema,
            p.proname AS name,
            coalesce(
              array_agg(format_type(argument, NULL) ORDER BY position)
                FILTER (WHERE argument IS NOT NULL),
              '{}'::text[]
            ) AS args,
            coalesce(
              (
                SELECT array_agg(grantee.rolname ORDER BY grantee.rolname)
                  FROM aclexplode(p.proacl) AS acl
                  JOIN pg_roles grantee ON grantee.oid = acl.grantee
                 WHERE acl.privilege_type = 'EXECUTE'
                   AND acl.grantee <> p.proowner
              ),
              '{}'::name[]
            )::text[] AS granted_to
       FROM pg_proc p
       JOIN pg_namespace n ON n.oid = p.pronamespace
       LEFT JOIN LATERAL unnest(p.proargtypes::oid[]) WITH ORDINALITY AS args(argument, position)
         ON true
      WHERE n.nspname = ANY($1::text[])
      GROUP BY n.oid, p.oid, n.nspname, p.proname, p.proacl
      ORDER BY n.nspname, p.proname`,
    [businessSchemas],
  );

  return result.rows.map((row) => {
    const normalized = row.args.map((argument) => {
      const array = argument.endsWith('[]');
      const base = array ? argument.slice(0, -2) : argument;
      return `${normalizeTypeName(base)}${array ? '[]' : ''}`;
    });
    const signature = `${row.schema}.${row.name}(${normalized.join(', ')})`;
    return {
      schema: row.schema,
      name: row.name,
      signature,
      grantedTo: row.granted_to,
    };
  });
}

/** Ledger contents for one kind, or both when no kind is given. */
export async function ledgerRows(
  client: Client,
  ledger: LedgerConfiguration,
  kind?: LedgerKind,
): Promise<Array<LedgerRow & { kind: string }>> {
  if (kind !== undefined) {
    const rows = await readLedger(client, ledger, kind);
    return rows.map((row) => ({ ...row, kind }));
  }
  const kinds: LedgerKind[] = ['migration', 'seed'];
  const collected: Array<LedgerRow & { kind: string }> = [];
  for (const current of kinds) {
    const rows = await readLedger(client, ledger, current);
    collected.push(...rows.map((row) => ({ ...row, kind: current })));
  }
  return collected;
}

/** True when the ledger table itself exists. */
export async function ledgerExists(
  client: Client,
  ledger: LedgerConfiguration,
): Promise<boolean> {
  const result = await client.query<{ present: boolean }>(
    `SELECT true AS present
       FROM information_schema.tables
      WHERE table_schema = $1 AND table_name = $2`,
    [ledger.schema, ledger.table],
  );
  return result.rows.length > 0;
}
