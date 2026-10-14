// Amazonで同一商品を確認できた場合だけ、楽天の商品コードをキーに登録します。
// 例: "shop:item-code": { asin: "B012345678", verifiedAt: "2026-10-14", productName: "確認した商品名" }
window.AMAZON_PRODUCTS = {
  updatedAt: null,
  items: {}
};
