import test from 'node:test';
import assert from 'node:assert/strict';
import { rankItems, scoreItem } from '../scripts/product-ranking.mjs';

const theme = { id: 1, group: '沖縄旅行の便利グッズ', name: '防水ケース', minPrice: 500, maxPrice: 3000, priority: 5 };
const base = { itemCode: 'shop:item', itemName: '防水ケース', itemPrice: 1500, shopName: '店', itemUrl: 'https://item.rakuten.co.jp/shop/item/', affiliateUrl: 'https://example.com/a', mediumImageUrls: ['https://example.com/a.jpg'], reviewAverage: 4.5, reviewCount: 100, postageFlag: 0, pointRate: 1 };

test('レビュー・送料無料・価格帯を含めて高い候補を優先する', () => {
  const strong = { ...base, itemCode: 'shop:strong', reviewAverage: 4.8, reviewCount: 1200 };
  const weak = { ...base, itemCode: 'shop:weak', reviewAverage: 3.9, reviewCount: 4, postageFlag: 1, itemPrice: 2900 };
  const ranked = rankItems(theme, [weak, strong]);
  assert.equal(ranked[0].itemCode, 'shop:strong');
  assert.ok(ranked[0].score > ranked[1].score);
});

test('低評価商品と重複商品を除外する', () => {
  const low = { ...base, itemCode: 'shop:low', reviewAverage: 3.2 };
  const duplicate = { ...base };
  const ranked = rankItems(theme, [low, base, duplicate]);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].itemCode, 'shop:item');
});

test('スコアは0から100の範囲に収まる', () => {
  const item = rankItems(theme, [base])[0];
  assert.ok(scoreItem(theme, item) >= 0 && scoreItem(theme, item) <= 100);
});

test('ROOM投稿用の通常商品URLを保持する', () => {
  const item = rankItems(theme, [base])[0];
  assert.equal(item.itemUrl, base.itemUrl);
  assert.notEqual(item.itemUrl, item.affiliateUrl);
});
