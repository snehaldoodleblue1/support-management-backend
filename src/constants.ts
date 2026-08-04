export const productType = {
  TELESALES: 'telesales',
  TECH_SUPPORT: 'tech_support',
  BILLING: 'billing',
} as const;

export type ProductType = typeof productType[keyof typeof productType];

export enum TicketStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export const ProductTypeTicketTypes: Record<ProductType, string[]> = {
  [productType.TELESALES]: ['Leads', 'Campaigns', 'Funnel', 'Scripts'],
  [productType.TECH_SUPPORT]: ['Infrastructure', 'Networking', 'Software'],
  [productType.BILLING]: ['Invoices', 'Payments', 'Subscriptions'],
};
