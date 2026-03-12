import type { DecimalString } from '../api';
import type { CanonicalEntity } from './common';

export interface InvoiceRecord extends CanonicalEntity {
  readonly invoiceNo: string;
  readonly invoiceType: 'AR' | 'AP';
  readonly issueDate: string;
  readonly fiscalPeriodId?: string | null;
  readonly buyerPartyId?: string | null;
  readonly sellerPartyId?: string | null;
  readonly currency?: string | null;
  readonly exchangeRate?: DecimalString | null;
  readonly amount: DecimalString;
  readonly taxAmount: DecimalString;
  readonly totalWithTax: DecimalString;
  readonly eInvoiceNo?: string | null;
  readonly invoiceCode?: string | null;
  readonly sourceRefType?: string | null;
  readonly sourceRefId?: string | null;
  readonly remarks?: string | null;
}

export interface ReceiptRecord extends CanonicalEntity {
  readonly receiptNo: string;
  readonly customerId: string;
  readonly receiptDate: string;
  readonly currency?: string | null;
  readonly amount: DecimalString;
  readonly method: string;
  readonly bankAccountId?: string | null;
  readonly matchedAmount?: DecimalString | null;
  readonly remarks?: string | null;
}

export interface PaymentRecord extends CanonicalEntity {
  readonly paymentNo: string;
  readonly supplierId: string;
  readonly paymentDate: string;
  readonly currency?: string | null;
  readonly amount: DecimalString;
  readonly method: string;
  readonly bankAccountId?: string | null;
  readonly matchedAmount?: DecimalString | null;
  readonly remarks?: string | null;
}

export interface JournalEntryRecord extends CanonicalEntity {
  readonly journalEntryNo: string;
  readonly postingDate: string;
  readonly fiscalPeriodId: string;
  readonly source: 'manual' | 'auto';
  readonly sourceRefType?: string | null;
  readonly sourceRefId?: string | null;
  readonly totalDebit: DecimalString;
  readonly totalCredit: DecimalString;
  readonly remarks?: string | null;
}

export interface CostCenterRecord extends CanonicalEntity {
  readonly costCenterCode: string;
  readonly costCenterName: string;
  readonly managerUserId?: string | null;
}

export interface ProjectRecord extends CanonicalEntity {
  readonly projectCode: string;
  readonly projectName: string;
  readonly ownerUserId?: string | null;
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly budgetId?: string | null;
}
