import type { T__2 } from '../backend';

export function getCurrentMonthInvoiceCount(invoices: T__2[]): number {
  const now = Date.now();
  const currentMonth = Math.floor(now / 2_592_000_000);

  return invoices.filter((invoice) => {
    const invoiceMonth = Math.floor(Number(invoice.createdDate) / 1_000_000 / 2_592_000_000);
    return invoiceMonth === currentMonth;
  }).length;
}

export function isFreeTierLimitReached(invoices: T__2[], isPremium: boolean): boolean {
  if (isPremium) return false;
  return getCurrentMonthInvoiceCount(invoices) >= 3;
}

export function isInvoiceLimitReached(invoices: T__2[], isPremium: boolean): boolean {
  return isFreeTierLimitReached(invoices, isPremium);
}
