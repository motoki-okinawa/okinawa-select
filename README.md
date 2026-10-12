# OKINAWA SELECT

沖縄旅行の持ち物・便利グッズ・お土産を探せる楽天アフィリエイトサイト。

## 商品更新

商品候補は楽天市場商品検索APIから取得し、レビュー、需要、送料、価格帯などを比較して選定します。

```powershell
$env:RAKUTEN_APPLICATION_ID='...'
$env:RAKUTEN_ACCESS_KEY='...'
$env:RAKUTEN_AFFILIATE_ID='...'
npm run update:products
npm run build:room-queue
npm test
```

自動化方針は `docs/automation-policy.md`、現在のROOM投稿監査は `docs/current-room-audit.md`、公式ルールの調査結果は `docs/rakuten-room-official-research.md` を参照してください。ROOM投稿は規約上、最終操作を本人が行います。
