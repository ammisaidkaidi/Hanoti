#!/usr/bin/env node
/**
 * Generate the frontend's entity metadata from the database definition.
 *
 * The single source of truth is the hanouti SQL declaration set, summarised by
 * `.test/data/fixtures/schema-manifest.json`. This script turns that manifest
 * into `src/hanouti/generated/schema.js`, so every screen, column, form input
 * and filter in the application is derived from the reviewed database schema
 * instead of being hand-copied into the frontend.
 *
 * Re-run after any migration changes:
 *
 *   npm run schema:generate
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '..');

function locateFixtures() {
  const configured = process.env.HANOTI_FIXTURES_DIR;
  if (configured && configured !== '') return configured;
  const candidates = [
    path.join(frontendRoot, '..', '..', 'backend', 'hanoti-structure', '.test', 'data', 'fixtures'),
    path.join(frontendRoot, '..', '..', '.test', 'data', 'fixtures'),
  ];
  for (const candidate of candidates) {
    try {
      readFileSync(path.join(candidate, 'schema-manifest.json'));
      return candidate;
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error(
    'Could not find .test/data/fixtures/schema-manifest.json. Set HANOTI_FIXTURES_DIR to the fixtures directory.',
  );
}

const fixturesDir = locateFixtures();
const manifest = JSON.parse(readFileSync(path.join(fixturesDir, 'schema-manifest.json'), 'utf8'));

/** Columns that are machinery rather than business data: hidden from tables and forms. */
const auditColumns = new Set(['frozen', 'created_at', 'updated_at', 'version']);

/**
 * Secrets. These values must never reach a browser: the hash is a credential,
 * and a list screen that renders it hands an attacker an offline cracking
 * target. Excluded from lists, forms and the schema browser.
 */
const sensitivePattern = /(password_hash|token_hash|^secret|_secret$|api_key)/;

/** The schema that carries the tenant/identity model, shown last in the browser. */
const schemaOrder = ['erp', 'auth', 'app', 'settings'];

function toEntity(table) {
  const columns = table.columns.map((column) => ({
    name: column.name,
    property: column.property ?? camel(column.name),
    type: column.type,
    nullable: column.nullable,
    primary: column.primary,
    array: column.array,
    length: column.length ?? null,
    precision: column.precision ?? null,
    scale: column.scale ?? null,
    default: column.default ?? null,
    audit: auditColumns.has(column.name),
    sensitive: sensitivePattern.test(column.name),
  }));

  const primary = columns.find((column) => column.primary);
  const labelColumn =
    ['name', 'full_name', 'display_name', 'code', 'title', 'key', 'email']
      .map((candidate) => columns.find((column) => column.name === candidate))
      .find(Boolean) ?? primary;

  return {
    key: `${table.schema}.${table.name}`,
    schema: table.schema,
    table: table.name,
    className: table.className,
    columns,
    primaryKey: primary?.name ?? 'id',
    labelColumn: labelColumn?.name ?? primary?.name ?? 'id',
    /** Columns worth showing: everything except machinery and secrets. */
    listColumns: columns
      .filter((column) => !column.audit && !column.sensitive)
      .map((column) => column.name),
    hasSensitiveColumns: columns.some((column) => column.sensitive),
    foreignKeys: table.foreignKeys ?? [],
    uniqueColumns: table.uniqueColumns ?? [],
  };
}

function camel(value) {
  return value.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

const entities = manifest.tables
  .map(toEntity)
  .sort((left, right) => {
    const bySchema = schemaOrder.indexOf(left.schema) - schemaOrder.indexOf(right.schema);
    return bySchema !== 0 ? bySchema : left.table.localeCompare(right.table, 'fr');
  });

const bySchema = entities.reduce((totals, entity) => {
  totals[entity.schema] = (totals[entity.schema] ?? 0) + 1;
  return totals;
}, {});

const generatedAt = new Date().toISOString();
const migrations = Object.keys(manifest.files ?? {});

const output = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Produced by scripts/generate-schema.mjs from the hanouti SQL declarations
 * (${path.relative(frontendRoot, fixturesDir)}/schema-manifest.json).
 *
 * Regenerate with:  npm run schema:generate
 *
 * Generated at ${generatedAt}
 * ${entities.length} tables across ${Object.keys(bySchema).length} schemas.
 */

/** Migrations the manifest hashes cover, in deployment order. */
export const manifestFiles = ${JSON.stringify(migrations, null, 2)};

/** Table counts per schema, as declared. */
export const schemaCounts = ${JSON.stringify(bySchema, null, 2)};

/** Every declared table, with its columns exactly as the SQL declares them. */
export const entities = ${JSON.stringify(entities, null, 2)};

/** Lookup by \`schema.table\`. */
export const entitiesByKey = Object.fromEntries(entities.map((entity) => [entity.key, entity]));

/** Tables of one schema. */
export function entitiesOfSchema(schema) {
  return entities.filter((entity) => entity.schema === schema);
}

/** One entity, or undefined. */
export function entity(key) {
  return entitiesByKey[key];
}

export const generatedAt = ${JSON.stringify(generatedAt)};
`;

const target = path.join(frontendRoot, 'src', 'hanouti', 'generated', 'schema.js');
mkdirSync(path.dirname(target), { recursive: true });
writeFileSync(target, output);

process.stdout.write(
  `schema:generate — ${entities.length} tables, ${entities.reduce((total, item) => total + item.columns.length, 0)} columns\n` +
    `  from ${path.relative(frontendRoot, path.join(fixturesDir, 'schema-manifest.json'))}\n` +
    `  to   ${path.relative(frontendRoot, target)}\n` +
    `  ${Object.entries(bySchema)
      .map(([schema, count]) => `${schema}: ${count}`)
      .join(', ')}\n`,
);
