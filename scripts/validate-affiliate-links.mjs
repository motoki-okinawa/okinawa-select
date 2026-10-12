import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAffiliateLinkReport } from './affiliate-link-validation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const groups = JSON.parse(await fs.readFile(path.join(root, 'data/product-candidates.json'), 'utf8'));
const items = groups.flatMap(group => group.candidates.slice(0, 1));
const report = buildAffiliateLinkReport(items);
await fs.mkdir(path.join(root, 'reports'), { recursive: true });
await fs.writeFile(path.join(root, 'reports/affiliate-link-check.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Affiliate links: ${report.valid}/${report.total} valid.`);
if (report.invalid) {
  for (const row of report.rows.filter(row => !row.structurallyValid)) console.error(`${row.themeName}: ${row.issues.join(', ')}`);
  process.exitCode = 1;
}
