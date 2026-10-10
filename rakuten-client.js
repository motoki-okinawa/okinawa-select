// 楽天Web Application向け。許可済みの公開ドメインから商品情報を取得します。
(function(){
  const API_ENDPOINT='https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701';
  const API_VERSION='2026-07-01';
  const CACHE_KEY='okinawa-select-rakuten-v1';
  const CACHE_TTL=24*60*60*1000;
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const safeHttps=value=>{try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}};

  function normalizeItem(theme,item){
    const imageCandidate=Array.isArray(item?.mediumImageUrls)?item.mediumImageUrls[0]:'';
    const imageUrl=typeof imageCandidate==='string'?imageCandidate:imageCandidate?.imageUrl||'';
    const affiliateUrl=safeHttps(item?.affiliateUrl);
    if(!affiliateUrl) return null;
    return {id:theme.id,itemCode:String(item?.itemCode||''),itemName:String(item?.itemName||'').trim(),itemPrice:Number(item?.itemPrice)||0,shopName:String(item?.shopName||'').trim(),affiliateUrl,imageUrl:safeHttps(imageUrl)};
  }

  function readCache(){
    try{
      const data=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');
      if(data?.apiVersion===API_VERSION&&data?.updatedAt&&Date.now()-Date.parse(data.updatedAt)<CACHE_TTL&&data.items) return data;
    }catch{}
    return null;
  }

  function writeCache(data){
    try{localStorage.setItem(CACHE_KEY,JSON.stringify(data));}catch{}
  }

  function requestJson(url){
    return new Promise((resolve,reject)=>{
      const xhr=new XMLHttpRequest();
      xhr.open('GET',url,true);
      xhr.responseType='json';
      xhr.timeout=10000;
      xhr.onload=()=>xhr.status>=200&&xhr.status<300?resolve(xhr.response):reject(new Error(`HTTP ${xhr.status}`));
      xhr.onerror=()=>reject(new Error('API load failed'));
      xhr.ontimeout=()=>reject(new Error('API timeout'));
      xhr.send();
    });
  }

  async function fetchTheme(theme,credentials){
    const params=new URLSearchParams({
      applicationId:credentials.applicationId,
      accessKey:credentials.accessKey,
      affiliateId:credentials.affiliateId,
      keyword:theme.query,
      format:'json',formatVersion:'2',hits:'5',availability:'1',imageFlag:'1',sort:'standard',
      elements:'itemName,itemPrice,itemUrl,affiliateUrl,mediumImageUrls,shopName,itemCode,availability'
    });
    const data=await requestJson(`${API_ENDPOINT}?${params}`);
    if(data?.error) throw new Error(data.error_description||data.error);
    return (Array.isArray(data?.items)?data.items:[]).map(item=>normalizeItem(theme,item)).find(item=>item&&item.itemName&&item.itemPrice>0)||null;
  }

  async function load({themes,credentials,onProgress,onStage}){
    const cached=readCache();
    if(cached){onStage?.('cache',0);onProgress?.(cached,true);return cached;}
    if(!credentials?.applicationId||!credentials?.accessKey||!credentials?.affiliateId) throw new Error('API configuration missing');
    const data={apiVersion:API_VERSION,updatedAt:new Date().toISOString(),items:{}};
    for(const [index,theme] of themes.entries()){
      onStage?.('request',index);
      try{
        const item=await fetchTheme(theme,credentials);
        if(item) data.items[theme.id]=item;
      }catch(error){
        onStage?.('error',index);
        if(index===0) throw error;
      }
      onStage?.('received',index);
      onProgress?.(data,false);
      if(index<themes.length-1) await wait(1200);
    }
    data.updatedAt=new Date().toISOString();
    writeCache(data);
    onStage?.('complete',themes.length);
    onProgress?.(data,false);
    return data;
  }

  window.RAKUTEN_CLIENT={load,API_VERSION};
})();
