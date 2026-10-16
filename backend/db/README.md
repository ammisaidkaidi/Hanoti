# hanouti-db

Provisioning, migration and inspection helpers for the **hanouti** PostgreSQL database.

This package owns the operational half of the database lifecycle that the hanouti
documentation deliberately leaves to "your chosen migration runner": it creates the
database when it is absent, applies the eleven reviewed SQL migrations in order, records
what has been applied, and checks that the live database still matches the declarations
that were reviewed.

It never writes SQL of its own into your schema. Every object in `auth`, `erp`, `app` and
`settings` comes from `hanoti/data/migrations/hanouti/*.sql`, executed verbatim.

```text
db/
├── code/
│   ├── cli.ts                 Command line: setup, migrate, seed, status, check, verify
│   ├── connection-policy.ts   Copy of the shared @app/data URL policy (parity-tested)
│   ├── config.ts              Environment → validated configuration, no I/O
│   ├── paths.ts               Locate hanoti/data and .test/data/fixtures
│   ├── sql-files.ts           Discovery, ordering and SHA-256 of the reviewed SQL
│   ├── runner.ts              Ledger, plan and apply with drift detection
│   ├── setup.ts               Provisioning only: server checks and CREATE DATABASE
│   ├── migrate.ts             Apply migrations 001…011
│   ├── seed.ts                Apply the optional seed SQL
│   └── helpers/               connections · inspect · verify
└── test/
    └── connection-policy.parity.mjs
```

## Quick start

```sh
npm install                   # pnpm install works too
npm run build

cp .env.example .env          # then fill in real values; .env is gitignored
node --env-file=.env dist/cli.js setup
node --env-file=.env dist/cli.js migrate
node --env-file=.env dist/cli.js status
node --env-file=.env dist/cli.js check
```

`npm run help` prints the same commands and every environment variable.

## Commands

| Command   | What it does                                                                       | Writes?             |
| --------- | ---------------------------------------------------------------------------------- | ------------------- |
| `help`    | Usage, options and environment                                                     | no                  |
| `setup`   | Server prerequisites (`PostgreSQL ≥ 14`, pgvector), creates `hanouti` if absent     | `CREATE DATABASE`   |
| `migrate` | Applies `migrations/hanouti/*.sql` in filename order through the ledger             | yes                 |
| `seed`    | Applies the optional seed SQL; privileges seed only with `--privileges`            | yes                 |
| `status`  | Connection, ledger contents, schema counts, extensions, pending/drifted migrations  | no                  |
| `check`   | Fast production readiness test; exits non-zero on failure                          | no                  |
| `verify`  | Compares the live database against the checked manifests                           | no                  |

Options: `--dry-run`, `--allow-modified-sql`, `--privileges`, `--acl`, `--json`.

Exit codes: `0` success, `1` failure or failed check, `2` usage error — so `check` and
`verify` drop straight into a deployment gate or a CI step.

## Two identities, on purpose

The hanouti documentation asks for application credentials separate from provisioning and
backup credentials, and this package keeps that split:

| Variable              | Purpose                                                            | Needs                   |
| --------------------- | ------------------------------------------------------------------ | ----------------------- |
| `DATABASE_URL`        | Everything except provisioning; must target `/hanouti`             | schema owner            |
| `ADMIN_DATABASE_URL`  | `setup` only, to create the database when it is absent             | `CREATEDB` on a maintenance db |

`setup` connects with the maintenance URL and creates the database **owned by the role in
`DATABASE_URL`**, so the application identity can create the schemas and the extension
during `migrate` without superuser rights. The provisioning role therefore has to be a
member of the owning role:

```sql
GRANT hanouti_app TO hanouti_provisioner;
```

Connection strings are read from the environment only — never from arguments — so they do
not appear in shell history or in `ps` output. The CLI never loads `.env` by itself: use
Node's own loader (`node --env-file=.env dist/cli.js …`) or your secret manager. Nothing
here logs a URL, a password or a certificate path.

## Setup, migrate, seed: what belongs where

The split follows the reviewed SQL files rather than inventing a new one:

- `seeds/000_create_database.sql` is **provisioning**. It uses `\gexec` and is psql-only,
  so `setup` performs the equivalent: check `pg_database`, then `CREATE DATABASE hanouti`
  if it is missing. An existing database is reported and left untouched.
- `migrations/hanouti/001_schemas.sql` owns the four schemas and the pgvector extension.
  `setup` therefore creates no schema: that would move reviewed DDL out of the history.
- `seeds/010_…catalog.sql` and `seeds/020_…privileges.sql` are optional. The catalog runs
  with `seed`. The privileges file creates three `NOLOGIN` PostgreSQL roles, transfers
  routine ownership and grants `EXECUTE` to `hanouti_backend`; it runs only with
  `seed --privileges`, and because it needs global rights it runs as the **provisioning
  administrator** — `ADMIN_DATABASE_URL` with the database name replaced by `hanouti` —
  rather than as the application role. Without that variable it uses `DATABASE_URL` and
  reports exactly which privilege is missing.

### One-time superuser step: pgvector

`vector` is not a *trusted* extension, so PostgreSQL only lets a superuser install it, and
this project keeps `installExtensions` disabled and the extension declaration inside
migration 001. The first run therefore reports it rather than working around it:

```text
warn  database.extension  pgvector is not installed and this role cannot install it
                          (not a trusted extension).
```

Run the documented step once per database, as a superuser, then migrate:

```sh
psql "$DATABASE_URL" -c 'CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;'
```

Migration 001 then finds the extension present, records it and continues; a failed migrate
also prints this same instruction.

## The ledger

One table records what has been applied, for migrations and seeds:

```sql
public.migration_ledger(kind, filename, checksum, applied_at, duration_ms, applied_by)
```

It lives in `public` because `public` holds no business tables in this design; move it with
`HANOTI_LEDGER_SCHEMA` and `HANOTI_LEDGER_TABLE` if you prefer otherwise. It gives you:

- **Idempotence** — applied files are skipped, so re-running `migrate` is safe.
- **Drift detection** — a file whose checksum differs from the ledger is *refused*, with a
  message telling you to write a follow-up migration instead of editing applied history.
- **Manifest enforcement** — before applying anything, `migrate` compares each file's
  SHA-256 with `schema-manifest.json` (`files`). SQL that changed after review does not
  run. Override deliberately with `--allow-modified-sql`.
- **Audit** — `applied_at`, `duration_ms` and `applied_by` show who applied what, and when.

## Helpers

Everything the CLI does is available as an importable API; importing opens no connection.

```ts
import {
  withClient,
  healthcheck,
  databaseSummary,
  routines,
  loadManifests,
  verifyTables,
  verifyRoutines,
  summarize,
  runMigrate,
  runSetup,
  plan,
  isUpToDate,
} from 'hanouti-db';

await withClient(url, async (client) => {
  const health = await healthcheck(client);        // version, role, latency, reachable
  const summary = await databaseSummary(client);   // schemas, tables, routines, extensions
  const declared = await routines(client);         // signatures + granted roles
});
```

| Helper                                     | Returns                                                     |
| ------------------------------------------ | ----------------------------------------------------------- |
| `withClient(url, fn, options)`             | Runs `fn` with a connected client, always closing it        |
| `healthcheck(client)`                      | `reachable`, server version, role, round-trip latency       |
| `serverIdentity(client)`                   | Version, version number, database, role, latency            |
| `schemaSummary(client)`                    | Tables, views and routines per business schema              |
| `extensions(client)`                       | Installed extensions with their schema                      |
| `databaseSummary(client)`                  | All of the above in one object                              |
| `routines(client)`                         | Routine signatures and the roles holding `EXECUTE`          |
| `ledgerRows(client, ledger, kind?)`        | Ledger contents                                            |
| `ledgerExists(client, ledger)`             | Whether the ledger table exists                            |
| `plan(client, files, ledger, kind)`        | `pending` · `applied` · `drift` per file                   |
| `isUpToDate(client, files, ledger, kind)`  | `true` when nothing is pending or drifted                   |
| `loadManifests(fixturesDir)`               | Tables, routines and file hashes from the checked fixtures  |
| `verifyTables(client, tables)`             | Column-level findings against the manifest                  |
| `verifyRoutines(client, routines)`         | Missing routine findings                                    |
| `verifyRoutineGrants(client, …)`           | Advisory grant comparison (`--acl`)                         |
| `summarize(findings)`                      | `{ ok, errors, warnings }`                                  |
| `runSetup` · `runMigrate` · `runSeed`      | The command implementations, for scripts                    |

## What `verify` checks

`verify` needs the paired checkout, because the expectations are its manifests. It compares:

- **tables** — present as base tables, with the declared columns, types, `NOT NULL`,
  primary-key membership, array-ness, `varchar` length and `numeric` precision/scale;
- **routines** — every declared signature exists in one of the four schemas;
- **defaults and grants** — reported as advisory differences, not failures, because
  PostgreSQL normalises expressions and grants depend on which optional seeds you ran.

Type mismatches, missing columns and missing routines are failures: they mean the database
is not the database that was reviewed.

## Relationship to `hanoti/data`

| Concern                   | Owner                                    |
| ------------------------- | ---------------------------------------- |
| Entities, `DataSource`    | `@app/data` (TypeORM, server-only)        |
| URL policy                | `@app/data/connection-policy`, copied here |
| Table and routine SQL     | `hanoti/data/migrations`, `seeds`        |
| Applying that SQL, ledger | **this package**                          |
| Assertions in CI          | `.test/data` (vitest, offline)            |

`connection-policy.ts` is a synchronized copy. `pnpm parity` compiles both files and
asserts they accept and reject exactly the same URLs with the same messages, so the copy
cannot silently drift from `@app/data`.

This package does not run `synchronize()`, does not drop anything, and never edits the SQL
it applies. `db/` is intentionally outside the pnpm workspace: it is an operator tool, not
an application dependency.

## Verification performed

Every command was run against a real server — PostgreSQL 17.11 with pgvector 0.8.0, two
non-superuser roles with the documented `GRANT hanouti_app TO hanouti_provisioner` — and
the negative cases were tested too, because a check that cannot fail proves nothing:

| Check                        | Result                                                                     |
| ---------------------------- | -------------------------------------------------------------------------- |
| `setup`                      | created `hanouti` owned by `hanouti_app`; re-run left it untouched          |
| `migrate`                    | applied 001…011 in order in ~80 ms; second run reported 11/11 up to date    |
| `seed` / `seed --privileges` | catalog applied; privileges applied as provisioning administrator, creating the three roles and 15 grants |
| `status`                     | 30 tables, 38 routines, ledger with 11 migrations + 2 seeds                 |
| `check`                      | all seven checks pass                                                       |
| `verify`                     | 30/30 tables and 38/38 routines match, no advisory differences              |
| `verify --acl`               | 15 declared-exposed routines ↔ 15 grants to `hanouti_backend`               |
| negative: revoked grant      | `verify --acl` reported `declared exposed, but no role holds EXECUTE`       |
| negative: edited SQL         | manifest gate refused; with `--allow-modified-sql` the ledger drift gate refused |
| negative: parity divergence  | the parity script failed with the differing message and exit code 1         |
| `parity`                     | 62 URL/consumer cases identical to `hanoti/data/code/connection-policy.ts`  |
| `test`                       | 5 normalization checks, including the array-cast regression                 |

Two defects in the first draft were found this way and fixed: path discovery ignored the
sibling `hanoti-structure` layout, and the manifest hash gate silently matched nothing
because manifest keys are repository-relative while the runner keys on file names.

Confirm your own deployment with `check` and `verify`. The SQL remains unapplied until you
run it — these results describe this checkout on PostgreSQL 17, not a guarantee for yours.
