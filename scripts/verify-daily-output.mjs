import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themes = JSON.parse(await fs.readFile(path.join(root, 'data/product-themes.json'), 'utf8'));
const productScript = await fs.readFile(path.join(root, 'rakuten-products.js'), 'utf8');
const match = productScript.match(/window\.RAKUTEN_PRODUCTS\s*=\s*(\{[\s\S]*\});?\s*$/);
assert.ok(match, 'rakuten-products.js must contain RAKUTEN_PRODUCTS');
const products = JSON.parse(match[1]);
const selected = Object.values(products.items || {});
const linkReport = JSON.parse(await fs.readFile(path.join(root, 'reports/affiliate-link-check.json'), 'utf8'));
const queue = JSON.parse(await fs.readFile(path.join(root, 'reports/room-post-queue.json'), 'utf8'));
const queueHtml = await fs.readFile(path.join(root, 'reports/room-post-queue.html'), 'utf8');
const app = await fs.readFile(path.join(root, 'app.js'), 'utf8');

assert.equal(selected.length, themes.length, 'all themes must have a selected product');
assert.equal(linkReport.total, selected.length, 'every selected product must be inspected');
assert.equal(linkReport.invalid, 0, 'affiliate link inspection must have no anomalies');
assert.equal(queue.length, selected.length, 'every selected product must have a ROOM draft');
assert.equal((queueHtml.match(/data-copy="name"/g) || []).length, queue.length, 'queue HTML must have one name copy button per product');
assert.equal((queueHtml.match(/data-copy="copy"/g) || []).length, queue.length, 'queue HTML must have one copy button per product');
assert.equal((queueHtml.match(/data-copy="url"/g) || []).length, queue.length, 'queue HTML must have one URL copy button per product');
assert.match(app, /data-affiliate-click/, 'product links must expose analytics metadata');
assert.doesNotMatch(app, /preventDefault\s*\(/, 'affiliate navigation must not be blocked');
console.log(`Daily output verified: ${selected.length} products, ${queue.length} ROOM drafts, ${linkReport.valid} affiliate links.`);
