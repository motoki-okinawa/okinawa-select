const groupCopy = {
  '沖縄旅行の便利グッズ': name => `沖縄旅行の持ち物候補に「${name}」。荷物の量や旅程に合うか、サイズと仕様を商品ページで確認して選びたいアイテム。`,
  '沖縄のお取り寄せグルメ': name => `旅のあとも沖縄気分を楽しみたい日に「${name}」。内容量、賞味期限、配送条件を商品ページで確認して選びたいお取り寄せ候補。`,
  '旅行・撮影用品': name => `沖縄の海や景色をスマホで残したい人向けの「${name}」。対応機種、重さ、収納サイズを商品ページで確認して選びたい撮影アイテム。`
};

const groupTags = {
  '沖縄旅行の便利グッズ': ['#沖縄旅行', '#旅行グッズ', '#旅行準備'],
  '沖縄のお取り寄せグルメ': ['#沖縄グルメ', '#沖縄土産', '#お取り寄せ'],
  '旅行・撮影用品': ['#沖縄旅行', '#旅行グッズ', '#スマホ撮影']
};

export function createRoomDraft(item) {
  const factory = groupCopy[item.group] || (name => `${name}を比較中。最新の仕様と配送条件は商品ページで確認してください。`);
  const hashtags = groupTags[item.group] || ['#楽天ROOM'];
  return {
    copy: `${factory(item.themeName)} ${hashtags.join(' ')}`,
    hashtags
  };
}
