import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('商品一覧に4カテゴリーの案内とグループ表示がある',async()=>{
  const [html,app,css]=await Promise.all([read('index.html'),read('app.js'),read('styles.css')]);
  assert.match(html,/id="categoryOverview"/);
  assert.match(html,/class="category-results" id="products"/);
  for(const label of ['沖縄グルメ','旅行便利グッズ','沖縄雑貨・ファッション','旅行・撮影用品']) assert.match(app,new RegExp(label));
  assert.match(app,/showGroups=selected==='すべて'/);
  assert.match(app,/class="category-block"/);
  assert.match(css,/\.category-overview\{/);
  assert.match(css,/\.category-block-header\{/);
});

test('既存データの4カテゴリーと表示定義が一致する',async()=>{
  const [products,app]=await Promise.all([read('products.js'),read('app.js')]);
  for(const key of ['沖縄旅行の便利グッズ','沖縄のお取り寄せグルメ','沖縄雑貨・ファッション','旅行・撮影用品']){
    assert.match(products,new RegExp(key));
    assert.match(app,new RegExp(`key:'${key}'`));
  }
});

test('Amazonリンクと広告開示が設定されている',async()=>{
  const [html,app,config]=await Promise.all([read('index.html'),read('app.js'),read('config.js')]);
  assert.match(html,/Amazonのアソシエイトとして、OKINAWA SELECTは適格販売により収入を得ています。/);
  assert.match(app,/amazonAssociateTag/);
  assert.match(app,/Amazonで探す/);
  assert.match(app,/data-store="Amazon\.co\.jp"/);
  assert.match(config,/amazonAssociateTag:\s*"a0a5f9-22"/);
});
