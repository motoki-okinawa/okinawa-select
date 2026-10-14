const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function renderRoomQueueHtml(rows, checkedAt) {
  const cards = rows.map((row, index) => `<article class="card" data-item-key="${esc(row.itemCode || row.rakutenUrl)}">
    <div class="badge">${esc(row.group)}</div>
    <h2>${index + 1}. ${esc(row.themeName)}</h2>
    <p class="name">${esc(row.itemName)}</p>
    <p class="meta">${Number(row.itemPrice).toLocaleString('ja-JP')}円・★${esc(row.reviewAverage || '未取得')}（${Number(row.reviewCount || 0).toLocaleString('ja-JP')}件）・${row.freeShipping ? '送料込み' : '送料要確認'}</p>
    <label>ROOM紹介文</label><textarea readonly>${esc(row.copy)}</textarea>
    <label>商品URL</label><input readonly value="${esc(row.rakutenUrl)}">
    <div class="buttons">
      <button data-copy="copy">2. 紹介文をコピー</button>
      <button data-copy="name">商品名をコピー</button>
      <button data-copy="url">商品URLをコピー</button>
      <button data-copy="all">3点まとめてコピー</button>
    </div>
    <div class="actions"><a class="open-product" href="${esc(row.rakutenUrl)}" target="_blank" rel="sponsored noopener noreferrer">1. 楽天市場の商品を開く ↗</a><button class="mark-posted" data-mark-posted>4. 投稿済みにする</button></div>
  </article>`).join('\n');

  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>楽天ROOM 投稿準備</title><style>
  :root{font-family:system-ui,'Noto Sans JP',sans-serif;color:#173d41;background:#f5faf7}body{margin:0}.wrap{max-width:980px;margin:auto;padding:32px 18px 70px}h1{margin:0 0 8px}.progress{position:sticky;top:0;z-index:2;background:#173d41;color:white;padding:14px 18px;border-radius:0 0 12px 12px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 8px 20px #1234}.progress strong{font-size:18px}.progress button{color:white;border-color:#fff8}.notice{background:#fff5d8;border:1px solid #ead493;padding:14px;border-radius:10px;margin:20px 0;line-height:1.8}.card{background:white;border:1px solid #dce9e3;border-radius:14px;padding:22px;margin:16px 0;box-shadow:0 8px 22px #1233;transition:.2s}.card.posted{opacity:.58;border-color:#70a187;background:#eef8f1}.card.posted h2:after{content:'  ✓ 投稿済み';font-size:13px;color:#306b52}.badge{font-size:12px;color:#07827f;font-weight:700}.name{font-weight:700}.meta{font-size:13px;color:#637975}label{display:block;font-size:12px;font-weight:700;margin:15px 0 6px}textarea,input{width:100%;box-sizing:border-box;border:1px solid #c9dbd3;border-radius:8px;padding:11px;background:#fbfdfc}textarea{min-height:100px;resize:vertical}.buttons,.actions{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}button,.open-product{border:1px solid #10827e;background:white;color:#075d5a;border-radius:8px;padding:9px 12px;cursor:pointer;font-weight:700}.open-product{background:#087a77;color:white;text-decoration:none}.mark-posted.done{background:#306b52;color:white}.copy-flash{background:#306b52!important;color:white!important}a{color:#087a77;font-weight:700}small{color:#687b77}
  </style></head><body><main class="wrap"><h1>楽天ROOM 投稿準備</h1><small>生成日時: ${esc(checkedAt)}</small><div class="progress"><strong id="progressCount">0 / ${rows.length} 投稿済み</strong><button data-reset-progress>進捗をリセット</button></div><p class="notice"><b>各商品を①〜④の順で進めます。</b><br>①楽天市場の商品を開く → 商品ページのROOMアイコンを押す → ②紹介文をコピーしてROOMのコメント欄へ貼る → ③ROOMで投稿する → ④この画面で「投稿済みにする」。投稿ボタンは本人が押してください。</p>${cards}</main><script>
  const storageKey='okinawa-select-room-posted';
  let posted=new Set(JSON.parse(localStorage.getItem(storageKey)||'[]'));
  const refreshProgress=()=>{document.querySelectorAll('.card').forEach(card=>{const on=posted.has(card.dataset.itemKey);card.classList.toggle('posted',on);const button=card.querySelector('[data-mark-posted]');button.classList.toggle('done',on);button.textContent=on?'✓ 投稿済み':'4. 投稿済みにする'});document.getElementById('progressCount').textContent=posted.size+' / ${rows.length} 投稿済み'};
  const value=(card,type)=>{const name=card.querySelector('.name').textContent;const copy=card.querySelector('textarea').value;const url=card.querySelector('input').value;return type==='name'?name:type==='copy'?copy:type==='url'?url:[name,copy,url].join('\\n\\n')};
  document.addEventListener('click',async event=>{const mark=event.target.closest('[data-mark-posted]');if(mark){const key=mark.closest('.card').dataset.itemKey;posted.has(key)?posted.delete(key):posted.add(key);localStorage.setItem(storageKey,JSON.stringify([...posted]));refreshProgress();return}if(event.target.closest('[data-reset-progress]')){posted.clear();localStorage.removeItem(storageKey);refreshProgress();return}const button=event.target.closest('[data-copy]');if(!button)return;const text=value(button.closest('.card'),button.dataset.copy);try{await navigator.clipboard.writeText(text)}catch{const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();document.execCommand('copy');area.remove()}const old=button.textContent;button.textContent='コピーしました';button.classList.add('copy-flash');setTimeout(()=>{button.textContent=old;button.classList.remove('copy-flash')},1200)});
  refreshProgress();
  </script></body></html>`;
}
