import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAffiliateLinkReport, inspectAffiliateLink } from '../scripts/affiliate-link-validation.mjs';

const validUrl = 'https://hb.afl.rakuten.co.jp/hgc/code/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshop%2Fitem%2F&rafcid=tracking';

test('楽天APIのアフィリエイト商品URLを正常として扱う', () => {
  assert.deepEqual(inspectAffiliateLink({ affiliateUrl: validUrl }).issues, []);
});

test('通常URLや計測パラメータ欠落を異常として記録する', () => {
  const result = inspectAffiliateLink({ affiliateUrl: 'https://item.rakuten.co.jp/shop/item/' });
  assert.equal(result.structurallyValid, false);
  assert.ok(result.issues.includes('unexpected_affiliate_host'));
  assert.ok(result.issues.includes('missing_tracking_parameter'));
});

test('検査レポートに件数と異常内容を保存する', () => {
  const report = buildAffiliateLinkReport([{ themeId: 1, affiliateUrl: validUrl }, { themeId: 2, affiliateUrl: 'bad' }], '2026-10-13T00:00:00Z');
  assert.equal(report.total, 2);
  assert.equal(report.valid, 1);
  assert.equal(report.invalid, 1);
  assert.equal(report.validationMode, 'structure_only_no_navigation');
});
