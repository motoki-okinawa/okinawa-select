import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rankItems } from './product-ranking.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const endpoint = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701';
const credentials = {
  applicationId: process.env.RAKUTEN_APPLICATION_ID || '',
  accessKey: process.env.RAKUTEN_ACCESS_KEY || '',
  affiliateId: process.env.RAKUTEN_AFFILIATE_ID || ''
};
if (Object.values(credentials).some(value => !value)) throw new Error('Rakuten API credentials are missing.');

const themes = JSON.parse(await fs.readFile(path.join(root, 'data/product-themes.json'), 'utf8'));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const selected = {};
const candidates = [];

for (const [index, theme] of themes.entries()) {
  const params = new URLSearchParams({
    ...credentials,
    keyword: theme.query,
    format: 'json',
    formatVersion: '2',
    hits: '30',
    availability: '1',
    imageFlag: '1',
    sort: 'standard',
    elements: 'itemName,itemPrice,itemUrl,affiliateUrl,mediumImageUrls,shopName,itemCode,availability,reviewAverage,reviewCount,postageFlag,pointRate,affiliateRate'
  });
  const response = await fetch(`${endpoint}?${params}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Rakuten API ${response.status} for ${theme.name}`);
  const data = await response.json();
  if (data?.error) throw new Error(`${data.error}: ${data.error_description || theme.name}`);
  const rows = Array.isArray(data.Items) ? data.Items : Array.isArray(data.items) ? data.items : [];
  const ranked = rankItems(theme, rows).slice(0, 5);
  if (ranked[0]) selected[theme.id] = ranked[0];
  candidates.push({ theme, candidates: ranked });
  if (index < themes.length - 1) await wait(1200);
}

const output = { apiVersion: '2026-07-01', updatedAt: new Date().toISOString(), items: selected };
await fs.mkdir(path.join(root, 'data'), { recursive: true });
await fs.writeFile(path.join(root, 'data/product-candidates.json'), `${JSON.stringify(candidates, null, 2)}\n`);
await fs.writeFile(path.join(root, 'rakuten-products.js'), `window.RAKUTEN_PRODUCTS = ${JSON.stringify(output)};\n`);
console.log(`Selected ${Object.keys(selected).length}/${themes.length} products.`);
