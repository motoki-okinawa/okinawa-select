const categoryDefinitions=[
  {key:'沖縄のお取り寄せグルメ',name:'沖縄グルメ',label:'TASTE OF OKINAWA',icon:'01',description:'旅の余韻を楽しめるお取り寄せと、喜ばれる沖縄土産。'},
  {key:'沖縄旅行の便利グッズ',name:'旅行便利グッズ',label:'TRAVEL ESSENTIALS',icon:'02',description:'日差し・海・移動に備えて、沖縄旅を快適にするアイテム。'},
  {key:'沖縄雑貨・ファッション',name:'沖縄雑貨・ファッション',label:'ISLAND GOODS',icon:'03',description:'Tシャツ、シーサー、琉球ガラスなど、食品以外の沖縄土産。'},
  {key:'旅行・撮影用品',name:'旅行・撮影用品',label:'TRAVEL & CAMERA',icon:'04',description:'旅の景色や思い出を、きれいに残すための撮影アイテム。'}
];
const categories=['すべて',...categoryDefinitions.map(category=>category.key)];
const $$=(q)=>document.querySelector(q);
let selected='すべて', favOnly=false;
let favorites=new Set(JSON.parse(localStorage.getItem('okinawa-select-faves')||'[]'));
const items=window.PRODUCTS||[];
let liveItems=window.RAKUTEN_PRODUCTS?.items||{};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeHttps=(value)=>{try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}};
const yen=value=>Number.isFinite(Number(value))?`${Number(value).toLocaleString('ja-JP')}円`:'';
const analyticsId=String(window.SITE_CONFIG?.analyticsId||'').trim();
const amazonAssociateTag=String(window.SITE_CONFIG?.amazonAssociateTag||'').trim();
const verifiedAmazonItems=window.AMAZON_PRODUCTS?.items||{};

function verifiedAmazonUrl(live){
  if(!live?.itemCode||!amazonAssociateTag)return '';
  const record=verifiedAmazonItems[live.itemCode];
  const asin=String(record?.asin||'').trim().toUpperCase();
  if(!/^[A-Z0-9]{10}$/.test(asin)||!/^\d{4}-\d{2}-\d{2}$/.test(String(record?.verifiedAt||'')))return '';
  return `https://www.amazon.co.jp/dp/${asin}?tag=${encodeURIComponent(amazonAssociateTag)}`;
}

function categoryName(key){return categoryDefinitions.find(category=>category.key===key)?.name||key;}
function selectCategory(key){selected=key;drawFilters();drawCategoryOverview();drawProducts();}
function drawCategoryOverview(){
  $$('#categoryOverview').innerHTML=categoryDefinitions.map(category=>{
    const count=items.filter(item=>item.category===category.key).length;
    return `<button class="category-card ${selected===category.key?'active':''}" data-category-card="${esc(category.key)}" aria-pressed="${selected===category.key}"><span class="category-card-number">${esc(category.icon)}</span><span class="category-card-copy"><small>${esc(category.label)}</small><strong>${esc(category.name)}</strong><span>${esc(category.description)}</span></span><b>${count}<small> items</small></b></button>`;
  }).join('');
  document.querySelectorAll('[data-category-card]').forEach(button=>button.onclick=()=>selectCategory(button.dataset.categoryCard));
}
function drawFilters(){
  $$('#filters').innerHTML=categories.map(category=>`<button class="chip ${selected===category?'active':''}" data-cat="${esc(category)}" aria-pressed="${selected===category}">${esc(category==='すべて'?'すべて':categoryName(category))}</button>`).join('');
  document.querySelectorAll('[data-cat]').forEach(button=>button.onclick=()=>selectCategory(button.dataset.cat));
}
function productVisual(p,live){
  const image=safeHttps(live?.imageUrl);
  return image ? `<img src="${esc(image)}" alt="${esc(live.itemName||p.name)}" loading="lazy" referrerpolicy="no-referrer">` : `<span class="product-icon">${esc(p.icon)}</span><span class="visual-type">OKINAWA SELECT</span>`;
}
function liveProductDetail(live){
  if(!live) return '';
  const review=live.reviewAverage?`★ ${Number(live.reviewAverage).toFixed(2)}（${Number(live.reviewCount||0).toLocaleString('ja-JP')}件）`:'レビュー情報なし';
  const shipping=live.freeShipping?'送料込み':'送料は商品ページで確認';
  return `<div class="live-product"><p class="live-product-name">${esc(live.itemName)}</p><div class="live-meta"><span class="shop-name">${esc(live.shopName)}</span><strong class="price">${esc(yen(live.itemPrice))}</strong></div><p class="product-facts">${esc(review)} · ${esc(shipping)}</p></div>`;
}
function productCard(p){
  const live=liveItems[p.id];
  const affiliateUrl=safeHttps(live?.affiliateUrl);
  const tracking=affiliateUrl?` data-affiliate-click data-store="Rakuten Ichiba" data-item-id="${esc(live.itemCode||p.id)}" data-item-name="${esc(p.name)}" data-category="${esc(p.category)}" data-price="${esc(live.itemPrice||'')}" data-position="${esc(p.id)}"`:'';
  const rakutenLink=affiliateUrl?`<a href="${esc(affiliateUrl)}" target="_blank" rel="sponsored noopener noreferrer" aria-label="楽天市場で商品を見る：${esc(p.name)}"${tracking}>楽天市場で商品を見る <span>↗</span></a>`:'';
  const amazonUrl=safeHttps(verifiedAmazonUrl(live));
  const amazonLink=amazonUrl?`<a class="amazon-link" href="${esc(amazonUrl)}" target="_blank" rel="sponsored noopener noreferrer" aria-label="Amazonで商品を見る：${esc(p.name)}" data-affiliate-click data-store="Amazon.co.jp" data-item-id="amazon-${esc(live.itemCode)}" data-item-name="${esc(p.name)}" data-category="${esc(p.category)}" data-price="" data-position="${esc(p.id)}">Amazonで商品を見る <span>↗</span></a>`:'';
  const shopLinks=rakutenLink||amazonLink?`${rakutenLink}${amazonLink}`:'<span class="store-unavailable">販売先を確認中</span>';
  return `<article class="product"><div class="product-visual ${esc(p.color)}">${productVisual(p,live)}<button class="heart ${favorites.has(p.id)?'on':''}" data-fav="${p.id}" aria-label="${esc(p.name)}をお気に入り${favorites.has(p.id)?'から削除':'に追加'}" aria-pressed="${favorites.has(p.id)}">${favorites.has(p.id)?'♥':'♡'}</button></div><div class="product-body"><span class="category">${esc(categoryName(p.category))}</span><h3>${esc(p.name)}</h3><p class="tagline">${esc(p.label)}</p><p class="desc">${esc(p.note)}</p>${liveProductDetail(live)}<div class="product-bottom"><div class="shop-links">${shopLinks}</div></div></div></article>`;
}
function drawProducts(){
  const needle=$$('#search').value.toLocaleLowerCase('ja-JP').trim();
  const filtered=items.filter(p=>(selected==='すべて'||p.category===selected)&&(!favOnly||favorites.has(p.id))&&(!needle||[p.name,p.category,p.note,...p.tags,liveItems[p.id]?.itemName||''].join(' ').toLocaleLowerCase('ja-JP').includes(needle)));
  $$('#resultCount').textContent=`${filtered.length} アイテム`;
  $$('#empty').hidden=filtered.length>0;
  const showGroups=selected==='すべて'&&!needle&&!favOnly;
  $$('#products').innerHTML=showGroups?categoryDefinitions.map(category=>{
    const categoryItems=filtered.filter(item=>item.category===category.key);
    if(!categoryItems.length)return '';
    return `<section class="category-block" aria-labelledby="category-${esc(category.icon)}"><div class="category-block-header"><div><span>${esc(category.label)}</span><h3 id="category-${esc(category.icon)}">${esc(category.name)}</h3><p>${esc(category.description)}</p></div><button data-show-category="${esc(category.key)}">このカテゴリーを見る <span>→</span></button></div><div class="product-grid">${categoryItems.map(productCard).join('')}</div></section>`;
  }).join(''):`<div class="product-grid">${filtered.map(productCard).join('')}</div>`;
  document.querySelectorAll('[data-show-category]').forEach(button=>button.onclick=()=>selectCategory(button.dataset.showCategory));
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
const instagram=window.SITE_CONFIG?.instagramUrl;
if(instagram&&/^https:\/\/(www\.)?instagram\.com\//.test(instagram)){for(const id of ['instagramTop','instagramBottom']){const node=document.getElementById(id);node.href=instagram;node.target='_blank';node.rel='noopener noreferrer';node.textContent='Instagramを見る ↗';}}else{$$('#instagramTop').setAttribute('title','InstagramのURL設定後に有効になります');}
$$('#menuBtn').onclick=()=>{const nav=document.querySelector('nav');const on=nav.classList.toggle('open');$$('#menuBtn').setAttribute('aria-expanded',String(on));};
document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>{document.querySelector('nav').classList.remove('open');$$('#menuBtn').setAttribute('aria-expanded','false');});
drawFilters();drawCategoryOverview();drawProducts();drawChecks();
function initAnalytics(){
  if(!/^G-[A-Z0-9]+$/i.test(analyticsId)) return;
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  const saved=localStorage.getItem('okinawa-select-analytics-consent');
  window.gtag('consent','default',{analytics_storage:saved==='granted'?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
  window.gtag('js',new Date());window.gtag('config',analyticsId,{send_page_view:true});
  const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;document.head.append(script);
  if(!saved){const banner=document.createElement('div');banner.className='analytics-consent';banner.innerHTML='<p>商品選びの改善のため、匿名の閲覧・商品クリック情報を計測してもよいですか？</p><div><button data-consent="denied">拒否</button><button class="accept" data-consent="granted">許可</button></div>';document.body.append(banner);banner.querySelectorAll('[data-consent]').forEach(button=>button.onclick=()=>{const value=button.dataset.consent;localStorage.setItem('okinawa-select-analytics-consent',value);window.gtag('consent','update',{analytics_storage:value});banner.remove();});}
  document.addEventListener('click',event=>{const link=event.target.closest('[data-affiliate-click]');if(!link||localStorage.getItem('okinawa-select-analytics-consent')!=='granted')return;window.gtag('event','select_item',{item_list_id:'okinawa_select',item_list_name:'OKINAWA SELECT',items:[{item_id:link.dataset.itemId,item_name:link.dataset.itemName,item_category:link.dataset.category,price:Number(link.dataset.price)||0,index:Number(link.dataset.position)||0,affiliation:link.dataset.store||'Unknown'}],transport_type:'beacon'});});
}
initAnalytics();
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
