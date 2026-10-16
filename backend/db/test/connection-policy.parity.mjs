/**
 * Parity test for the copied connection policy.
 *
 * This package carries its own copy of `hanoti/data/code/connection-policy.ts`
 * because it lives outside the pnpm workspace. The copy is only safe while it
 * behaves identically, so this script compiles both implementations and checks
 * that they agree on every URL in the reviewed fixture list — same verdict, same
 * message, same rejection reason.
 *
 * Run with `pnpm parity`, from this package's directory. It skips (exit 0) when
 * the paired checkout is not present on this machine.
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '..');

// Fixture lists copied verbatim from .test/data/connection-policy.test.ts.
const accepted = [
  'postgres://localhost/hanouti',
  'postgresql://user:p%40ss@db.example:5433/hanouti',
  'postgresql://[::1]/hanouti',
  'postgresql://localhost/%68anouti',
  'postgresql://localhost/hanouti?sslmode=verify-full&sslrootcert=%2Fcerts%2Fca.pem',
  'postgresql://localhost/hanouti?sslcert=%2Fcert.pem&sslkey=%2Fkey.pem',
  'postgresql://localhost/hanouti?sslmode=',
  'postgresql://localhost/hanouti?sslmode=require&sslmode=verify-full',
];
const rejected = [
  '',
  'not a URL',
  'https://localhost/hanouti',
  'postgresql:///hanouti',
  'postgresql://localhost',
  'postgresql://localhost/auth',
  'postgresql://localhost/erp',
  'postgresql://localhost/app',
  'postgresql://localhost/hanouti/',
  'postgresql://localhost/hanouti/extra',
  'postgresql://localhost/%ZZ',
  'postgresql://localhost/hanouti#fragment',
  'postgresql://localhost/hanouti?database=erp',
  'postgresql://localhost/hanouti?host=other.example',
  'postgresql://localhost/hanouti?options=-csearch_path%3Dpublic',
  'postgresql://localhost/hanouti?SSLMode=require',
  'postgresql://localhost/hanouti?toString=test',
  'postgresql://localhost/hanouti?constructor=test',
  'postgresql://localhost/hanouti?__proto__=test',
  'postgresql://localhost/hanouti?hasOwnProperty=test',
  'postgresql://localhost/hanouti?%74oString=test',
  'postgresql://user:DO_NOT_LOG@localhost/other',
];
const consumers = ['typeorm', 'libpq'];

function locateUpstream() {
  const configured = process.env.HANOTI_DATA_DIR;
  if (configured && configured !== '') {
    const candidate = path.join(configured, 'code', 'connection-policy.ts');
    return existsSync(candidate) ? candidate : undefined;
  }
  let current = here;
  for (;;) {
    // The checkout root itself, or the sibling layout used here, where the
    // structure is cloned next to this package (backend/hanoti-structure).
    for (const root of [current, path.join(current, 'hanoti-structure')]) {
      const candidate = path.join(root, 'hanoti', 'data', 'code', 'connection-policy.ts');
      if (existsSync(candidate)) return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

async function loadImplementation(sourcePath, label) {
  const typescript = require('typescript');
  const source = readFileSync(sourcePath, 'utf8');
  const { outputText } = typescript.transpileModule(source, {
    compilerOptions: { module: typescript.ModuleKind.ESNext, target: typescript.ScriptTarget.ES2022 },
    fileName: path.basename(sourcePath),
  });
  const tmpDir = path.join(packageRoot, 'test', '.tmp');
  mkdirSync(tmpDir, { recursive: true });
  const outputPath = path.join(tmpDir, `${label}.mjs`);
  writeFileSync(outputPath, outputText);
  return import(pathToFileURL(outputPath).href);
}

function verdict(module, url, consumer) {
  try {
    const parsed = module.parseDatabaseUrl(url, consumer);
    return { ok: true, hostname: parsed.hostname, pathname: parsed.pathname, port: parsed.port };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

const upstreamPath = locateUpstream();
if (upstreamPath === undefined) {
  process.stdout.write(
    'parity: skipped — the paired hanoti checkout was not found.\n' +
      '        Set HANOTI_DATA_DIR to hanoti/data to run this check.\n',
  );
  process.exit(0);
}

const own = await loadImplementation(
  path.join(packageRoot, 'code', 'connection-policy.ts'),
  'own',
);
const upstream = await loadImplementation(upstreamPath, 'upstream');

const differences = [];
let comparisons = 0;

for (const consumer of consumers) {
  for (const url of [...accepted, ...rejected]) {
    comparisons += 1;
    const mine = verdict(own, url, consumer);
    const theirs = verdict(upstream, url, consumer);
    if (mine.ok !== theirs.ok) {
      differences.push(
        `${consumer} ${JSON.stringify(url)}: verdict differs (copy ${mine.ok ? 'accepts' : 'rejects'}, upstream ${theirs.ok ? 'accepts' : 'rejects'})`,
      );
      continue;
    }
    if (!mine.ok && mine.message !== theirs.message)
      differences.push(`${consumer} ${JSON.stringify(url)}: message differs (${mine.message} vs ${theirs.message})`);
    if (mine.ok && (mine.hostname !== theirs.hostname || mine.pathname !== theirs.pathname || mine.port !== theirs.port))
      differences.push(`${consumer} ${JSON.stringify(url)}: parsed fields differ`);
  }
}

// A malformed consumer must be rejected by both, without a cause.
for (const module of [own, upstream]) {
  comparisons += 1;
  const result = verdict(module, 'postgresql://localhost/hanouti', 'unknown');
  if (result.ok) differences.push('unknown consumer was accepted');
}

process.stdout.write(
  `parity: compared ${comparisons} cases against ${path.relative(packageRoot, upstreamPath)}\n`,
);
if (differences.length > 0) {
  process.stdout.write(`\n${differences.length} divergence(s):\n`);
  for (const difference of differences) process.stdout.write(`  ${difference}\n`);
  process.exit(1);
}
process.stdout.write('parity: identical behaviour — the copy is still in sync\n');
