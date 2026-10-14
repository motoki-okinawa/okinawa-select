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

test('確認済みのAmazon個別商品だけリンクする',async()=>{
  const [html,app,config,amazonProducts]=await Promise.all([read('index.html'),read('app.js'),read('config.js'),read('amazon-products.js')]);
  assert.match(html,/Amazonのアソシエイトとして、OKINAWA SELECTは適格販売により収入を得ています。/);
  assert.match(app,/amazonAssociateTag/);
  assert.match(app,/verifiedAmazonByRakutenCode\[live\.itemCode\]/);
  assert.match(app,/Amazonで商品を見る/);
  assert.match(app,/data-store="Amazon\.co\.jp"/);
  assert.doesNotMatch(app,/amazon\.co\.jp\/s\?k=/);
  assert.match(html,/amazon-products\.js/);
  assert.match(amazonProducts,/matchedByRakutenItemCode/);
  assert.match(amazonProducts,/amazonOnly/);
  assert.match(config,/amazonAssociateTag:\s*"a0a5f9-22"/);
});

test('Amazonだけの商品を独立カードとして追加できる',async()=>{
  const app=await read('app.js');
  assert.match(app,/Object\.entries\(amazonOnlyRecords\)/);
  assert.match(app,/marketplace:'amazon'/);
  assert.match(app,/p\?\.marketplace==='amazon'/);
});

test('Instagramと楽天ROOMへの送客導線がある',async()=>{
  const [html,app,config,css]=await Promise.all([read('index.html'),read('app.js'),read('config.js'),read('styles.css')]);
  assert.match(html,/沖縄のグルメ・旅情報は/);
  assert.match(html,/id="instagramTop"/);
  assert.match(html,/id="instagramBottom"/);
  assert.match(html,/id="roomBottom"/);
  assert.match(config,/instagramUrl:\s*"https:\/\/www\.instagram\.com\/okinawa_gurumetabi\/"/);
  assert.match(app,/instagramTop/);
  assert.match(css,/\.social-grid\{/);
});
