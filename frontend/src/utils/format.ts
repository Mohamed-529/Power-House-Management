export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('en-IN').format(n);

export const isLicenseExpired = (expiry: string) =>
  new Date(expiry) < new Date();

export const generateId = () => Math.random().toString(36).slice(2, 10).toUpperCase();
