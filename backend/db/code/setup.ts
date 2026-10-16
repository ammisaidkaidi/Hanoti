/**
 * Database provisioning.
 *
 * `setup` performs exactly what the hanouti documentation assigns to
 * provisioning, and nothing else:
 *   1. checks the server can host the schema (PostgreSQL 14+, pgvector present),
 *   2. creates the `hanouti` database when it is absent, leaving an existing
 *      database untouched — the equivalent of seeds/000_create_database.sql,
 *      which stays psql-only because it uses \gexec,
 *   3. checks the application role can build the schemas afterwards.
 *
 * It never creates tables: the four schemas and the vector extension belong to
 * migration 001, which stays in the reviewed SQL history.
 */
import { withClient } from './helpers/connections.js';

export type StepStatus = 'ok' | 'created' | 'skipped' | 'failed' | 'warning';

export interface SetupStep {
  step: string;
  status: StepStatus;
  detail: string;
}

export interface SetupInput {
  adminUrl: string;
  appUrl?: string | undefined;
  owner?: string | undefined;
  databaseName: string;
  connectTimeoutMs?: number | undefined;
  dryRun?: boolean;
}

const minimumServerVersion = 140000;
const identifier = /^[a-z_][a-z0-9_]*$/;

export async function runSetup(input: SetupInput): Promise<SetupStep[]> {
  const steps: SetupStep[] = [];

  steps.push(...(await checkServer(input)));
  const database = await ensureDatabase(input);
  steps.push(database.step);

  if (input.appUrl === undefined) return steps;
  if (!database.ready) {
    steps.push({
      step: 'database.access',
      status: 'skipped',
      detail: 'not checked: the database does not exist yet',
    });
    return steps;
  }
  steps.push(await checkApplicationAccess(input));
  steps.push(await checkVectorExtension(input));
  return steps;
}

/**
 * pgvector is declared by migration 001, but it is not a trusted extension, so
 * only a superuser can install it. Rather than installing it implicitly — the
 * reviewed SQL owns that statement — report the one-time step when the
 * application role cannot perform it.
 */
async function checkVectorExtension(input: SetupInput): Promise<SetupStep> {
  const appUrl = input.appUrl;
  if (appUrl === undefined) throw new Error('unreachable');
  return withClient(
    appUrl,
    async (client) => {
      const installed = await client.query<{ present: boolean }>(
        `SELECT true AS present FROM pg_extension WHERE extname = 'vector'`,
      );
      if (installed.rows.length > 0)
        return { step: 'database.extension', status: 'ok', detail: 'pgvector is installed' };

      const role = await client.query<{ superuser: boolean }>(
        'SELECT rolsuper AS superuser FROM pg_roles WHERE rolname = current_user',
      );
      if (role.rows[0]?.superuser === true)
        return {
          step: 'database.extension',
          status: 'ok',
          detail: 'pgvector is not installed yet; migration 001 will create it',
        };

      return {
        step: 'database.extension',
        status: 'warning',
        detail:
          'pgvector is not installed and this role cannot install it (not a trusted extension).\n' +
          '       As a superuser, once per database:\n' +
          "         psql \"$DATABASE_URL\" -c 'CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;'\n" +
          '       Migration 001 then records it as already present and proceeds.',
      };
    },
    { connectTimeoutMs: input.connectTimeoutMs, applicationName: 'hanouti-db-setup' },
  );
}

async function checkServer(input: SetupInput): Promise<SetupStep[]> {
  return withClient(
    input.adminUrl,
    async (client) => {
      const server = await client.query<{ num: number; version: string }>(
        'SELECT current_setting(\'server_version_num\')::int AS num, version() AS version',
      );
      const row = server.rows[0];
      const version = row?.num ?? 0;
      const steps: SetupStep[] = [
        {
          step: 'server.version',
          status: version >= minimumServerVersion ? 'ok' : 'failed',
          detail:
            version >= minimumServerVersion
              ? (row?.version ?? '').split(' ').slice(0, 2).join(' ')
              : `PostgreSQL ${version} is too old; the declarations target 14 or newer.`,
        },
      ];

      const extension = await client.query<{ present: boolean; version: string | null }>(
        `SELECT true AS present,
                (SELECT default_version FROM pg_available_extensions WHERE name = 'vector') AS version
           FROM pg_available_extensions
          WHERE name = 'vector'`,
      );
      const extensionRow = extension.rows[0];
      steps.push({
        step: 'server.pgvector',
        status: extensionRow === undefined ? 'failed' : 'ok',
        detail:
          extensionRow === undefined
            ? 'pgvector is not installed on this server. Install it before applying migration 001.'
            : `available, default version ${extensionRow.version ?? 'unknown'}`,
      });

      return steps;
    },
    {
      connectTimeoutMs: input.connectTimeoutMs,
      applicationName: 'hanouti-db-setup',
      target: 'maintenance',
    },
  );
}

async function ensureDatabase(
  input: SetupInput,
): Promise<{ step: SetupStep; ready: boolean }> {
  return withClient(
    input.adminUrl,
    async (client) => {
      const existing = await client.query<{ exists: boolean; owner: string | null }>(
        `SELECT true AS exists, pg_get_userbyid(datdba) AS owner
           FROM pg_database WHERE datname = $1`,
        [input.databaseName],
      );
      const row = existing.rows[0];

      if (row !== undefined) {
        return {
          ready: true,
          step: {
            step: `database.${input.databaseName}`,
            status: 'skipped',
            detail: `already exists, owner ${row.owner ?? 'unknown'} — left untouched`,
          },
        };
      }

      if (input.dryRun === true)
        return {
          ready: false,
          step: {
            step: `database.${input.databaseName}`,
            status: 'skipped',
            detail: `dry run: would create ${input.databaseName}`,
          },
        };

      const owner = resolveOwner(input);
      const statement =
        owner === undefined
          ? `CREATE DATABASE "${input.databaseName}"`
          : `CREATE DATABASE "${input.databaseName}" OWNER "${owner}"`;

      // CREATE DATABASE cannot run inside a transaction; a single query is fine.
      try {
        await client.query(statement);
      } catch (error) {
        throw new Error(explainCreateFailure(error, owner, input.databaseName));
      }
      return {
        ready: true,
        step: {
          step: `database.${input.databaseName}`,
          status: 'created',
          detail: owner === undefined ? 'created' : `created, owner ${owner}`,
        },
      };
    },
    {
      connectTimeoutMs: input.connectTimeoutMs,
      applicationName: 'hanouti-db-setup',
      target: 'maintenance',
    },
  );
}

async function checkApplicationAccess(input: SetupInput): Promise<SetupStep> {
  const appUrl = input.appUrl;
  if (appUrl === undefined) throw new Error('unreachable');
  return withClient(
    appUrl,
    async (client) => {
      const result = await client.query<{
        database: string;
        role: string;
        can_create_schema: boolean;
        can_create_in_public: boolean;
      }>(
        `SELECT current_database() AS database,
                current_user AS role,
                has_database_privilege(current_user, current_database(), 'CREATE') AS can_create_schema,
                has_schema_privilege(current_user, 'public', 'CREATE') AS can_create_in_public`,
      );
      const row = result.rows[0];
      if (row === undefined)
        return { step: 'database.access', status: 'failed', detail: 'no result from the server' };

      const ready = row.can_create_schema && row.can_create_in_public;
      return {
        step: 'database.access',
        status: ready ? 'ok' : 'warning',
        detail: ready
          ? `${row.role} on ${row.database} can create the four schemas`
          : `${row.role} on ${row.database} cannot create schemas or the vector extension; make it the database owner before migrating`,
      };
    },
    { connectTimeoutMs: input.connectTimeoutMs, applicationName: 'hanouti-db-setup' },
  );
}

/**
 * Turn PostgreSQL's membership error into the one statement that fixes it.
 * Creating a database owned by another role requires membership in that role.
 */
function explainCreateFailure(
  error: unknown,
  owner: string | undefined,
  database: string,
): string {
  const message = error instanceof Error ? error.message : 'unknown driver error';
  if (owner !== undefined && message.includes('SET ROLE'))
    return (
      `The provisioning role cannot create ${database} owned by ${owner}: it is not a member of that role.\n` +
      `       Grant it with:  GRANT ${owner} TO <provisioning role>;\n` +
      '       (run as a superuser or as a role that can grant membership), then run setup again.'
    );
  return `Could not create ${database}: ${message}`;
}

function resolveOwner(input: SetupInput): string | undefined {
  const owner = input.owner ?? roleFromUrl(input.appUrl);
  if (owner === undefined) return undefined;
  if (!identifier.test(owner))
    throw new Error('The database owner must be a lowercase SQL identifier.');
  return owner;
}

function roleFromUrl(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const username = new URL(value).username;
  return username === '' ? undefined : decodeURIComponent(username);
}
