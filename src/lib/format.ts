export const formatBDT = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount / 100));
};

export const discountPercent = (originalPrice: number, salePrice: number): number => {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const calculateTotal = (items: Array<{ unitPrice: number; qty: number }>): number => {
  return items.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove non-digit characters
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880') && digits.length === 13) {
    return digits.slice(0, 4) + '-' + digits.slice(4, 8) + '-' + digits.slice(8);
  }
  return digits;
};