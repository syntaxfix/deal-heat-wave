
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { currencies, getCurrencyByCode, Currency } from '@/data/currencies';

const defaultCurrency = currencies[0]; // USD as default

const fetchCurrencySetting = async (): Promise<Currency> => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'site_currency')
      .maybeSingle();

    if (error) {
      console.error('Error fetching currency setting:', error);
      return defaultCurrency;
    }

    const currencyCode = data?.value || 'USD';
    const selectedCurrency = getCurrencyByCode(currencyCode) || defaultCurrency;
    return selectedCurrency;
}

export const useCurrencySetting = () => {
    return useQuery({
        queryKey: ['system_settings', 'currency'],
        queryFn: fetchCurrencySetting,
        staleTime: 1000 * 60 * 5, // 5 minutes
        // By setting a staleTime, we prevent unnecessary refetches on events like window focus,
        // which can sometimes cause cascading re-renders and race conditions.
        // Explicit invalidation from the settings page will still trigger an immediate refetch.
    });
}
