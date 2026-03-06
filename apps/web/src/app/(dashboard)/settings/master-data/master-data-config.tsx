import type {
  CreateCustomerCommand,
  CreateSupplierCommand,
  CreateWarehouseCommand,
  CustomerEntity,
  SupplierEntity,
  WarehouseEntity,
} from '@minierp/shared';

import { StatusBadge } from '@/components/ui';
import type { FilterConfig, TableColumn } from '@/components/ui';

export const MASTER_DATA_TABS = ['warehouses', 'suppliers', 'customers'] as const;
export type MasterDataTab = (typeof MASTER_DATA_TABS)[number];

export type MasterDataEntity = WarehouseEntity | SupplierEntity | CustomerEntity;

export type MasterDataFormValues = {
  code: string;
  name: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  isActive: string;
};

export type MasterDataFilters = {
  code: string;
  name: string;
  isActive: '' | 'true' | 'false';
};

export type MasterDataOperation = 'create' | 'edit';

export type MasterDataListResponse = {
  data: MasterDataEntity[];
  total: number;
};

export type TabConfig = {
  key: MasterDataTab;
  label: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  endpoint: string;
  createLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: TableColumn[];
  filters: FilterConfig[];
  buildCreatePayload: (values: MasterDataFormValues) =>
    | CreateWarehouseCommand
    | CreateSupplierCommand
    | CreateCustomerCommand;
  buildUpdatePayload: (values: MasterDataFormValues) => Record<string, unknown>;
  toFormValues: (entity: MasterDataEntity | null) => MasterDataFormValues;
  toRows: (items: MasterDataEntity[]) => Record<string, string>[];
};

export const sharedFilters: FilterConfig[] = [
  {
    key: 'isActive',
    label: '全部状态',
    options: [
      { label: '启用', value: 'true' },
      { label: '停用', value: 'false' },
    ],
  },
];

export function emptyFormValues(): MasterDataFormValues {
  return {
    code: '',
    name: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    email: '',
    isActive: 'true',
  };
}

function trimToNullable(value: string): string | null | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseTab(value: string | null): MasterDataTab {
  if (!value) {
    return 'warehouses';
  }

  return MASTER_DATA_TABS.includes(value as MasterDataTab)
    ? (value as MasterDataTab)
    : 'warehouses';
}

export function parseFilters(searchParams: URLSearchParams): MasterDataFilters {
  const isActive = searchParams.get('isActive');

  return {
    code: searchParams.get('code')?.trim() ?? '',
    name: searchParams.get('name')?.trim() ?? '',
    isActive: isActive === 'true' || isActive === 'false' ? isActive : '',
  };
}

export function buildQueryString(
  tab: MasterDataTab,
  filters: MasterDataFilters,
): string {
  const params = new URLSearchParams();
  params.set('tab', tab);

  if (filters.code.trim()) {
    params.set('code', filters.code.trim());
  }

  if (filters.name.trim()) {
    params.set('name', filters.name.trim());
  }

  if (filters.isActive) {
    params.set('isActive', filters.isActive);
  }

  return params.toString();
}

export function buildApiPath(
  endpoint: string,
  filters: MasterDataFilters,
): string {
  const params = new URLSearchParams();

  if (filters.code.trim()) {
    params.set('code', filters.code.trim());
  }

  if (filters.name.trim()) {
    params.set('name', filters.name.trim());
  }

  if (filters.isActive) {
    params.set('isActive', filters.isActive);
  }

  const query = params.toString();
  return query ? `${endpoint}?${query}` : endpoint;
}

function formatActiveStatus(isActive: boolean): string {
  return isActive ? '启用' : '停用';
}

function renderStatusBadge(value: string) {
  return <StatusBadge label={value} tone={value === '启用' ? 'success' : 'danger'} />;
}

const warehouseColumns: TableColumn[] = [
  { key: 'code', label: '编码', width: 140 },
  { key: 'name', label: '名称', width: 180 },
  { key: 'address', label: '地址', width: 240 },
  { key: 'contactPerson', label: '联系人', width: 120 },
  { key: 'contactPhone', label: '联系电话', width: 140 },
  { key: 'status', label: '状态', width: 80, render: renderStatusBadge },
];

const supplierColumns: TableColumn[] = [
  { key: 'code', label: '编码', width: 140 },
  { key: 'name', label: '名称', width: 180 },
  { key: 'contactPerson', label: '联系人', width: 120 },
  { key: 'contactPhone', label: '联系电话', width: 140 },
  { key: 'email', label: '邮箱', width: 220 },
  { key: 'status', label: '状态', width: 80, render: renderStatusBadge },
];

const customerColumns: TableColumn[] = [
  { key: 'code', label: '编码', width: 140 },
  { key: 'name', label: '名称', width: 180 },
  { key: 'contactPerson', label: '联系人', width: 120 },
  { key: 'contactPhone', label: '联系电话', width: 140 },
  { key: 'email', label: '邮箱', width: 220 },
  { key: 'status', label: '状态', width: 80, render: renderStatusBadge },
];

export const tabConfigs: Record<MasterDataTab, TabConfig> = {
  warehouses: {
    key: 'warehouses',
    label: '仓库',
    title: '仓库主数据',
    subtitle: '查看并维护真实仓库数据，支持筛选、创建、编辑与删除。',
    searchPlaceholder: '搜索仓库编码或名称...',
    endpoint: '/api/bff/warehouses',
    createLabel: '+ 新建仓库',
    emptyTitle: '暂无仓库数据',
    emptyDescription: '当前没有符合条件的仓库，可新建第一条仓库主数据。',
    columns: warehouseColumns,
    filters: sharedFilters,
    buildCreatePayload: (values) => ({
      code: values.code.trim(),
      name: values.name.trim(),
      address: trimToNullable(values.address),
      contactPerson: trimToNullable(values.contactPerson),
      contactPhone: trimToNullable(values.contactPhone),
    }),
    buildUpdatePayload: (values) => ({
      name: values.name.trim(),
      address: trimToNullable(values.address),
      contactPerson: trimToNullable(values.contactPerson),
      contactPhone: trimToNullable(values.contactPhone),
      isActive: values.isActive === 'true',
    }),
    toFormValues: (entity) => {
      if (!entity) {
        return emptyFormValues();
      }

      const warehouse = entity as WarehouseEntity;
      return {
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address ?? '',
        contactPerson: warehouse.contactPerson ?? '',
        contactPhone: warehouse.contactPhone ?? '',
        email: '',
        isActive: warehouse.isActive ? 'true' : 'false',
      };
    },
    toRows: (items) =>
      (items as WarehouseEntity[]).map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        address: item.address ?? '-',
        contactPerson: item.contactPerson ?? '-',
        contactPhone: item.contactPhone ?? '-',
        status: formatActiveStatus(item.isActive),
      })),
  },
  suppliers: {
    key: 'suppliers',
    label: '供应商',
    title: '供应商主数据',
    subtitle: '维护供应商基础信息，支持真实列表与直接操作。',
    searchPlaceholder: '搜索供应商编码或名称...',
    endpoint: '/api/bff/suppliers',
    createLabel: '+ 新建供应商',
    emptyTitle: '暂无供应商数据',
    emptyDescription: '当前没有符合条件的供应商，可新建第一条供应商主数据。',
    columns: supplierColumns,
    filters: sharedFilters,
    buildCreatePayload: (values) => ({
      code: values.code.trim(),
      name: values.name.trim(),
      contactPerson: trimToNullable(values.contactPerson),
      contactPhone: trimToNullable(values.contactPhone),
      email: trimToNullable(values.email),
      address: trimToNullable(values.address),
    }),
    buildUpdatePayload: (values) => ({
      name: values.name.trim(),
      contactPerson: trimToNullable(values.contactPerson),
      contactPhone: trimToNullable(values.contactPhone),
      email: trimToNullable(values.email),
      address: trimToNullable(values.address),
      isActive: values.isActive === 'true',
    }),
    toFormValues: (entity) => {
      if (!entity) {
        return emptyFormValues();
      }

      const supplier = entity as SupplierEntity;
      return {
        code: supplier.code,
        name: supplier.name,
        address: supplier.address ?? '',
        contactPerson: supplier.contactPerson ?? '',
        contactPhone: supplier.contactPhone ?? '',
        email: supplier.email ?? '',
        isActive: supplier.isActive ? 'true' : 'false',
      };
    },
    toRows: (items) =>
      (items as SupplierEntity[]).map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        contactPerson: item.contactPerson ?? '-',
        contactPhone: item.contactPhone ?? '-',
        email: item.email ?? '-',
        status: formatActiveStatus(item.isActive),
      })),
  },
  customers: {
    key: 'customers',
    label: '客户',
    title: '客户主数据',
    subtitle: '维护客户基础信息，直接打通真实 BFF CRUD。',
    searchPlaceholder: '搜索客户编码或名称...',
    endpoint: '/api/bff/customers',
    createLabel: '+ 新建客户',
    emptyTitle: '暂无客户数据',
    emptyDescription: '当前没有符合条件的客户，可新建第一条客户主数据。',
    columns: customerColumns,
    filters: sharedFilters,
    buildCreatePayload: (values) => ({
      code: values.code.trim(),
      name: values.name.trim(),
      contactPerson: trimToNullable(values.contactPerson),
      contactPhone: trimToNullable(values.contactPhone),
      email: trimToNullable(values.email),
      address: trimToNullable(values.address),
    }),
    buildUpdatePayload: (values) => ({
      name: values.name.trim(),
      contactPerson: trimToNullable(values.contactPerson),
      contactPhone: trimToNullable(values.contactPhone),
      email: trimToNullable(values.email),
      address: trimToNullable(values.address),
      isActive: values.isActive === 'true',
    }),
    toFormValues: (entity) => {
      if (!entity) {
        return emptyFormValues();
      }

      const customer = entity as CustomerEntity;
      return {
        code: customer.code,
        name: customer.name,
        address: customer.address ?? '',
        contactPerson: customer.contactPerson ?? '',
        contactPhone: customer.contactPhone ?? '',
        email: customer.email ?? '',
        isActive: customer.isActive ? 'true' : 'false',
      };
    },
    toRows: (items) =>
      (items as CustomerEntity[]).map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        contactPerson: item.contactPerson ?? '-',
        contactPhone: item.contactPhone ?? '-',
        email: item.email ?? '-',
        status: formatActiveStatus(item.isActive),
      })),
  },
};
