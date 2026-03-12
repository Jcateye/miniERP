import type { BigIntString, DecimalString } from '../api';

export type { BigIntString, DecimalString } from '../api';

export type CurrencyCode = string;
export type ExtensibleJson = Record<string, unknown> | null;

export interface CanonicalAuditFields {
  readonly tenantId: string;
  readonly companyId: string;
  readonly orgId?: string | null;
  readonly ext: ExtensibleJson;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly deletedAt?: string | null;
  readonly deletedBy?: string | null;
}

export interface CanonicalEntity extends CanonicalAuditFields {
  readonly id: string;
  readonly status: string;
}

export interface CanonicalLookupValue {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface CanonicalLookupReference {
  readonly id: string | null;
  readonly code: string | null;
  readonly name: string | null;
}

export interface CanonicalDocumentTotals {
  readonly totalQty: DecimalString;
  readonly totalAmount: DecimalString;
  readonly taxAmount?: DecimalString | null;
  readonly totalWithTax?: DecimalString | null;
}

export interface CanonicalLineAmount {
  readonly qty: DecimalString;
  readonly unitPrice?: DecimalString | null;
  readonly taxRate?: DecimalString | null;
  readonly amount?: DecimalString | null;
  readonly taxAmount?: DecimalString | null;
}

export interface CanonicalNumberingRecord {
  readonly id: string;
  readonly docNo: string;
}

export interface CanonicalIdReference {
  readonly id: string;
  readonly legacyId?: BigIntString | null;
}
