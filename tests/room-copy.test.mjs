import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoomDraft } from '../scripts/room-copy.mjs';

test('未購入商品を使用済みと表現しない', () => {
  const draft = createRoomDraft({ group: '沖縄旅行の便利グッズ', themeName: '防水ケース' });
  assert.match(draft.copy, /持ち物候補/);
  assert.doesNotMatch(draft.copy, /使った|愛用|買ってよかった/);
});

test('ジャンルに合うハッシュタグを付ける', () => {
  const draft = createRoomDraft({ group: '沖縄のお取り寄せグルメ', themeName: '沖縄そば' });
  assert.deepEqual(draft.hashtags, ['#沖縄グルメ', '#沖縄土産', '#お取り寄せ']);
});
