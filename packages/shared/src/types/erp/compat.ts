import type {
  CustomerRecord,
  ItemRecord,
  SupplierRecord,
  WarehouseRecord,
} from './master-data';
import type {
  CanonicalDocumentDetail,
  CanonicalDocumentHeader,
  CanonicalDocumentLine,
  CoreDocumentType,
  DocumentStatusCode,
  LegacyDocumentType,
} from './trading';
import type {
  InventoryBalanceRecord,
  InventoryLedgerRecord,
} from './inventory';

export type LegacySkuRecord = ItemRecord;
export type LegacyCustomerRecord = CustomerRecord;
export type LegacySupplierRecord = SupplierRecord;
export type LegacyWarehouseRecord = WarehouseRecord;

export type LegacyDocumentListItem = CanonicalDocumentHeader;
export type LegacyDocumentDetail = CanonicalDocumentDetail;
export type LegacyDocumentLine = CanonicalDocumentLine;

export type LegacyInventoryLedgerRecord = InventoryLedgerRecord;
export type LegacyInventoryBalanceRecord = InventoryBalanceRecord;

export type LegacyOrderStatus = DocumentStatusCode;
export type LegacyCoreDocumentType = CoreDocumentType;
export type LegacyRouteDocumentType = LegacyDocumentType;
