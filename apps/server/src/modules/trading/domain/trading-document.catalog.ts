import {
  DOCUMENT_STATUS_CODES,
  LEGACY_TO_CANONICAL_DOCUMENT_TYPE,
  type CanonicalDocumentType,
  type DocumentStatusCode,
} from '@minierp/shared';

export const TRADING_MODULES = [
  'purchase',
  'inbound',
  'sales',
  'outbound',
  'stocktake',
] as const;

export const TRADING_LEGACY_DOCUMENT_TYPES = [
  'PO',
  'GRN',
  'SO',
  'OUT',
  'ADJ',
] as const;

export const TRADING_CANONICAL_DOCUMENT_TYPES = [
  'purchase_order',
  'goods_receipt',
  'sales_order',
  'shipment',
  'stocktake',
] as const;

export type TradingSubModule = (typeof TRADING_MODULES)[number];
export type TradingLegacyDocumentType =
  (typeof TRADING_LEGACY_DOCUMENT_TYPES)[number];
export type TradingCanonicalDocumentType =
  (typeof TRADING_CANONICAL_DOCUMENT_TYPES)[number];

type TradingDocumentBoundaryConfig = {
  readonly module: TradingSubModule;
  readonly entityType: TradingLegacyDocumentType;
  readonly initialStatus: DocumentStatusCode;
  readonly statuses: readonly DocumentStatusCode[];
  readonly commands: readonly string[];
  readonly queries: readonly string[];
};

export const TRADING_STATUS_CODES = DOCUMENT_STATUS_CODES;

export const TRADING_BOUNDARY_STATUSES = {
  purchase: ['draft', 'confirmed', 'closed', 'cancelled'],
  inbound: ['draft', 'validating', 'posted', 'cancelled'],
  sales: ['draft', 'confirmed', 'closed', 'cancelled'],
  outbound: ['draft', 'picking', 'posted', 'cancelled'],
  stocktake: ['draft', 'validating', 'posted', 'cancelled'],
} as const satisfies Record<TradingSubModule, readonly DocumentStatusCode[]>;

export type TradingBoundaryStatus<M extends TradingSubModule> =
  (typeof TRADING_BOUNDARY_STATUSES)[M][number];

export type PurchaseOrderLifecycleStatus = TradingBoundaryStatus<'purchase'>;
export type GoodsReceiptLifecycleStatus = TradingBoundaryStatus<'inbound'>;
export type SalesOrderLifecycleStatus = TradingBoundaryStatus<'sales'>;
export type ShipmentLifecycleStatus = TradingBoundaryStatus<'outbound'>;
export type StocktakeLifecycleStatus = TradingBoundaryStatus<'stocktake'>;

export const TRADING_LEGACY_TO_CANONICAL: Record<
  TradingLegacyDocumentType,
  TradingCanonicalDocumentType
> = {
  ADJ: 'stocktake',
  GRN: 'goods_receipt',
  OUT: 'shipment',
  PO: 'purchase_order',
  SO: 'sales_order',
} satisfies Record<TradingLegacyDocumentType, CanonicalDocumentType>;

export const TRADING_MODULE_BOUNDARIES: Readonly<
  Record<TradingSubModule, TradingDocumentBoundaryConfig>
> = {
  purchase: {
    module: 'purchase',
    entityType: 'PO',
    initialStatus: 'draft',
    statuses: TRADING_BOUNDARY_STATUSES.purchase,
    commands: [
      'createPurchaseOrder',
      'confirmPurchaseOrder',
      'closePurchaseOrder',
      'cancelPurchaseOrder',
    ],
    queries: ['getPurchaseOrder', 'listPurchaseOrders'],
  },
  inbound: {
    module: 'inbound',
    entityType: 'GRN',
    initialStatus: 'draft',
    statuses: TRADING_BOUNDARY_STATUSES.inbound,
    commands: [
      'createGoodsReceipt',
      'startGoodsReceiptValidation',
      'postGoodsReceipt',
      'cancelGoodsReceipt',
    ],
    queries: ['getGoodsReceipt', 'listGoodsReceipts'],
  },
  sales: {
    module: 'sales',
    entityType: 'SO',
    initialStatus: 'draft',
    statuses: TRADING_BOUNDARY_STATUSES.sales,
    commands: [
      'createSalesOrder',
      'confirmSalesOrder',
      'closeSalesOrder',
      'cancelSalesOrder',
    ],
    queries: ['getSalesOrder', 'listSalesOrders'],
  },
  outbound: {
    module: 'outbound',
    entityType: 'OUT',
    initialStatus: 'draft',
    statuses: TRADING_BOUNDARY_STATUSES.outbound,
    commands: [
      'createOutboundOrder',
      'startOutboundPicking',
      'postOutboundOrder',
      'cancelOutboundOrder',
    ],
    queries: ['getOutboundOrder', 'listOutboundOrders'],
  },
  stocktake: {
    module: 'stocktake',
    entityType: 'ADJ',
    initialStatus: 'draft',
    statuses: TRADING_BOUNDARY_STATUSES.stocktake,
    commands: [
      'createStocktakeAdjustment',
      'startStocktakeValidation',
      'postStocktakeAdjustment',
      'cancelStocktakeAdjustment',
    ],
    queries: ['getStocktakeAdjustment', 'listStocktakeAdjustments'],
  },
};

export function getCanonicalTradingDocumentType(
  legacyType: TradingLegacyDocumentType,
): TradingCanonicalDocumentType {
  return TRADING_LEGACY_TO_CANONICAL[legacyType];
}

export function getTradingModuleBoundary(
  module: TradingSubModule,
): TradingDocumentBoundaryConfig {
  return TRADING_MODULE_BOUNDARIES[module];
}

export function isTradingBoundaryStatus<M extends TradingSubModule>(
  module: M,
  status: DocumentStatusCode,
): status is TradingBoundaryStatus<M> {
  return (TRADING_BOUNDARY_STATUSES[module] as readonly string[]).includes(
    status,
  );
}

export function isTradingLegacyDocumentType(
  value: string,
): value is TradingLegacyDocumentType {
  return TRADING_LEGACY_DOCUMENT_TYPES.includes(
    value as TradingLegacyDocumentType,
  );
}

export function toCanonicalDocumentTypeFromSharedAlias(
  legacyType: TradingLegacyDocumentType,
): TradingCanonicalDocumentType {
  return LEGACY_TO_CANONICAL_DOCUMENT_TYPE[
    legacyType
  ] as TradingCanonicalDocumentType;
}
