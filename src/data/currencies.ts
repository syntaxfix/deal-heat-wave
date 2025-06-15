
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'Dollar', country: 'United States' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'Eurozone' },
  { code: 'GBP', symbol: '£', name: 'Pound', country: 'United Kingdom' },
  { code: 'JPY', symbol: '¥', name: 'Yen', country: 'Japan' },
  { code: 'CAD', symbol: '$', name: 'Dollar', country: 'Canada' },
  { code: 'AUD', symbol: '$', name: 'Dollar', country: 'Australia' },
  { code: 'INR', symbol: '₹', name: 'Rupee', country: 'India' },
];

export const getCurrencyByCode = (code: string | undefined | null): Currency | undefined => {
  if (!code) return undefined;
  return currencies.find(c => c.code === code);
}
