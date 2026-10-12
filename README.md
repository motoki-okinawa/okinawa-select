# OKINAWA SELECT

沖縄旅行の持ち物・便利グッズ・お土産を探せる楽天アフィリエイトサイト。

## 商品更新

商品候補は楽天市場商品検索APIから取得し、レビュー、需要、送料、価格帯などを比較して選定します。

```powershell
$env:RAKUTEN_APPLICATION_ID='...'
$env:RAKUTEN_ACCESS_KEY='...'
$env:RAKUTEN_AFFILIATE_ID='...'
npm run update:products
npm run validate:affiliate-links
npm run build:room-queue
npm run verify:daily-output
npm test
```

毎日の処理では `reports/affiliate-link-check.json` と、コピー操作付きの `reports/room-post-queue.html` をActions成果物として保存します。商品別クリック計測は `docs/click-analytics.md` を参照してください。

自動化方針は `docs/automation-policy.md`、現在のROOM投稿監査は `docs/current-room-audit.md`、公式ルールの調査結果は `docs/rakuten-room-official-research.md` を参照してください。ROOM投稿は規約上、最終操作を本人が行います。
