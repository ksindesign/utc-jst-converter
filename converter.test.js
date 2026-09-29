// 実行 / run: node converter.test.js
const assert = require('node:assert/strict');
const c = require('./converter.js');

const cases = [
  // [説明 / label, 実行 / fn, 期待値 / expected]
  ['UTC→JST basic', () => c.formatJst(c.parseUtc('2026-09-29 01:45:02')), '2026-09-29 10:45:02'],
  ['UTC→JST crosses day', () => c.formatJst(c.parseUtc('2026-12-31 20:00:00')), '2027-01-01 05:00:00'],
  ['JST→UTC crosses day', () => c.formatUtc(c.parseJst('2026-01-01 03:00:00')), '2025-12-31 18:00:00'],
  ['leap day', () => c.formatJst(c.parseUtc('2028-02-28 20:00:00')), '2028-02-29 05:00:00'],
  ['ISO with Z in JST field', () => c.formatJst(c.parseJst('2026-09-29T01:45:02Z')), '2026-09-29 10:45:02'],
  ['ISO with offset', () => c.formatUtc(c.parseUtc('2026-09-29T10:45:02+09:00')), '2026-09-29 01:45:02'],
  ['slash + no seconds', () => c.formatJst(c.parseUtc('2026/9/29 1:45')), '2026-09-29 10:45:00'],
  ['date only', () => c.formatJst(c.parseUtc('2026-09-29')), '2026-09-29 09:00:00'],
  ['milliseconds', () => c.formatJst(c.parseUtc('2026-09-29 01:45:02.5')), '2026-09-29 10:45:02.500'],
  ['unix seconds', () => c.formatUtc(c.parseUtc('1790000000')), '2026-09-21 14:13:20'],
  ['unix ms', () => c.formatUtc(c.parseUtc('1790000000123')), '2026-09-21 14:13:20.123'],
  ['invalid date', () => c.parseUtc('2026-02-30 00:00:00'), null],
  ['invalid hour', () => c.parseUtc('2026-01-01 24:00:00'), null],
  ['garbage', () => c.parseUtc('hello'), null],
  ['empty', () => c.parseUtc('   '), null],
];

let failed = 0;
for (const [label, fn, expected] of cases) {
  try {
    assert.equal(fn(), expected);
    console.log('ok   ' + label);
  } catch (e) {
    failed++;
    console.log('FAIL ' + label + ': ' + e.message);
  }
}
console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
