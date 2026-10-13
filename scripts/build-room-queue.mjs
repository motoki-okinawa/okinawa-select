import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRoomDraft } from './room-copy.mjs';
import { renderRoomQueueHtml } from './room-queue-html.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidatesPath = path.join(root, 'data/product-candidates.json');
const groups = JSON.parse(await fs.readFile(candidatesPath, 'utf8'));
const checkedAt = new Date().toISOString();
const rows = groups.flatMap(({ candidates }) => candidates.slice(0, 1)).map(item => {
  const draft = createRoomDraft(item);
  return {
    status: 'manual_post_required',
    checkedAt,
    group: item.group,
    themeName: item.themeName,
    itemCode: item.itemCode,
    itemName: item.itemName,
    itemPrice: item.itemPrice,
    reviewAverage: item.reviewAverage,
    reviewCount: item.reviewCount,
    freeShipping: item.freeShipping,
    affiliateRate: item.affiliateRate,
    score: item.score,
    // ROOM creates its own affiliate attribution when a normal Rakuten item URL
    // is posted. Keep the API affiliateUrl exclusive to OKINAWA SELECT.
    rakutenUrl: item.itemUrl,
    copy: draft.copy,
    hashtags: draft.hashtags
  };
});

const seen = new Set();
const uniqueRows = rows.filter(row => !seen.has(row.itemCode) && seen.add(row.itemCode));
await fs.mkdir(path.join(root, 'reports'), { recursive: true });
await fs.writeFile(path.join(root, 'reports/room-post-queue.json'), `${JSON.stringify(uniqueRows, null, 2)}\n`);
const markdown = ['# 楽天ROOM 投稿待ちキュー', '', `生成日時: ${checkedAt}`, '', '> ROOM利用規約に従い、最終投稿ボタンは本人が公式画面で押してください。', ''];
for (const [index, row] of uniqueRows.entries()) {
  markdown.push(`## ${index + 1}. ${row.themeName}`, '', `- 商品: ${row.itemName}`, `- 価格: ${row.itemPrice.toLocaleString('ja-JP')}円`, `- レビュー: ${row.reviewAverage || '未取得'}（${row.reviewCount.toLocaleString('ja-JP')}件）`, `- 送料: ${row.freeShipping ? '送料込み' : '商品ページで確認'}`, `- 選定スコア: ${row.score}`, `- 楽天市場: ${row.rakutenUrl}`, '', row.copy, '');
}
await fs.writeFile(path.join(root, 'reports/room-post-queue.md'), `${markdown.join('\n')}\n`);
await fs.writeFile(path.join(root, 'reports/room-post-queue.html'), renderRoomQueueHtml(uniqueRows, checkedAt));
console.log(`Prepared ${uniqueRows.length} manual ROOM posts.`);
