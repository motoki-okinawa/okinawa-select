const affiliateHosts = new Set(['hb.afl.rakuten.co.jp']);

export function inspectAffiliateLink(item) {
  const issues = [];
  let url;
  try {
    url = new URL(String(item.affiliateUrl || ''));
  } catch {
    return { structurallyValid: false, issues: ['invalid_url'], host: '', targetHost: '' };
  }

  if (url.protocol !== 'https:') issues.push('not_https');
  if (!affiliateHosts.has(url.hostname)) issues.push('unexpected_affiliate_host');

  const targetValue = url.searchParams.get('pc') || url.searchParams.get('m') || '';
  let targetHost = '';
  try {
    const target = new URL(targetValue);
    targetHost = target.hostname;
    if (!targetHost.endsWith('.rakuten.co.jp') && targetHost !== 'item.rakuten.co.jp') {
      issues.push('unexpected_target_host');
    }
  } catch {
    issues.push('missing_product_target');
  }

  if (!url.searchParams.get('rafcid')) issues.push('missing_tracking_parameter');
  return { structurallyValid: issues.length === 0, issues, host: url.hostname, targetHost };
}

export function buildAffiliateLinkReport(items, checkedAt = new Date().toISOString()) {
  const rows = items.map(item => ({
    themeId: item.themeId,
    themeName: item.themeName,
    itemCode: item.itemCode,
    itemName: item.itemName,
    affiliateUrl: item.affiliateUrl,
    ...inspectAffiliateLink(item)
  }));
  return {
    checkedAt,
    source: 'Rakuten Web Service affiliateUrl',
    total: rows.length,
    validationMode: 'structure_only_no_navigation',
    note: '楽天APIのaffiliateUrlを検査。人工的なクリックを避けるためリンク先へアクセスしない。',
    valid: rows.filter(row => row.structurallyValid).length,
    invalid: rows.filter(row => !row.structurallyValid).length,
    rows
  };
}
