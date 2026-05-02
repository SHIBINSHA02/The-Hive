/**
 * lib/currency.ts
 * ----------------
 * Utilities for handling currency formatting and validation.
 * Prevents application crashes caused by invalid currency codes.
 */

export const SUPPORTED_CURRENCIES = [
  { code: "USD", label: "US Dollar ($)", symbol: "$" },
  { code: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { code: "EUR", label: "Euro (€)", symbol: "€" },
  { code: "GBP", label: "British Pound (£)", symbol: "£" },
  { code: "AED", label: "UAE Dirham (د.إ)", symbol: "د.إ" },
  { code: "CAD", label: "Canadian Dollar ($)", symbol: "C$" },
  { code: "AUD", label: "Australian Dollar ($)", symbol: "A$" },
  { code: "SGD", label: "Singapore Dollar ($)", symbol: "S$" },
];

/**
 * Safe wrapper for Intl.NumberFormat to prevent RangeError crashes.
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string = "USD", 
  maximumFractionDigits: number = 2
) {
  const code = currencyCode?.toUpperCase().trim() || "USD";
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits
    }).format(amount);
  } catch (error) {
    console.warn(`Invalid currency code detected: "${currencyCode}". Falling back to USD.`);
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits
      }).format(amount);
    } catch (fallbackError) {
      // absolute fallback if USD also fails (unlikely)
      return `$${amount.toFixed(maximumFractionDigits)}`;
    }
  }
}

/**
 * Returns the symbol for a given currency code.
 */
export function getCurrencySymbol(code: string = "USD") {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === code.toUpperCase());
  return currency?.symbol || "$";
}
