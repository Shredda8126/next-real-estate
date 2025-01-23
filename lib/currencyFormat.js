// Currency formatting utility for South African Rand
export const formatCurrency = (amount) => {
  // Ensure amount is a number
  const numAmount = Number(amount);
  
  // Check if it's a valid number
  if (isNaN(numAmount)) return 'R 0.00';

  // Format to South African Rand with comma as thousand separator
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

// Utility to parse currency string back to number
export const parseCurrency = (currencyString) => {
  // Remove R, spaces, and commas
  const cleanedString = currencyString.replace(/[R\s,]/g, '');
  return parseFloat(cleanedString);
};
