const clamp = value => Math.max(0, Math.min(1, value));

export function normalizeItem(theme, row) {
  const item = row?.Item || row || {};
  const imageCandidate = Array.isArray(item.mediumImageUrls) ? item.mediumImageUrls[0] : '';
  const imageUrl = typeof imageCandidate === 'string' ? imageCandidate : imageCandidate?.imageUrl || '';
  const reviewAverage = Number(item.reviewAverage) || 0;
  const reviewCount = Number(item.reviewCount) || 0;
  const itemPrice = Number(item.itemPrice) || 0;
  const postageFlag = Number(item.postageFlag) || 0;
  const pointRate = Number(item.pointRate) || 1;
  const affiliateRate = Number(item.affiliateRate) || 0;
  const affiliateUrl = String(item.affiliateUrl || '').trim();
  const itemUrl = String(item.itemUrl || '').trim();
  if (!item.itemCode || !item.itemName || itemPrice <= 0 || !affiliateUrl.startsWith('https://') || !itemUrl.startsWith('https://')) return null;
  return {
    id: theme.id,
    group: theme.group,
    themeName: theme.name,
    itemCode: String(item.itemCode),
    itemName: String(item.itemName).trim(),
    itemPrice,
    shopName: String(item.shopName || '').trim(),
    itemUrl,
    affiliateUrl,
    imageUrl: String(imageUrl || ''),
    reviewAverage,
    reviewCount,
    postageFlag,
    freeShipping: postageFlag === 0,
    pointRate,
    affiliateRate,
    priority: Number(theme.priority) || 1
  };
}

export function scoreItem(theme, item) {
  const quality = item.reviewAverage ? clamp((item.reviewAverage - 3.5) / 1.5) : 0.25;
  const demand = clamp(Math.log10(item.reviewCount + 1) / 4);
  const shipping = item.freeShipping ? 1 : 0;
  const middle = (theme.minPrice + theme.maxPrice) / 2;
  const halfRange = Math.max(1, (theme.maxPrice - theme.minPrice) / 2);
  const priceFit = clamp(1 - Math.abs(item.itemPrice - middle) / halfRange);
  const points = clamp((item.pointRate - 1) / 9);
  const priority = clamp((Number(theme.priority) || 1) / 5);
  const commission = clamp(item.affiliateRate / 10);
  const score = quality * 27 + demand * 27 + shipping * 14 + priceFit * 14 + points * 4 + commission * 9 + priority * 5;
  return Math.round(score * 10) / 10;
}

export function rankItems(theme, rows) {
  const unique = new Map();
  for (const row of rows) {
    const item = normalizeItem(theme, row);
    if (!item) continue;
    if (item.reviewAverage && item.reviewAverage < 3.8) continue;
    item.score = scoreItem(theme, item);
    const previous = unique.get(item.itemCode);
    if (!previous || previous.score < item.score) unique.set(item.itemCode, item);
  }
  return [...unique.values()].sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount || a.itemPrice - b.itemPrice);
}
