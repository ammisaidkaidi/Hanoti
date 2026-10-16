/**
 * Verification against the checked manifests.
 *
 * `.test/data/fixtures/schema-manifest.json` and `routines-manifest.json` are
 * the reviewed expectations for the deployed schema. `verify` compares the live
 * database against them, so "the migrations ran" becomes "the database matches
 * what was reviewed". Structural facts (tables, columns, types, nullability,
 * primary keys, routine signatures) are errors; defaults and ACLs are advisory.
 *
 * PostgreSQL reports type names in its own vocabulary — `bool`, `int4`,
 * `timestamp with time zone`, `character varying` — while the manifests use the
 * names TypeORM uses — `boolean`, `integer`, `timestamptz`, `varchar`. Both
 * sides are normalized to the manifest vocabulary before comparison.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Client } from 'pg';
import { isFile } from '../paths.js';

export interface ColumnExpectation {
  name: string;
  property: string;
  type: string;
  nullable: boolean;
  primary: boolean;
  array: boolean;
  length: number | null;
  precision: number | null;
  scale: number | null;
  default: string | null;
}

export interface TableExpectation {
  database: string;
  schema: string;
  name: string;
  className: string;
  columns: ColumnExpectation[];
  uniqueColumns?: string[][];
}

export interface RoutineExpectation {
  name: string;
  signature: string;
  file: string;
  exposed: boolean;
}

export interface ManifestSet {
  tables: TableExpectation[];
  routines: RoutineExpectation[];
  files: Record<string, string>;
  schemaManifestPath: string;
  routinesManifestPath: string;
}

export interface Finding {
  level: 'error' | 'warning';
  object: string;
  message: string;
}

/** The four business schemas. `public` holds the pgvector type only. */
export const verifiedSchemas = ['auth', 'erp', 'app', 'settings'] as const;

/** PostgreSQL type names → the vocabulary the manifests use. */
const typeVocabulary: Readonly<Record<string, string>> = {
  'timestamp with time zone': 'timestamptz',
  'timestamp without time zone': 'timestamp',
  'time with time zone': 'timetz',
  'character varying': 'varchar',
  character: 'char',
  'double precision': 'float8',
  real: 'float4',
  smallint: 'int2',
  integer: 'integer',
  bigint: 'bigint',
};

export function normalizeTypeName(name: string): string {
  return typeVocabulary[name] ?? name;
}

export interface TypeFacets {
  /** Base type in the manifest vocabulary. */
  base: string;
  array: boolean;
  /** For varchar/char: the declared length. For vector: the dimension. */
  length: number | null;
  precision: number | null;
  scale: number | null;
}

/** Split `character varying(320)` or `numeric(12,4)` into comparable parts. */
export function parseFormattedType(formatted: string): TypeFacets {
  const array = formatted.endsWith('[]');
  const body = array ? formatted.slice(0, -2) : formatted;
  const match = /^(.*?)\(([^)]*)\)$/.exec(body);
  const base = normalizeTypeName((match?.[1] ?? body).trim());
  const args = match?.[2]?.split(',').map((part) => part.trim()) ?? [];

  const first = args[0] === undefined ? undefined : Number.parseInt(args[0], 10);
  const second = args[1] === undefined ? undefined : Number.parseInt(args[1], 10);

  return {
    base,
    array,
    length: first !== undefined && Number.isFinite(first) ? first : null,
    precision: base === 'numeric' && first !== undefined && Number.isFinite(first) ? first : null,
    scale: base === 'numeric' && second !== undefined && Number.isFinite(second) ? second : null,
  };
}

/** Normalize a full `schema.name(types)` signature to the manifest vocabulary. */
export function normalizeSignature(signature: string): string {
  const open = signature.indexOf('(');
  if (open === -1) return signature;
  const head = signature.slice(0, open);
  const inner = signature.slice(open + 1, signature.lastIndexOf(')'));
  if (inner.trim() === '') return `${head}()`;
  const normalized = inner
    .split(',')
    .map((argument) => {
      const trimmed = argument.trim();
      const array = trimmed.endsWith('[]');
      const base = array ? trimmed.slice(0, -2) : trimmed;
      return `${normalizeTypeName(base)}${array ? '[]' : ''}`;
    })
    .join(', ');
  return `${head}(${normalized})`;
}

export function loadManifests(fixturesDir: string): ManifestSet {
  const schemaManifestPath = path.join(fixturesDir, 'schema-manifest.json');
  const routinesManifestPath = path.join(fixturesDir, 'routines-manifest.json');
  if (!isFile(schemaManifestPath))
    throw new Error(`schema-manifest.json not found in ${fixturesDir}.`);
  if (!isFile(routinesManifestPath))
    throw new Error(`routines-manifest.json not found in ${fixturesDir}.`);

  const schema = JSON.parse(readFileSync(schemaManifestPath, 'utf8')) as {
    tables: TableExpectation[];
    files: Record<string, string>;
  };
  const routines = JSON.parse(readFileSync(routinesManifestPath, 'utf8')) as RoutineExpectation[];

  return {
    tables: schema.tables,
    files: schema.files,
    routines,
    schemaManifestPath,
    routinesManifestPath,
  };
}

interface LiveColumn {
  name: string;
  formatted_type: string;
  nullable: boolean;
  is_primary: boolean;
  default_expr: string | null;
}

interface LiveTable {
  exists: boolean;
  kind: string | null;
  columns: LiveColumn[];
}

/** Compare every expected table and its columns. */
export async function verifyTables(
  client: Client,
  expectations: readonly TableExpectation[],
): Promise<Finding[]> {
  const findings: Finding[] = [];
  for (const table of expectations) {
    const label = `${table.schema}.${table.name}`;
    const live = await liveTable(client, table.schema, table.name);
    if (!live.exists) {
      findings.push({ level: 'error', object: label, message: 'table is missing' });
      continue;
    }
    if (live.kind !== 'r') {
      findings.push({
        level: 'error',
        object: label,
        message: `expected a base table, found relkind ${live.kind ?? 'unknown'}`,
      });
      continue;
    }

    const byName = new Map(live.columns.map((column) => [column.name, column]));
    for (const expected of table.columns) {
      const column = byName.get(expected.name);
      if (column === undefined) {
        findings.push({
          level: 'error',
          object: `${label}.${expected.name}`,
          message: 'column is missing',
        });
        continue;
      }
      findings.push(...compareColumn(label, expected, column));
      byName.delete(expected.name);
    }
    for (const leftover of byName.values())
      findings.push({
        level: 'warning',
        object: `${label}.${leftover.name}`,
        message: 'column exists in the database but is not declared in the manifest',
      });
  }
  return findings;
}

function compareColumn(table: string, expected: ColumnExpectation, live: LiveColumn): Finding[] {
  const findings: Finding[] = [];
  const label = `${table}.${expected.name}`;
  const facets = parseFormattedType(live.formatted_type);

  if (facets.base !== expected.type)
    findings.push({
      level: 'error',
      object: label,
      message: `type mismatch: expected ${expected.type}, found ${facets.base} (${live.formatted_type})`,
    });

  if (facets.array !== expected.array)
    findings.push({
      level: 'error',
      object: label,
      message: expected.array ? 'expected an array type' : 'expected a scalar type',
    });

  if (live.nullable !== expected.nullable)
    findings.push({
      level: 'error',
      object: label,
      message: expected.nullable
        ? 'expected nullable, found NOT NULL'
        : 'expected NOT NULL, found nullable',
    });

  if (live.is_primary !== expected.primary)
    findings.push({
      level: 'error',
      object: label,
      message: expected.primary
        ? 'expected part of the primary key'
        : 'unexpectedly part of the primary key',
    });

  if (expected.length !== null && facets.length !== expected.length)
    findings.push({
      level: 'error',
      object: label,
      message: `length mismatch: expected ${expected.length}, found ${facets.length ?? 'none'}`,
    });

  if (expected.precision !== null && facets.precision !== expected.precision)
    findings.push({
      level: 'error',
      object: label,
      message: `precision mismatch: expected ${expected.precision}, found ${facets.precision ?? 'none'}`,
    });

  if (expected.scale !== null && facets.scale !== expected.scale)
    findings.push({
      level: 'error',
      object: label,
      message: `scale mismatch: expected ${expected.scale}, found ${facets.scale ?? 'none'}`,
    });

  const expectedDefault = expected.default;
  if (expectedDefault !== null) {
    if (live.default_expr === null) {
      findings.push({
        level: 'warning',
        object: label,
        message: `expected default ${expectedDefault}, found none`,
      });
    } else if (normalizeDefault(live.default_expr) !== normalizeDefault(expectedDefault)) {
      findings.push({
        level: 'warning',
        object: label,
        message: `default differs: expected ${expectedDefault}, found ${live.default_expr}`,
      });
    }
  }

  return findings;
}

/** Routines as the database reports them, in manifest vocabulary. */
export async function liveSignatures(client: Client): Promise<Map<string, string[]>> {
  const result = await client.query<{ schema: string; name: string; args: string[] }>(
    `SELECT n.nspname AS schema,
            p.proname AS name,
            coalesce(
              array_agg(format_type(argument, NULL) ORDER BY position)
                FILTER (WHERE argument IS NOT NULL),
              '{}'::text[]
            ) AS args
       FROM pg_proc p
       JOIN pg_namespace n ON n.oid = p.pronamespace
       LEFT JOIN LATERAL unnest(p.proargtypes::oid[]) WITH ORDINALITY AS args(argument, position)
         ON true
      WHERE n.nspname = ANY($1::text[])
      GROUP BY n.oid, p.oid, n.nspname, p.proname`,
    [verifiedSchemas],
  );

  const signatures = new Map<string, string[]>();
  for (const row of result.rows) {
    const normalized = row.args.map((argument) => {
      const array = argument.endsWith('[]');
      const base = array ? argument.slice(0, -2) : argument;
      return `${normalizeTypeName(base)}${array ? '[]' : ''}`;
    });
    signatures.set(`${row.schema}.${row.name}(${normalized.join(', ')})`, []);
  }
  return signatures;
}

/** Compare routine names and signatures. */
export async function verifyRoutines(
  client: Client,
  expectations: readonly RoutineExpectation[],
): Promise<Finding[]> {
  const live = await liveSignatures(client);
  const findings: Finding[] = [];
  for (const expected of expectations) {
    if (!live.has(normalizeSignature(expected.signature)))
      findings.push({
        level: 'error',
        object: expected.signature,
        message: `routine is missing (declared in ${expected.file})`,
      });
  }
  return findings;
}

/**
 * Advisory ACL check: `exposed` routines are the ones the privileges seed is
 * meant to grant, so after that seed runs each exposed routine should have at
 * least one non-owner grant. Only meaningful once privileges are applied.
 */
export async function verifyRoutineGrants(
  client: Client,
  expectations: readonly RoutineExpectation[],
  grants: ReadonlyMap<string, readonly string[]>,
): Promise<Finding[]> {
  const findings: Finding[] = [];
  for (const expected of expectations) {
    const granted = grants.get(normalizeSignature(expected.signature)) ?? [];
    const hasGrant = granted.length > 0;
    if (expected.exposed && !hasGrant)
      findings.push({
        level: 'warning',
        object: expected.signature,
        message: 'declared exposed, but no role holds EXECUTE',
      });
    if (!expected.exposed && hasGrant)
      findings.push({
        level: 'warning',
        object: expected.signature,
        message: `not declared exposed, but EXECUTE is granted to ${granted.join(', ')}`,
      });
  }
  return findings;
}

export interface FindingSummary {
  ok: boolean;
  errors: Finding[];
  warnings: Finding[];
}

export function summarize(findings: readonly Finding[]): FindingSummary {
  const errors = findings.filter((finding) => finding.level === 'error');
  const warnings = findings.filter((finding) => finding.level === 'warning');
  return { ok: errors.length === 0, errors, warnings };
}

async function liveTable(client: Client, schema: string, name: string): Promise<LiveTable> {
  const relation = await client.query<{ kind: string }>(
    `SELECT c.relkind::text AS kind
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = $1 AND c.relname = $2`,
    [schema, name],
  );
  const relationRow = relation.rows[0];
  if (relationRow === undefined) return { exists: false, kind: null, columns: [] };

  const columns = await client.query<{
    name: string;
    formatted_type: string;
    nullable: boolean;
    is_primary: boolean;
    default_expr: string | null;
  }>(
    `SELECT a.attname AS name,
            format_type(a.atttypid, a.atttypmod) AS formatted_type,
            NOT a.attnotnull AS nullable,
            coalesce(
              (
                SELECT true
                  FROM pg_index i
                 WHERE i.indrelid = a.attrelid
                   AND i.indisprimary
                   AND a.attnum = ANY (i.indkey)
              ),
              false
            ) AS is_primary,
            pg_get_expr(d.adbin, d.adrelid) AS default_expr
       FROM pg_attribute a
       LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE a.attrelid = (
              SELECT c.oid
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
               WHERE n.nspname = $1 AND c.relname = $2
            )
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum`,
    [schema, name],
  );

  return { exists: true, kind: relationRow.kind, columns: columns.rows };
}

/**
 * Defaults are advisory because PostgreSQL rewrites them: `CAST('{}' AS jsonb)`
 * is stored as `'{}'::jsonb`, and array literals gain element casts.
 */
function normalizeDefault(value: string): string {
  return (
    value
      .replace(/cast\((.*)\s+as\s+[^)]+\)/gi, '$1')
      // Strip ::type casts, including an [] suffix on the cast target, but never
      // the closing bracket of an array literal: 'global'::text] keeps its ].
      .replace(/::[a-zA-Z_][a-zA-Z0-9_. "']*(?:\[\])?/g, '')
      .replace(/[()'"\s]/g, '')
      .toLowerCase()
  );
}
