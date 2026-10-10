const categories=['すべて','旅の便利グッズ','海・レジャー','沖縄のお土産','沖縄の食品','沖縄雑貨','撮影・スマホ'];
const $$=(q)=>document.querySelector(q);
let selected='すべて', favOnly=false;
let favorites=new Set(JSON.parse(localStorage.getItem('okinawa-select-faves')||'[]'));
const items=window.PRODUCTS||[];
let liveItems=window.RAKUTEN_PRODUCTS?.items||{};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeHttps=(value)=>{try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}};
const rakutenSearch=q=>'https://search.rakuten.co.jp/search/mall/'+encodeURIComponent(q)+'/';
const yen=value=>Number.isFinite(Number(value))?`${Number(value).toLocaleString('ja-JP')}円`:'';

function drawFilters(){
  $$('#filters').innerHTML=categories.map(c=>`<button class="chip ${selected===c?'active':''}" data-cat="${esc(c)}" aria-pressed="${selected===c}">${esc(c)}</button>`).join('');
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{selected=b.dataset.cat;drawFilters();drawProducts();});
}
function productVisual(p,live){
  const image=safeHttps(live?.imageUrl);
  return image ? `<img src="${esc(image)}" alt="${esc(live.itemName||p.name)}" loading="lazy" referrerpolicy="no-referrer">` : `<span class="product-icon">${esc(p.icon)}</span><span class="visual-type">OKINAWA SELECT</span>`;
}
function liveProductDetail(live){
  if(!live) return '';
  return `<div class="live-product"><p class="live-product-name">${esc(live.itemName)}</p><div class="live-meta"><span class="shop-name">${esc(live.shopName)}</span><strong class="price">${esc(yen(live.itemPrice))}</strong></div></div>`;
}
function drawProducts(){
  const needle=$$('#search').value.toLocaleLowerCase('ja-JP').trim();
  const filtered=items.filter(p=>(selected==='すべて'||p.category===selected)&&(!favOnly||favorites.has(p.id))&&(!needle||[p.name,p.category,p.note,...p.tags,liveItems[p.id]?.itemName||''].join(' ').toLocaleLowerCase('ja-JP').includes(needle)));
  $$('#resultCount').textContent=`${filtered.length} アイテム`;
  $$('#empty').hidden=filtered.length>0;
  $$('#products').innerHTML=filtered.map(p=>{
    const live=liveItems[p.id];
    const affiliateUrl=safeHttps(live?.affiliateUrl);
    const href=affiliateUrl||rakutenSearch(p.query);
    const linkText=affiliateUrl?'楽天市場で商品を見る':'楽天市場で検索';
    return `<article class="product"><div class="product-visual ${esc(p.color)}">${productVisual(p,live)}<button class="heart ${favorites.has(p.id)?'on':''}" data-fav="${p.id}" aria-label="${esc(p.name)}をお気に入り${favorites.has(p.id)?'から削除':'に追加'}" aria-pressed="${favorites.has(p.id)}">${favorites.has(p.id)?'♥':'♡'}</button></div><div class="product-body"><span class="category">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p class="tagline">${esc(p.label)}</p><p class="desc">${esc(p.note)}</p>${liveProductDetail(live)}<div class="product-bottom"><a href="${esc(href)}" target="_blank" rel="sponsored noopener noreferrer" aria-label="${esc(linkText)}：${esc(p.name)}">${linkText} <span>↗</span></a></div></div></article>`;
  }).join('');
  document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.fav);favorites.has(id)?favorites.delete(id):favorites.add(id);localStorage.setItem('okinawa-select-faves',JSON.stringify([...favorites]));drawProducts();});
}
const checklistData={'必需品':['航空券・予約情報','身分証明書','財布・決済手段','スマートフォン・充電器','着替え・下着'],'沖縄ならでは':['日焼け止め','帽子・サングラス','折りたたみ傘・雨具','羽織れる上着','歩きやすい靴'],'海・アクティビティ':['水着・ラッシュガード','ビーチサンダル・マリンシューズ','タオル・着替え袋','スマホ防水ケース','飲み水・熱中症対策']};
const allChecks=Object.values(checklistData).flat();
let checked=new Set(JSON.parse(localStorage.getItem('okinawa-select-checks')||'[]'));
function drawChecks(){
  $$('#checklist').innerHTML=Object.entries(checklistData).map(([group,arr])=>`<div class="check-group"><h3>${esc(group)}</h3>${arr.map(x=>`<label class="check-item"><input type="checkbox" data-check="${esc(x)}" ${checked.has(x)?'checked':''}><span>${esc(x)}</span></label>`).join('')}</div>`).join('');
  document.querySelectorAll('[data-check]').forEach(el=>el.onchange=()=>{el.checked?checked.add(el.dataset.check):checked.delete(el.dataset.check);localStorage.setItem('okinawa-select-checks',JSON.stringify([...checked]));updateProgress();});
  updateProgress();
}
function updateProgress(){const n=allChecks.filter(x=>checked.has(x)).length;$$('#progressText').textContent=`${n} / ${allChecks.length} チェック済み`;$$('#progressBar').style.width=`${n/allChecks.length*100}%`;}
function showUpdatedAt(updatedAt){
if(updatedAt&&Object.keys(liveItems).length){
  const stamp=new Intl.DateTimeFormat('ja-JP',{dateStyle:'medium',timeZone:'Asia/Tokyo'}).format(new Date(updatedAt));
  $$('#dataStatus').textContent=`商品情報は${stamp}更新。価格・在庫はリンク先を優先してください。`;
}
}
showUpdatedAt(window.RAKUTEN_PRODUCTS?.updatedAt);
$$('#search').oninput=drawProducts;
$$('#favFilter').onclick=()=>{favOnly=!favOnly;$$('#favFilter').classList.toggle('active',favOnly);$$('#favFilter').setAttribute('aria-pressed',String(favOnly));drawProducts();};
$$('#resetChecks').onclick=()=>{checked.clear();localStorage.removeItem('okinawa-select-checks');drawChecks();};
$$('#year').textContent=new Date().getFullYear();
const room=window.SITE_CONFIG?.roomUrl;
if(room&&/^https:\/\/room\.rakuten\.co\.jp\//.test(room)){for(const id of ['roomTop','roomBottom']){const node=document.getElementById(id);node.href=room;node.target='_blank';node.rel='noopener noreferrer';node.textContent='楽天ROOMを見る ↗';}}else{$$('#roomTop').setAttribute('title','楽天ROOMのURL設定後に有効になります');}
$$('#menuBtn').onclick=()=>{const nav=document.querySelector('nav');const on=nav.classList.toggle('open');$$('#menuBtn').setAttribute('aria-expanded',String(on));};
document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>{document.querySelector('nav').classList.remove('open');$$('#menuBtn').setAttribute('aria-expanded','false');});
drawFilters();drawProducts();drawChecks();
const rakutenConfig=window.SITE_CONFIG?.rakuten;
if(window.RAKUTEN_CLIENT&&rakutenConfig?.applicationId){
  const dataStatus=$$('#dataStatus');
  dataStatus.textContent='楽天市場の商品情報を確認中…';
  dataStatus.dataset.apiState='starting';
  window.RAKUTEN_CLIENT.load({themes:items,credentials:rakutenConfig,onStage:(stage,index)=>{
    dataStatus.dataset.apiState=`${stage}-${index}`;
  },onProgress:(data)=>{
    liveItems=data.items||{};
    drawProducts();
    showUpdatedAt(data.updatedAt);
  }}).then(data=>{if(!data) throw new Error('API data unavailable');dataStatus.dataset.apiState='ready';}).catch(error=>{
    dataStatus.dataset.apiState='error';
    dataStatus.title=error?.message||'API error';
    dataStatus.textContent='販売状況・価格はリンク先で確認してください。';
    console.warn('Rakuten product refresh failed.');
  });
}
