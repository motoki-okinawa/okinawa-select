// Amazonで同一商品を確認できた場合は、楽天の商品コードをキーに matchedByRakutenItemCode へ登録します。
// Amazonだけで確認できた商品は amazonOnly へ独立して登録します。
window.AMAZON_PRODUCTS = {
  updatedAt: null,
  matchedByRakutenItemCode: {
    // "shop:item-code": { asin: "B012345678", verifiedAt: "2026-10-14", productName: "確認した商品名" }
  },
  amazonOnly: {
    // "amazon-B012345678": {
    //   asin: "B012345678", verifiedAt: "2026-10-14", name: "商品名",
    //   category: "沖縄旅行の便利グッズ", label: "短い特徴", note: "独自の紹介文",
    //   tags: ["旅行"], color: "mint", icon: "A"
    // }
  }
};
