import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Re-export currency utilities for convenience
export {
    convertCurrency,
    DEFAULT_CURRENCY,
    formatCurrency,
    formatCurrencyValue,
    getCurrencyDecimals,
    getCurrencySymbol,
    parseCurrency,
    SUPPORTED_CURRENCIES,
} from './currency';
