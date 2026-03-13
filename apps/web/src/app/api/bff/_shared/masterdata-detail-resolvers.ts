import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
} from '@/lib/bff/server-fixtures';
import {
  customerListFixtures,
  skuListFixtures,
  supplierListFixtures,
} from '@/lib/mocks/erp-list-fixtures';

type LookupResource = 'customers' | 'suppliers' | 'items';

interface LookupEntitySummary {
  readonly id?: string;
  readonly tenantId?: string;
  readonly code?: string | null;
  readonly name?: string | null;
}

interface LookupLineWithLabel {
  readonly itemId: string;
  readonly itemLabel?: string;
}

export interface CanonicalItemDetailEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly name: string;
  readonly specification: string | null;
  readonly baseUnit: string;
  readonly categoryId: string | null;
  readonly itemType: string | null;
  readonly taxRate: string | null;
  readonly barcode: string | null;
  readonly batchManaged: boolean;
  readonly serialManaged: boolean;
  readonly shelfLifeDays: number | null;
  readonly minStockQty: string | null;
  readonly maxStockQty: string | null;
  readonly leadTimeDays: number | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type DetailFetchResult<T> =
  | { readonly kind: 'ok'; readonly data: T; readonly fallbackHit?: boolean }
  | { readonly kind: 'not_found' }
  | { readonly kind: 'unavailable'; readonly status?: number };

function isLookupEntitySummary(
  value: unknown,
): value is LookupEntitySummary {
  return typeof value === 'object' && value !== null;
}

function isCanonicalItemDetailEntity(
  value: unknown,
): value is CanonicalItemDetailEntity {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { code?: unknown }).code === 'string' &&
    typeof (value as { name?: unknown }).name === 'string'
  );
}

function formatLookupLabel(entity: LookupEntitySummary): string | null {
  const code = entity.code?.trim();
  const name = entity.name?.trim();

  if (code && name) {
    return `${code} · ${name}`;
  }

  return name || code || null;
}

function getLookupEntityFixture(
  resource: LookupResource,
  id: string,
): LookupEntitySummary | null {
  switch (resource) {
    case 'customers':
      return customerListFixtures.find((entity) => entity.id === id) ?? null;
    case 'suppliers':
      return supplierListFixtures.find((entity) => entity.id === id) ?? null;
    case 'items':
      return skuListFixtures.find((entity) => entity.id === id) ?? null;
  }
}

function toItemDetailFixture(id: string): CanonicalItemDetailEntity | null {
  const fixture = skuListFixtures.find((entity) => entity.id === id);
  if (!fixture) {
    return null;
  }

  return {
    id: fixture.id,
    tenantId: fixture.tenantId,
    code: fixture.code,
    name: fixture.name,
    specification: fixture.specification ?? null,
    baseUnit: fixture.unit,
    categoryId: fixture.categoryId ?? null,
    itemType: fixture.itemType ?? null,
    taxRate: fixture.taxRate ?? null,
    barcode: fixture.barcode ?? null,
    batchManaged: fixture.batchManaged,
    serialManaged: fixture.serialManaged,
    shelfLifeDays: fixture.shelfLifeDays ?? null,
    minStockQty: fixture.minStockQty ?? null,
    maxStockQty: fixture.maxStockQty ?? null,
    leadTimeDays: fixture.leadTimeDays ?? null,
    isActive: fixture.status !== 'disabled',
    createdAt: fixture.createdAt,
    updatedAt: fixture.updatedAt,
  };
}

export async function fetchMasterdataEntityResult(
  resource: LookupResource,
  id: string,
): Promise<DetailFetchResult<LookupEntitySummary>> {
  try {
    const response = await fetch(buildBackendUrl(`/${resource}/${id}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      const payload = (await response.json()) as
        | LookupEntitySummary
        | { data?: LookupEntitySummary };
      const entity =
        payload && typeof payload === 'object' && 'data' in payload
          ? payload.data
          : payload;

      if (!isLookupEntitySummary(entity)) {
        return { kind: 'not_found' };
      }

      return { kind: 'ok', data: entity };
    }

    if (response.status === 404) {
      return { kind: 'not_found' };
    }

    if (!isFixtureFallbackEnabled()) {
      return { kind: 'unavailable', status: response.status };
    }
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return { kind: 'unavailable' };
    }
  }

  const fixture = getLookupEntityFixture(resource, id);
  return fixture
    ? { kind: 'ok', data: fixture, fallbackHit: true }
    : { kind: 'not_found' };
}

export async function fetchItemDetailResult(
  id: string,
): Promise<DetailFetchResult<CanonicalItemDetailEntity>> {
  try {
    const response = await fetch(buildBackendUrl(`/items/${id}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      const payload = (await response.json()) as
        | CanonicalItemDetailEntity
        | { data?: CanonicalItemDetailEntity };
      const entity =
        payload && typeof payload === 'object' && 'data' in payload
          ? payload.data
          : payload;

      if (!isCanonicalItemDetailEntity(entity)) {
        return { kind: 'not_found' };
      }

      return { kind: 'ok', data: entity };
    }

    if (response.status === 404) {
      return { kind: 'not_found' };
    }

    if (!isFixtureFallbackEnabled()) {
      return { kind: 'unavailable', status: response.status };
    }
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return { kind: 'unavailable' };
    }
  }

  const fixture = toItemDetailFixture(id);
  return fixture
    ? { kind: 'ok', data: fixture, fallbackHit: true }
    : { kind: 'not_found' };
}

export async function fetchMasterdataEntity(
  resource: LookupResource,
  id: string,
): Promise<LookupEntitySummary | null> {
  const result = await fetchMasterdataEntityResult(resource, id);
  return result.kind === 'ok' ? result.data : null;
}

export function formatMasterdataLookupLabel(
  entity: LookupEntitySummary,
): string | null {
  return formatLookupLabel(entity);
}

export async function resolveCustomerLookupLabel(
  customerId: string,
): Promise<string | null> {
  const entity = await fetchMasterdataEntity('customers', customerId);
  return entity ? formatLookupLabel(entity) : null;
}

export async function resolveSupplierLookupLabel(
  supplierId: string,
): Promise<string | null> {
  const entity = await fetchMasterdataEntity('suppliers', supplierId);
  return entity ? formatLookupLabel(entity) : null;
}

export async function resolveItemLookupLabel(
  itemId: string,
): Promise<string | null> {
  const entity = await fetchMasterdataEntity('items', itemId);
  return entity ? formatLookupLabel(entity) : null;
}

function needsItemLabelResolution(itemId: string, itemLabel?: string): boolean {
  const normalizedLabel = itemLabel?.trim();

  if (!normalizedLabel) {
    return true;
  }

  return (
    normalizedLabel === itemId ||
    normalizedLabel === `物料 #${itemId}` ||
    /^物料 #\d+$/.test(normalizedLabel)
  );
}

export async function enrichLookupLinesWithItemLabels<
  TLine extends LookupLineWithLabel,
>(lines: readonly TLine[]): Promise<TLine[]> {
  return Promise.all(
    lines.map(async (line) => {
      if (!needsItemLabelResolution(line.itemId, line.itemLabel)) {
        return line;
      }

      const itemLabel = await resolveItemLookupLabel(line.itemId);
      return itemLabel ? { ...line, itemLabel } : line;
    }),
  );
}
