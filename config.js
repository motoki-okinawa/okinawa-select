// 初期公開前に設定する項目です。未設定のままでもサイトは動作します。
window.SITE_CONFIG = {
  roomUrl: "https://room.rakuten.co.jp/room_d527155c00/items",
  siteUrl: "", // 公開後のサイトURL
  contactEmail: "", // 公開用の問い合わせメールアドレス
  contactUrl: "https://github.com/motoki-okinawa/okinawa-select/issues",
  analyticsId: "", // GitHub ActionsのGA_MEASUREMENT_ID変数から公開時に設定
  amazonAssociateTag: "a0a5f9-22", // AmazonアソシエイトのトラッキングID
  rakuten: null // 公開ビルド時に許可ドメイン用の設定を注入
};
