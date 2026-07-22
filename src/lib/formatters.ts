export const formatCompactPrice = (priceStr?: string | number, currency = 'UGX'): string => {
  if (!priceStr || priceStr === '0' || priceStr === '00' || String(priceStr).toLowerCase() === 'free') {
    return 'Free';
  }

  // Extract pure number from string e.g. "50,000 UGX" -> 50000
  const num = typeof priceStr === 'number' ? priceStr : parseInt(String(priceStr).replace(/\D/g, ''), 10);
  
  if (isNaN(num) || num === 0) {
    return 'Free';
  }

  let formatted = '';
  if (num >= 1_000_000_000) {
    const val = (num / 1_000_000_000);
    formatted = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'B';
  } else if (num >= 1_000_000) {
    const val = (num / 1_000_000);
    formatted = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'M';
  } else if (num >= 1_000) {
    const val = (num / 1_000);
    formatted = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'K';
  } else {
    formatted = num.toString();
  }

  const curr = currency || 'UGX';
  return `${formatted} ${curr}`;
};
