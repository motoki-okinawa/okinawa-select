import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRoomQueueHtml } from '../scripts/room-queue-html.mjs';

test('商品名・紹介文・URLのコピー操作を含む', () => {
  const html = renderRoomQueueHtml([{ group: '沖縄旅行', themeName: '防水ケース', itemName: '商品A', itemPrice: 1000, reviewAverage: 4.5, reviewCount: 10, freeShipping: true, copy: '独自紹介文', rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/x/?rafcid=y' }], 'now');
  for (const type of ['name', 'copy', 'url', 'all']) assert.match(html, new RegExp(`data-copy="${type}"`));
  assert.match(html, /投稿ボタンは本人が押してください/);
  assert.match(html, /独自紹介文/);
});
