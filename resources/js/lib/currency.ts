/**
 * Currency utility functions for RT Express
 * Default currency is Tanzanian Shilling (TZS)
 */

export const DEFAULT_CURRENCY = 'TZS';
export const DEFAULT_LOCALE = 'sw-TZ'; // Swahili (Tanzania)

export interface CurrencyConfig {
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
    locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
    TZS: {
        code: 'TZS',
        name: 'Tanzanian Shilling',
        symbol: 'TSh',
        decimal_places: 0,
        locale: 'sw-TZ'
    },
    USD: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimal_places: 2,
        locale: 'en-US'
    },
    EUR: {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimal_places: 2,
        locale: 'en-EU'
    },
    GBP: {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        decimal_places: 2,
        locale: 'en-GB'
    }
};

/**
 * Format currency amount with proper localization
 */
export function formatCurrency(
    amount: number | string | null | undefined, 
    currency: string = DEFAULT_CURRENCY
): string {
    // Handle null/undefined/empty values
    if (amount === null || amount === undefined || amount === '') {
        return formatCurrency(0, currency);
    }

    // Convert to number if string
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Handle invalid numbers
    if (isNaN(numericAmount)) {
        return formatCurrency(0, currency);
    }

    const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];

    try {
        return new Intl.NumberFormat(currencyConfig.locale, {
            style: 'currency',
            currency: currencyConfig.code,
            minimumFractionDigits: currencyConfig.decimal_places,
            maximumFractionDigits: currencyConfig.decimal_places,
        }).format(numericAmount);
    } catch (error) {
        // Fallback to manual formatting if Intl fails
        const symbol = currencyConfig.symbol;
        const decimals = currencyConfig.decimal_places;
        const formattedAmount = numericAmount.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
        return `${symbol} ${formattedAmount}`;
    }
}

/**
 * Format currency amount without symbol (for input fields)
 */
export function formatCurrencyValue(
    amount: number | string | null | undefined,
    currency: string = DEFAULT_CURRENCY
): string {
    if (amount === null || amount === undefined || amount === '') {
        return '0';
    }

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
        return '0';
    }

    const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
    
    return numericAmount.toFixed(currencyConfig.decimal_places);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string, currency: string = DEFAULT_CURRENCY): number {
    if (!value) return 0;
    
    // Remove currency symbols and spaces
    const cleanValue = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
    const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
    return currencyConfig.symbol;
}

/**
 * Get currency decimal places
 */
export function getCurrencyDecimals(currency: string = DEFAULT_CURRENCY): number {
    const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
    return currencyConfig.decimal_places;
}

/**
 * Convert amount between currencies (placeholder for future exchange rate integration)
 */
export function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string = DEFAULT_CURRENCY
): number {
    // For now, return the same amount
    // In the future, this would integrate with exchange rate APIs
    if (fromCurrency === toCurrency) {
        return amount;
    }
    
    // Placeholder conversion rates (should be fetched from API)
    const exchangeRates: Record<string, Record<string, number>> = {
        USD: { TZS: 2300, EUR: 0.85, GBP: 0.73 },
        TZS: { USD: 0.00043, EUR: 0.00037, GBP: 0.00032 },
        EUR: { USD: 1.18, TZS: 2700, GBP: 0.86 },
        GBP: { USD: 1.37, TZS: 3150, EUR: 1.16 }
    };
    
    const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
    return amount * rate;
}
