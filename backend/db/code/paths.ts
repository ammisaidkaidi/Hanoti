/**
 * Locate the paired checkout this package operates on: the reviewed SQL in
 * `hanoti/data` and the fixtures in `.test/data/fixtures`.
 *
 * Defaults are discovered by walking up from this module, so a checkout at any
 * depth works. Environment overrides exist for deployments that ship the SQL
 * separately from the compiled package.
 */
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface HanotiPaths {
  /** hanoti/data — migrations, seeds and documentation. */
  dataDir: string;
  /** hanoti/data/migrations/hanouti — the eleven numbered SQL migrations. */
  migrationsDir: string;
  /** hanoti/data/seeds — provisioning, catalog and privileges SQL. */
  seedsDir: string;
  /** .test/data/fixtures — schema and routine manifests, or undefined when absent. */
  fixturesDir: string | undefined;
}

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

export function resolveHanotiPaths(env: NodeJS.ProcessEnv = process.env): HanotiPaths {
  const override = env.HANOTI_DATA_DIR;
  if (override !== undefined && override !== '') {
    if (!isDirectory(override))
      throw new Error(`HANOTI_DATA_DIR is not a directory: ${override}`);
    return withDerivedPaths(override, env.HANOTI_FIXTURES_DIR);
  }

  const structureDir = findStructureDir(moduleDir);
  if (structureDir === undefined)
    throw new Error(
      'Could not locate the hanoti-structure checkout. Set HANOTI_DATA_DIR to the hanoti/data directory.',
    );
  return withDerivedPaths(path.join(structureDir, 'hanoti', 'data'), env.HANOTI_FIXTURES_DIR);
}

function withDerivedPaths(dataDir: string, fixturesOverride: string | undefined): HanotiPaths {
  const migrationsDir = path.join(dataDir, 'migrations', 'hanouti');
  const seedsDir = path.join(dataDir, 'seeds');
  if (!isDirectory(migrationsDir))
    throw new Error(`No migrations directory found at ${migrationsDir}.`);

  const fixturesDir =
    fixturesOverride !== undefined && fixturesOverride !== ''
      ? fixturesOverride
      : path.join(path.dirname(path.dirname(dataDir)), '.test', 'data', 'fixtures');

  return {
    dataDir,
    migrationsDir,
    seedsDir,
    fixturesDir: isDirectory(fixturesDir) ? fixturesDir : undefined,
  };
}

/** Walk up looking for a directory that holds `hanoti/data/migrations`. */
function findStructureDir(start: string): string | undefined {
  let current = start;
  for (;;) {
    // The checkout root itself, or the sibling layout used here, where the
    // structure is cloned next to this package (backend/hanoti-structure).
    for (const candidate of [current, path.join(current, 'hanoti-structure')]) {
      if (isDirectory(path.join(candidate, 'hanoti', 'data', 'migrations'))) return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

function isDirectory(candidate: string): boolean {
  try {
    return statSync(candidate).isDirectory();
  } catch {
    return false;
  }
}

/** True when the path exists as a file. */
export function isFile(candidate: string): boolean {
  try {
    return statSync(candidate).isFile();
  } catch {
    return false;
  }
}

export { existsSync };
