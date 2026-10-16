/**
 * Discovery and integrity of the reviewed SQL files.
 *
 * Migrations are plain `.sql` files, never TypeORM MigrationInterface classes,
 * and their order is the filename order: 001_schemas.sql … 011_order_edit_routines.sql.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

export interface SqlFile {
  /** File name including the .sql suffix, used as the ledger key. */
  name: string;
  /** Absolute path on disk. */
  path: string;
  /** SHA-256 of the file contents, hex encoded. */
  checksum: string;
}

export function sha256(contents: string | Buffer): string {
  return createHash('sha256').update(contents).digest('hex');
}

/** Read one SQL file with its checksum. */
export function readSqlFile(filePath: string): SqlFile {
  const contents = readFileSync(filePath);
  return {
    name: path.basename(filePath),
    path: filePath,
    checksum: sha256(contents),
  };
}

/** List every numbered SQL file in a directory, ordered exactly as deployed. */
export function listSqlFiles(directory: string): SqlFile[] {
  return readdirSync(directory)
    .filter((entry) => entry.endsWith('.sql') && !entry.startsWith('.'))
    .sort((left, right) => left.localeCompare(right, 'en'))
    .map((entry) => readSqlFile(path.join(directory, entry)));
}

/** Compare discovered files against the reviewed manifest hashes. */
export interface HashFinding {
  file: string;
  expected: string;
  actual: string;
}

export function findHashMismatches(
  files: readonly SqlFile[],
  expected: Readonly<Record<string, string>>,
): HashFinding[] {
  // Manifest keys are repository-relative paths ("migrations/hanouti/001_….sql"),
  // so match on the file name rather than the exact key.
  const byName = new Map<string, string>();
  for (const [key, checksum] of Object.entries(expected)) {
    const name = key.split('/').pop();
    if (name !== undefined) byName.set(name, checksum);
  }

  const findings: HashFinding[] = [];
  for (const file of files) {
    const expectedChecksum = byName.get(file.name);
    if (expectedChecksum === undefined) continue;
    if (expectedChecksum !== file.checksum)
      findings.push({ file: file.name, expected: expectedChecksum, actual: file.checksum });
  }
  return findings;
}
