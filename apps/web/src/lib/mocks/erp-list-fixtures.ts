import type { Customer, Supplier, Sku } from '@minierp/shared';

export type SkuActivity = {
  color: string;
  label: string;
  time: string;
};

export type SkuViewMeta = {
  activities: readonly SkuActivity[];
  categoryLabel: string;
  stock: number;
  supplierName: string;
  supplierSku: string;
  threshold: number;
  warehouseLabel: string;
};

export type SupplierViewMeta = {
  cert: string;
  orders: number;
};

export const skuCategoryIdByLabel: Record<string, string> = {
  扩展坞: 'cat_dock',
  电源: 'cat_power',
  线材: 'cat_cable',
  转换器: 'cat_adapter',
  连接器: 'cat_connector',
};

export const skuCategoryLabelById = Object.fromEntries(
  Object.entries(skuCategoryIdByLabel).map(([label, id]) => [id, label]),
) as Record<string, string>;

export const skuListFixtures: readonly Sku[] = [
  {
    id: 'sku_001',
    tenantId: '1001',
    code: 'CAB-HDMI-2M',
    name: 'HDMI 高清视频线 2米',
    specification: 'HDMI 2.0 / 编织外被 / 镀金',
    unit: 'PCS',
    categoryId: 'cat_cable',
    itemType: 'finished_goods',
    taxRate: '13.00',
    barcode: '6901001000012',
    batchManaged: false,
    serialManaged: false,
    shelfLifeDays: null,
    minStockQty: '50',
    maxStockQty: '500',
    leadTimeDays: 7,
    status: 'normal',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'sku_002',
    tenantId: '1001',
    code: 'CON-RJ45-CAT6',
    name: 'RJ45 水晶头 CAT6',
    specification: '超六类 / 纯铜 / 50个一包',
    unit: 'BAG',
    categoryId: 'cat_connector',
    itemType: 'raw_material',
    taxRate: '13.00',
    barcode: '6901001000013',
    batchManaged: false,
    serialManaged: false,
    shelfLifeDays: null,
    minStockQty: '100',
    maxStockQty: '1000',
    leadTimeDays: 5,
    status: 'warning',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'sku_003',
    tenantId: '1001',
    code: 'ADP-USBC-VGA',
    name: 'USB-C 转 VGA 转换器',
    specification: '1080P / 铝合金 / 15cm',
    unit: 'PCS',
    categoryId: 'cat_adapter',
    itemType: 'finished_goods',
    taxRate: '13.00',
    barcode: '6901001000014',
    batchManaged: false,
    serialManaged: false,
    shelfLifeDays: null,
    minStockQty: '30',
    maxStockQty: '200',
    leadTimeDays: 9,
    status: 'normal',
    createdAt: '2026-03-02T08:00:00.000Z',
    updatedAt: '2026-03-09T08:00:00.000Z',
  },
  {
    id: 'sku_004',
    tenantId: '1001',
    code: 'PWR-65W-PD',
    name: '65W PD 快充电源适配器',
    specification: '氮化镓 / 2C1A / 白色中规',
    unit: 'PCS',
    categoryId: 'cat_power',
    itemType: 'finished_goods',
    taxRate: '13.00',
    barcode: '6901001000015',
    batchManaged: true,
    serialManaged: false,
    shelfLifeDays: 365,
    minStockQty: '20',
    maxStockQty: '120',
    leadTimeDays: 14,
    status: 'normal',
    createdAt: '2026-03-03T08:00:00.000Z',
    updatedAt: '2026-03-09T08:00:00.000Z',
  },
  {
    id: 'sku_005',
    tenantId: '1001',
    code: 'HUB-USB3-7P',
    name: 'USB 3.0 七口集线器',
    specification: '带独立开关 / 12V电源 / 铝壳',
    unit: 'PCS',
    categoryId: 'cat_dock',
    itemType: 'finished_goods',
    taxRate: '13.00',
    barcode: '6901001000016',
    batchManaged: false,
    serialManaged: false,
    shelfLifeDays: null,
    minStockQty: '10',
    maxStockQty: '80',
    leadTimeDays: 12,
    status: 'disabled',
    createdAt: '2026-03-03T08:00:00.000Z',
    updatedAt: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'sku_006',
    tenantId: '1001',
    code: 'CBL-DP-1M',
    name: 'DisplayPort 视频线 1米',
    specification: '8K / 镀金 / 黑色',
    unit: 'PCS',
    categoryId: 'cat_cable',
    itemType: 'finished_goods',
    taxRate: '13.00',
    barcode: '6901001000017',
    batchManaged: false,
    serialManaged: false,
    shelfLifeDays: null,
    minStockQty: '40',
    maxStockQty: '300',
    leadTimeDays: 6,
    status: 'normal',
    createdAt: '2026-03-04T08:00:00.000Z',
    updatedAt: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'sku_007',
    tenantId: '1001',
    code: 'BAT-AA-4P',
    name: 'AA 碱性电池 4 节装',
    specification: '1.5V / 长效版',
    unit: 'PACK',
    categoryId: 'cat_power',
    itemType: 'consumable',
    taxRate: '13.00',
    barcode: '6901001000018',
    batchManaged: true,
    serialManaged: false,
    shelfLifeDays: 720,
    minStockQty: '60',
    maxStockQty: '360',
    leadTimeDays: 18,
    status: 'warning',
    createdAt: '2026-03-05T08:00:00.000Z',
    updatedAt: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'sku_008',
    tenantId: '1001',
    code: 'DOCK-TB4-MINI',
    name: 'Thunderbolt 4 扩展坞',
    specification: '双 4K / 千兆网口 / 90W 回充',
    unit: 'PCS',
    categoryId: 'cat_dock',
    itemType: 'finished_goods',
    taxRate: '13.00',
    barcode: '6901001000019',
    batchManaged: false,
    serialManaged: true,
    shelfLifeDays: null,
    minStockQty: '8',
    maxStockQty: '60',
    leadTimeDays: 21,
    status: 'normal',
    createdAt: '2026-03-06T08:00:00.000Z',
    updatedAt: '2026-03-11T08:00:00.000Z',
  },
] as const;

export const skuViewMetaByCode: Record<string, SkuViewMeta> = {
  'ADP-USBC-VGA': {
    activities: [
      { color: 'bg-[#549363]', label: '入库 +20 (GRN-2026-0140)', time: '2026-02-27 16:30' },
      { color: 'bg-primary', label: '出库 -5 (OUT-2026-0089)', time: '2026-02-25 10:15' },
      { color: 'bg-[#548093]', label: '盘点 +2 (ST-2026-0012)', time: '2026-01-15 09:00' },
    ],
    categoryLabel: '转换器',
    stock: 80,
    supplierName: '鸿鹏电子',
    supplierSku: 'SZ-VGA-80A',
    threshold: 30,
    warehouseLabel: '深圳 A 仓',
  },
  'BAT-AA-4P': {
    activities: [{ color: 'bg-primary', label: '低库存预警', time: '2026-02-18 07:50' }],
    categoryLabel: '电源',
    stock: 25,
    supplierName: '宏发制造',
    supplierSku: 'HF-AA-4P',
    threshold: 60,
    warehouseLabel: '深圳 A 仓',
  },
  'CAB-HDMI-2M': {
    activities: [
      { color: 'bg-[#549363]', label: '入库 +20 (GRN-2026-0140)', time: '2026-02-27 16:30' },
      { color: 'bg-primary', label: '出库 -5 (OUT-2026-0089)', time: '2026-02-25 10:15' },
    ],
    categoryLabel: '线材',
    stock: 342,
    supplierName: '金源科技',
    supplierSku: 'JY-HDMI-2M',
    threshold: 50,
    warehouseLabel: '深圳 A 仓',
  },
  'CBL-DP-1M': {
    activities: [{ color: 'bg-[#549363]', label: '入库 +12 (GRN-2026-0091)', time: '2026-02-19 09:22' }],
    categoryLabel: '线材',
    stock: 46,
    supplierName: '金源科技',
    supplierSku: 'JY-DP-1M',
    threshold: 40,
    warehouseLabel: '青岛 B 仓',
  },
  'CON-RJ45-CAT6': {
    activities: [
      { color: 'bg-primary', label: '安全库存告警触发', time: '2026-03-01 09:00' },
      { color: 'bg-[#548093]', label: '调拨 +10 (TRF-2026-011)', time: '2026-02-28 11:20' },
    ],
    categoryLabel: '连接器',
    stock: 12,
    supplierName: '宏发制造',
    supplierSku: 'HF-RJ45-6',
    threshold: 100,
    warehouseLabel: '青岛 B 仓',
  },
  'DOCK-TB4-MINI': {
    activities: [{ color: 'bg-[#548093]', label: '调拨入库 +8', time: '2026-02-17 13:10' }],
    categoryLabel: '扩展坞',
    stock: 18,
    supplierName: '鸿鹏电子',
    supplierSku: 'HP-TB4-M',
    threshold: 15,
    warehouseLabel: '苏州 周转仓',
  },
  'HUB-USB3-7P': {
    activities: [{ color: 'bg-muted', label: '状态变更为下架', time: '2026-02-20 14:08' }],
    categoryLabel: '扩展坞',
    stock: 0,
    supplierName: '未知供应',
    supplierSku: 'N/A',
    threshold: 20,
    warehouseLabel: '苏州 周转仓',
  },
  'PWR-65W-PD': {
    activities: [{ color: 'bg-[#549363]', label: '补货完成 +120', time: '2026-02-22 18:10' }],
    categoryLabel: '电源',
    stock: 560,
    supplierName: '立讯精密',
    supplierSku: 'LX-PD-65W',
    threshold: 120,
    warehouseLabel: '深圳 A 仓',
  },
};

export const customerListFixtures: readonly Customer[] = [
  {
    id: 'cust_001',
    tenantId: '1001',
    code: 'C-001',
    name: '华为技术有限公司',
    contactName: '王经理',
    phone: '138-0000-0000',
    email: 'wang@example.com',
    address: '深圳市南山区科技园',
    creditLimit: '500000',
    status: 'normal',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'cust_002',
    tenantId: '1001',
    code: 'C-002',
    name: '极客智联网络',
    contactName: '李倩',
    phone: '138-0000-1002',
    email: 'li@example.com',
    address: '上海市浦东新区张江高科',
    creditLimit: '220000',
    status: 'normal',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'cust_003',
    tenantId: '1001',
    code: 'C-003',
    name: '蓝桥智能制造',
    contactName: '周岩',
    phone: '138-0000-1208',
    email: 'zhou@example.com',
    address: '苏州市工业园区',
    creditLimit: '180000',
    status: 'warning',
    createdAt: '2026-03-02T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'cust_004',
    tenantId: '1001',
    code: 'C-004',
    name: '星海数字设备',
    contactName: '赵琳',
    phone: '138-0000-2311',
    email: 'zhao@example.com',
    address: '青岛市崂山区',
    creditLimit: '320000',
    status: 'normal',
    createdAt: '2026-03-03T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'cust_005',
    tenantId: '1001',
    code: 'C-005',
    name: '深湾信息科技',
    contactName: '陈翔',
    phone: '138-0000-5568',
    email: 'chen@example.com',
    address: '深圳市福田区',
    creditLimit: '96000',
    status: 'normal',
    createdAt: '2026-03-04T08:00:00.000Z',
    updatedAt: '2026-03-09T08:00:00.000Z',
  },
  {
    id: 'cust_006',
    tenantId: '1001',
    code: 'C-006',
    name: '远航电子贸易',
    contactName: '韩梅',
    phone: '138-0000-7782',
    email: 'han@example.com',
    address: '杭州市滨江区',
    creditLimit: '86000',
    status: 'disabled',
    createdAt: '2026-03-05T08:00:00.000Z',
    updatedAt: '2026-03-09T08:00:00.000Z',
  },
] as const;

export const supplierListFixtures: readonly Supplier[] = [
  {
    id: 'sup_001',
    tenantId: '1001',
    code: 'V-001',
    name: '华为技术有限公司',
    contactName: '安经理',
    phone: '136-1000-0001',
    email: 'an@example.com',
    address: '深圳市龙岗区',
    status: 'normal',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'sup_002',
    tenantId: '1001',
    code: 'V-002',
    name: '南方连接器制造',
    contactName: '郭峰',
    phone: '136-1000-0002',
    email: 'guo@example.com',
    address: '东莞市厚街镇',
    status: 'normal',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'sup_003',
    tenantId: '1001',
    code: 'V-003',
    name: '蓝海包装科技',
    contactName: '夏颖',
    phone: '136-1000-0003',
    email: 'xia@example.com',
    address: '佛山市南海区',
    status: 'warning',
    createdAt: '2026-03-02T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'sup_004',
    tenantId: '1001',
    code: 'V-004',
    name: '捷科五金建材',
    contactName: '宋明',
    phone: '136-1000-0004',
    email: 'song@example.com',
    address: '广州市番禺区',
    status: 'normal',
    createdAt: '2026-03-03T08:00:00.000Z',
    updatedAt: '2026-03-08T08:00:00.000Z',
  },
  {
    id: 'sup_005',
    tenantId: '1001',
    code: 'V-005',
    name: '鸿鹏电子器件',
    contactName: '刘欣',
    phone: '136-1000-0005',
    email: 'liu@example.com',
    address: '苏州市高新区',
    status: 'normal',
    createdAt: '2026-03-04T08:00:00.000Z',
    updatedAt: '2026-03-09T08:00:00.000Z',
  },
  {
    id: 'sup_006',
    tenantId: '1001',
    code: 'V-006',
    name: '远望物流物料',
    contactName: '于淼',
    phone: '136-1000-0006',
    email: 'yu@example.com',
    address: '宁波市北仑区',
    status: 'disabled',
    createdAt: '2026-03-05T08:00:00.000Z',
    updatedAt: '2026-03-09T08:00:00.000Z',
  },
] as const;

export const supplierViewMetaByCode: Record<string, SupplierViewMeta> = {
  'V-001': { cert: 'ISO9001 / ISO14001', orders: 25 },
  'V-002': { cert: 'UL / RoHS', orders: 31 },
  'V-003': { cert: 'FSC / ISO9001', orders: 12 },
  'V-004': { cert: 'ISO45001', orders: 9 },
  'V-005': { cert: 'RoHS / REACH', orders: 44 },
  'V-006': { cert: '运输资质', orders: 4 },
};

export type InventoryBalanceListItem = {
  available: number;
  balance: number;
  name: string;
  reserved: number;
  safe: number;
  sku: string;
  warehouse: string;
};

export const inventoryBalanceListFixtures: readonly InventoryBalanceListItem[] = [
  { sku: 'RAW-488B-2M', name: 'ROHM 电源稳压管', warehouse: '深圳 A 仓', balance: 320, available: 280, reserved: 40, safe: 50 },
  { sku: 'ADR-LED50-V9A', name: 'LED 大灯灯珠模组', warehouse: '青岛 B 仓', balance: 10, available: 10, reserved: 0, safe: 50 },
  { sku: 'CAB-HDMI-2M', name: 'HDMI 高清视频线 2 米', warehouse: '深圳 A 仓', balance: 342, available: 300, reserved: 42, safe: 60 },
  { sku: 'CON-RJ45-CAT6', name: 'RJ45 水晶头 CAT6', warehouse: '苏州 周转仓', balance: 18, available: 12, reserved: 6, safe: 100 },
  { sku: 'ADP-USBC-VGA', name: 'USB-C 转 VGA 转换器', warehouse: '青岛 B 仓', balance: 80, available: 72, reserved: 8, safe: 30 },
  { sku: 'PWR-65W-PD', name: '65W PD 快充电源适配器', warehouse: '深圳 A 仓', balance: 560, available: 510, reserved: 50, safe: 120 },
] as const;

export type InventoryLedgerListItem = {
  balance: number;
  date: string;
  direction: string;
  operator: string;
  skuId: string;
  source: string;
  type: '入库' | '出库' | '调拨' | '盘点';
  warehouse: string;
};

export const inventoryLedgerListFixtures: readonly InventoryLedgerListItem[] = [
  { date: '2026-03-10 14:30', skuId: 'SKU-HDMI-2M', warehouse: '深圳总仓', type: '入库', direction: '+100', balance: 500, source: 'GRN-001', operator: '张三' },
  { date: '2026-03-09 10:20', skuId: 'SKU-HDMI-2M', warehouse: '深圳总仓', type: '出库', direction: '-20', balance: 400, source: 'OUT-021', operator: '李四' },
  { date: '2026-03-08 09:12', skuId: 'SKU-RJ45-CAT6', warehouse: '青岛 B 仓', type: '调拨', direction: '+60', balance: 160, source: 'TRF-008', operator: '王倩' },
  { date: '2026-03-07 17:06', skuId: 'SKU-USBC-VGA', warehouse: '苏州周转仓', type: '盘点', direction: '+2', balance: 82, source: 'ST-112', operator: '赵云' },
  { date: '2026-03-06 15:48', skuId: 'SKU-PD-65W', warehouse: '深圳总仓', type: '入库', direction: '+40', balance: 560, source: 'GRN-119', operator: '张三' },
  { date: '2026-03-05 13:30', skuId: 'SKU-RJ45-CAT6', warehouse: '青岛 B 仓', type: '出库', direction: '-15', balance: 100, source: 'OUT-019', operator: '韩梅' },
] as const;

export type SalesOrderListItem = {
  amount: number;
  customer: string;
  date: string;
  id: string;
  skuCount: number;
  so: string;
  status: '待发货' | '已发货' | '草稿';
};

export const salesOrderListFixtures: readonly SalesOrderListItem[] = [
  { id: 'SO-20260216-088', so: 'SO-20260216-088', customer: '海外极客电子', date: '2026-02-16', amount: 26500, skuCount: 62, status: '待发货' },
  { id: 'SO-20260215-021', so: 'SO-20260215-021', customer: '武汉星光网咖', date: '2026-02-15', amount: 7020, skuCount: 25, status: '已发货' },
  { id: 'SO-20260214-017', so: 'SO-20260214-017', customer: '南京云帆科技', date: '2026-02-14', amount: 19800, skuCount: 14, status: '草稿' },
  { id: 'SO-20260213-006', so: 'SO-20260213-006', customer: '深湾智能设备', date: '2026-02-13', amount: 12500, skuCount: 8, status: '待发货' },
  { id: 'SO-20260212-002', so: 'SO-20260212-002', customer: '青鸟数字贸易', date: '2026-02-12', amount: 45800, skuCount: 30, status: '已发货' },
  { id: 'SO-20260211-112', so: 'SO-20260211-112', customer: '东海数据网络', date: '2026-02-11', amount: 8900, skuCount: 6, status: '草稿' },
] as const;

export type PurchaseOrderListItem = {
  amount: number;
  date: string;
  id: string;
  po: string;
  skuCount: number;
  status: '待收货' | '已完成' | '待审批' | '草稿';
  supplier: string;
};

export const purchaseOrderListFixtures: readonly PurchaseOrderListItem[] = [
  { id: 'PO-20260216-015', po: 'PO-20260216-015', supplier: '南方光电科技有限公司', date: '2026-02-16', amount: 40500, skuCount: 5, status: '待收货' },
  { id: 'PO-20260216-002', po: 'PO-20260216-002', supplier: '捷科包装建材厂', date: '2026-02-04', amount: 8280, skuCount: 2, status: '已完成' },
  { id: 'PO-20260215-028', po: 'PO-20260215-028', supplier: '金源光电重镇', date: '2026-02-25', amount: 12400, skuCount: 11, status: '待审批' },
  { id: 'PO-20260211-049', po: 'PO-20260211-049', supplier: '广州极客五金', date: '2026-02-21', amount: 52190, skuCount: 4, status: '草稿' },
  { id: 'PO-20260208-102', po: 'PO-20260208-102', supplier: '鸿鹏电子器件', date: '2026-02-08', amount: 19880, skuCount: 7, status: '待收货' },
  { id: 'PO-20260207-008', po: 'PO-20260207-008', supplier: '蓝海包装科技', date: '2026-02-07', amount: 9600, skuCount: 3, status: '已完成' },
] as const;
