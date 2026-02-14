/**
 * Currency Conversion Utility
 *
 * Handles fetching exchange rates and converting amounts between currencies.
 */

const BASE_CURRENCY = "USD"; // Your reporting currency

/**
 * Fetch exchange rate from a currency to the base currency
 * @param {string} from - Source currency code (e.g., 'EUR')
 * @returns {Promise<number>} Exchange rate (1 unit of 'from' = X units of 'base')
 */
export async function getExchangeRate(from) {
    if (from === BASE_CURRENCY) return 1.0;

    try {
        // Using a free, no-key-required API for basic rates
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await response.json();

        return data.rates[BASE_CURRENCY] || 1.0;
    } catch (error) {
        console.error("Failed to fetch exchange rate:", error);

        // Fallback hardcoded rates
        const fallbacks = {
            EUR: 1.08,
            CAD: 0.72,
            TRY: 0.028,
            USD: 1.0,
        };

        return fallbacks[from] || 1.0;
    }
}

/**
 * Convert an amount from base currency to target currency
 * @param {number} amount - Amount in base currency (USD)
 * @param {string} to - Target currency code
 * @returns {Promise<{amount: number, rate: number}>} Converted amount and rate used
 */
export async function convertFromBaseCurrency(amount, to) {
    const rateToUSD = await getExchangeRate(to);
    const convertedAmount = amount / rateToUSD;

    return {
        amount: Number(convertedAmount.toFixed(2)),
        rate: rateToUSD,
    };
}

/**
 * Convert an amount to the base currency (for accounting)
 * @param {number} amount - Amount in source currency
 * @param {string} from - Source currency code
 * @returns {Promise<{amount: number, rate: number}>} Converted amount and rate used
 */
export async function convertToBaseCurrency(amount, from) {
    const rate = await getExchangeRate(from);
    return {
        amount: Number((amount * rate).toFixed(2)),
        rate: rate,
    };
}
