#!/usr/bin/env node
// Refreshes the "Latest published table" section of README.md from the keyless
// AllRatesToday endpoint. Idempotent: identical data produces an identical file.
import { readFileSync, writeFileSync } from 'node:fs';

const CODE = 'bot';
const NAME = 'Bank of Thailand';
const KIND = 'central bank';
const PAGE = 'https://allratestoday.com/central-bank-rates-api/bot/';
const MAX_ROWS = 60;
const START = '<!-- daily-table:start -->';
const END = '<!-- daily-table:end -->';

const res = await fetch(`https://allratestoday.com/api/open/central-bank/${CODE}`, {
  headers: { accept: 'application/json', 'user-agent': `bank-of-thailand-exchange-rate daily-table (+https://github.com/AllRates-Today/bank-of-thailand-exchange-rate)` },
});
if (!res.ok) throw new Error(`open endpoint returned HTTP ${res.status}`);
const data = await res.json();
if (!data.rate_date || !Array.isArray(data.rates) || data.rates.length === 0) throw new Error('unexpected payload');

const fmt = (v) => {
  const s = String(v);
  return s.length <= 12 ? s : String(+Number(v).toPrecision(8));
};
const rows = [...data.rates].sort(
  (a, c) => a.base.localeCompare(c.base) || a.quote.localeCompare(c.quote) || String(a.type).localeCompare(String(c.type)),
);
const shown = rows.slice(0, MAX_ROWS);
const more = rows.length > MAX_ROWS ? `, first ${MAX_ROWS} shown` : '';
const stale = data.stale ? ' (the API currently flags this table as stale)' : '';
const source = data.attribution?.source ?? `Official rates published by ${NAME}, served by AllRatesToday`;
const section = [
  `Published **${data.rate_date}** by ${NAME}${stale} — ${rows.length} rate${rows.length === 1 ? '' : 's'}${more}. Updated ${new Date().toISOString().slice(0, 10)}.`,
  '',
  '| Base | Quote | Type | Rate |',
  '| --- | --- | --- | ---: |',
  ...shown.map((r) => `| ${r.base} | ${r.quote} | ${r.type} | ${fmt(r.value)} |`),
  '',
  `${rows.length > MAX_ROWS ? `[Full table on the ${NAME} rates page](${PAGE}) · ` : ''}Source: [${source}](${data.attribution?.url ?? PAGE}). Rates are as printed by the ${KIND}; AllRatesToday is not affiliated with it.`,
].join('\n');

const readme = readFileSync('README.md', 'utf8');
const a = readme.indexOf(START);
const z = readme.indexOf(END);
if (a < 0 || z < 0 || z < a) throw new Error('daily-table markers missing from README.md');
const next = readme.slice(0, a + START.length) + '\n' + section + '\n' + readme.slice(z);
// Only the "Updated <today>" stamp moves on a day without a new table; keep the file untouched then.
const strip = (t) => t.replace(/Updated \d{4}-\d{2}-\d{2}\./, '');
if (strip(next) === strip(readme)) {
  console.log(`${CODE}: table unchanged (${data.rate_date})`);
} else {
  writeFileSync('README.md', next);
  console.log(`${CODE}: table updated to ${data.rate_date} (${rows.length} rates)`);
}
