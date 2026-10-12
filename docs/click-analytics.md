# 商品別クリック計測

## 実装

- Google Analytics 4 の推奨イベント `select_item` を商品リンクのクリック時に送る。
- `item_id`、`item_name`、`item_category`、`price`、`index`、`affiliation` を付与する。
- クリック処理では `preventDefault` を使わず、楽天市場への通常遷移と楽天アフィリエイトURLを変更しない。
- 広告用ストレージは常に拒否し、解析用ストレージは訪問者が許可した場合だけ有効にする。

## 管理画面

GitHubリポジトリの Actions 変数 `GA_MEASUREMENT_ID` に `G-` で始まる測定IDを設定すると有効になる。Google Analyticsの「探索」で、ディメンションを「アイテム名」、指標を「アイテムリストのクリック数」にして降順表示すると、クリックされた人気商品を確認できる。

未設定時は計測コードを読み込まず、楽天リンクは通常どおり動作する。
