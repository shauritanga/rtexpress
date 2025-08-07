import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Re-export currency utilities for convenience
export {
    formatCurrency,
    formatCurrencyValue,
    parseCurrency,
    getCurrencySymbol,
    getCurrencyDecimals,
    convertCurrency,
    DEFAULT_CURRENCY,
    SUPPORTED_CURRENCIES
} from './currency';
