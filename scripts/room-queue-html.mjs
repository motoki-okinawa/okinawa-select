const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function renderRoomQueueHtml(rows, checkedAt) {
  const cards = rows.map((row, index) => `<article class="card">
    <div class="badge">${esc(row.group)}</div>
    <h2>${index + 1}. ${esc(row.themeName)}</h2>
    <p class="name">${esc(row.itemName)}</p>
    <p class="meta">${Number(row.itemPrice).toLocaleString('ja-JP')}円・★${esc(row.reviewAverage || '未取得')}（${Number(row.reviewCount || 0).toLocaleString('ja-JP')}件）・${row.freeShipping ? '送料込み' : '送料要確認'}</p>
    <label>ROOM紹介文</label><textarea readonly>${esc(row.copy)}</textarea>
    <label>商品URL</label><input readonly value="${esc(row.rakutenUrl)}">
    <div class="buttons">
      <button data-copy="name">商品名をコピー</button>
      <button data-copy="copy">紹介文をコピー</button>
      <button data-copy="url">商品URLをコピー</button>
      <button class="primary" data-copy="all">3点まとめてコピー</button>
    </div>
    <a href="${esc(row.rakutenUrl)}" target="_blank" rel="sponsored noopener noreferrer">楽天市場の商品を確認 ↗</a>
  </article>`).join('\n');

  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>楽天ROOM 投稿準備</title><style>
  :root{font-family:system-ui,'Noto Sans JP',sans-serif;color:#173d41;background:#f5faf7}body{margin:0}.wrap{max-width:980px;margin:auto;padding:32px 18px 70px}h1{margin:0 0 8px}.notice{background:#fff5d8;border:1px solid #ead493;padding:14px;border-radius:10px;margin:20px 0}.card{background:white;border:1px solid #dce9e3;border-radius:14px;padding:22px;margin:16px 0;box-shadow:0 8px 22px #1233}.badge{font-size:12px;color:#07827f;font-weight:700}.name{font-weight:700}.meta{font-size:13px;color:#637975}label{display:block;font-size:12px;font-weight:700;margin:15px 0 6px}textarea,input{width:100%;box-sizing:border-box;border:1px solid #c9dbd3;border-radius:8px;padding:11px;background:#fbfdfc}textarea{min-height:100px;resize:vertical}.buttons{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}button{border:1px solid #10827e;background:white;color:#075d5a;border-radius:8px;padding:9px 12px;cursor:pointer;font-weight:700}.primary{background:#087a77;color:white}.done{background:#306b52!important;color:white!important}a{color:#087a77;font-weight:700}small{color:#687b77}
  </style></head><body><main class="wrap"><h1>楽天ROOM 投稿準備</h1><small>生成日時: ${esc(checkedAt)}</small><p class="notice">商品内容を公式画面で最終確認し、投稿ボタンは本人が押してください。自動投稿や自動クリックは行いません。</p>${cards}</main><script>
  const value=(card,type)=>{const name=card.querySelector('.name').textContent;const copy=card.querySelector('textarea').value;const url=card.querySelector('input').value;return type==='name'?name:type==='copy'?copy:type==='url'?url:[name,copy,url].join('\\n\\n')};
  document.addEventListener('click',async event=>{const button=event.target.closest('[data-copy]');if(!button)return;const text=value(button.closest('.card'),button.dataset.copy);try{await navigator.clipboard.writeText(text)}catch{const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();document.execCommand('copy');area.remove()}const old=button.textContent;button.textContent='コピーしました';button.classList.add('done');setTimeout(()=>{button.textContent=old;button.classList.remove('done')},1200)});
  </script></body></html>`;
}
