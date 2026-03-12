import type { DecimalString } from '../api';
import type { MasterDataStatus } from '../domain';
import type { CanonicalEntity } from './common';

export interface ItemRecord extends CanonicalEntity {
  readonly status: MasterDataStatus;
  readonly itemCode: string;
  readonly itemName: string;
  readonly specModel?: string | null;
  readonly itemType?: string | null;
  readonly categoryId?: string | null;
  readonly uomCode: string;
  readonly taxCodeId?: string | null;
  readonly taxRate?: DecimalString | null;
  readonly barcode?: string | null;
  readonly batchManaged: boolean;
  readonly serialManaged: boolean;
  readonly shelfLifeDays?: number | null;
  readonly minStockQty?: DecimalString | null;
  readonly maxStockQty?: DecimalString | null;
  readonly leadTimeDays?: number | null;
}

export interface CustomerRecord extends CanonicalEntity {
  readonly status: MasterDataStatus;
  readonly customerCode: string;
  readonly customerName: string;
  readonly taxpayerIdOrUscc?: string | null;
  readonly invoiceTitle?: string | null;
  readonly billingAddress?: string | null;
  readonly billingPhone?: string | null;
  readonly bankName?: string | null;
  readonly bankAccount?: string | null;
  readonly contactName?: string | null;
  readonly contactMobile?: string | null;
  readonly email?: string | null;
  readonly creditLimit?: DecimalString | null;
  readonly paymentTerm?: string | null;
  readonly defaultTaxCodeId?: string | null;
}

export interface SupplierRecord extends CanonicalEntity {
  readonly status: MasterDataStatus;
  readonly supplierCode: string;
  readonly supplierName: string;
  readonly taxpayerIdOrUscc?: string | null;
  readonly payeeBank?: string | null;
  readonly payeeAccount?: string | null;
  readonly contactName?: string | null;
  readonly contactMobile?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
  readonly paymentTerm?: string | null;
  readonly defaultTaxCodeId?: string | null;
}

export interface WarehouseRecord extends CanonicalEntity {
  readonly status: MasterDataStatus;
  readonly warehouseCode: string;
  readonly warehouseName: string;
  readonly warehouseType?: string | null;
  readonly address?: string | null;
  readonly contactName?: string | null;
  readonly contactMobile?: string | null;
  readonly manageBin: boolean;
}

export interface WarehouseBinRecord extends CanonicalEntity {
  readonly status: MasterDataStatus;
  readonly warehouseId: string;
  readonly binCode: string;
  readonly binName: string;
  readonly zoneCode?: string | null;
  readonly binType?: string | null;
}

export interface UomRecord extends CanonicalEntity {
  readonly status: MasterDataStatus;
  readonly uomCode: string;
  readonly uomName: string;
  readonly precision?: number | null;
}

export interface TaxCodeRecord extends CanonicalEntity {
  readonly status: MasterDataStatus;
  readonly taxCode: string;
  readonly taxName: string;
  readonly taxType: string;
  readonly rate: DecimalString;
  readonly inclusive: boolean;
  readonly jurisdiction?: string | null;
}
