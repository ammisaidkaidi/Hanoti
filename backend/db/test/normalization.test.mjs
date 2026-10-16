/**
 * Unit checks for the comparison vocabulary used by `verify`.
 *
 * These are the cases that made the first version of `verify` report 280 false
 * mismatches: PostgreSQL's own type names versus the manifest's, declared
 * lengths living in typmod, and rewritten defaults.
 *
 * Run with `node test/normalization.test.mjs` after `pnpm build`.
 */
import assert from 'node:assert/strict';
import {
  normalizeSignature,
  normalizeTypeName,
  parseFormattedType,
} from '../dist/helpers/verify.js';
import { findHashMismatches, sha256 } from '../dist/sql-files.js';

const cases = [];
function check(name, run) {
  cases.push({ name, run });
}

check('maps PostgreSQL type names onto the manifest vocabulary', () => {
  assert.equal(normalizeTypeName('timestamp with time zone'), 'timestamptz');
  assert.equal(normalizeTypeName('character varying'), 'varchar');
  assert.equal(normalizeTypeName('uuid'), 'uuid');
  assert.equal(normalizeTypeName('settings.setting_definitions'), 'settings.setting_definitions');
});

check('reads length, precision, scale and array-ness out of formatted types', () => {
  assert.deepEqual(parseFormattedType('character varying(320)'), {
    base: 'varchar',
    array: false,
    length: 320,
    precision: null,
    scale: null,
  });
  assert.deepEqual(parseFormattedType('numeric(12,4)'), {
    base: 'numeric',
    array: false,
    length: 12,
    precision: 12,
    scale: 4,
  });
  assert.deepEqual(parseFormattedType('vector(4096)'), {
    base: 'vector',
    array: false,
    length: 4096,
    precision: null,
    scale: null,
  });
  assert.deepEqual(parseFormattedType('text[]'), {
    base: 'text',
    array: true,
    length: null,
    precision: null,
    scale: null,
  });
  assert.deepEqual(parseFormattedType('timestamp with time zone'), {
    base: 'timestamptz',
    array: false,
    length: null,
    precision: null,
    scale: null,
  });
});

check('normalizes routine signatures both ways', () => {
  assert.equal(
    normalizeSignature('erp.x(uuid, timestamp with time zone, bigint)'),
    'erp.x(uuid, timestamptz, bigint)',
  );
  assert.equal(
    normalizeSignature('settings.resolve(uuid, text, jsonb)'),
    'settings.resolve(uuid, text, jsonb)',
  );
  assert.equal(normalizeSignature('app.now()'), 'app.now()');
});

check('ignores the closing bracket of an array literal when stripping casts', () => {
  // The regression that produced a false advisory: ARRAY['global'::text]
  const normalize = (value) =>
    value
      .replace(/cast\((.*)\s+as\s+[^)]+\)/gi, '$1')
      .replace(/::[a-zA-Z_][a-zA-Z0-9_. "']*(?:\[\])?/g, '')
      .replace(/[()'"\s]/g, '')
      .toLowerCase();
  assert.equal(normalize("CAST(ARRAY['global'] AS text[])"), normalize("ARRAY['global'::text]"));
  assert.equal(normalize("CAST('{}' AS jsonb)"), normalize("'{}'::jsonb"));
});

check('matches manifest hashes by file name, not by full path', () => {
  const checksum = sha256('select 1;\n');
  const file = { name: '011_order_edit_routines.sql', path: '/tmp/x', checksum };
  // Manifest keys are repository-relative paths; a bare-name lookup would miss them.
  assert.deepEqual(
    findHashMismatches([file], { 'migrations/hanouti/011_order_edit_routines.sql': checksum }),
    [],
  );
  const mismatch = findHashMismatches([file], {
    'migrations/hanouti/011_order_edit_routines.sql': sha256('select 2;\n'),
  });
  assert.equal(mismatch.length, 1);
  assert.equal(mismatch[0].file, '011_order_edit_routines.sql');
});

let failed = 0;
for (const entry of cases) {
  try {
    entry.run();
    process.stdout.write(`  ok   ${entry.name}\n`);
  } catch (error) {
    failed += 1;
    process.stdout.write(`  FAIL ${entry.name}\n       ${error.message}\n`);
  }
}
process.stdout.write(
  failed === 0
    ? `\nnormalization: ${cases.length} checks passed\n`
    : `\nnormalization: ${failed} of ${cases.length} checks failed\n`,
);
process.exit(failed === 0 ? 0 : 1);
