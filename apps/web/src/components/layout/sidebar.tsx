'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Factory,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Truck,
} from 'lucide-react';

import { isRouteActive } from '@/lib/navigation/route-manifest';

type NestedNavItem = {
  label: string;
  href: string;
  matchPrefixes?: readonly string[];
  exactMatch?: boolean;
};

const masterDataItems: readonly NestedNavItem[] = [
  { label: '物料 SKU', href: '/mdm/skus', matchPrefixes: ['/mdm/skus'] },
  { label: '用户管理', href: '/mdm/users' },
  { label: '角色权限', href: '/mdm/roles' },
  { label: '组织架构', href: '/mdm/org' },
  { label: '客户管理', href: '/mdm/customers' },
  { label: '供应商管理', href: '/mdm/suppliers' },
  { label: 'BOM 列表', href: '/mdm/bom' },
  { label: '仓库管理', href: '/mdm/warehouses' },
];

const purchaseItems: readonly NestedNavItem[] = [
  { label: '采购概览', href: '/procure/purchase-orders/overview' },
  { label: '采购单管理', href: '/procure/purchase-orders', exactMatch: true },
];

const salesItems: readonly NestedNavItem[] = [
  { label: '销售概览', href: '/sales/orders/overview' },
  { label: '报价管理', href: '/sales/orders/quote' },
  { label: '销售订单管理', href: '/sales/orders', exactMatch: true },
  { label: '发运记录', href: '/sales/orders/ship' },
];

const inventoryItems: readonly NestedNavItem[] = [
  { label: '库存概览', href: '/inventory/overview' },
  { label: '库存余额', href: '/inventory/balance' },
  { label: '收货记录', href: '/inventory/grn' },
  { label: '库存流水', href: '/inventory/ledger' },
  { label: '库存调整', href: '/inventory/adjustment' },
  { label: '补货建议', href: '/inventory/restock' },
  { label: '盘点管理', href: '/inventory/stocktake', exactMatch: true },
];

const manufacturingItems: readonly NestedNavItem[] = [
  { label: '制造概览', href: '/manufacturing/overview' },
  { label: '生产订单', href: '/manufacturing/orders' },
  { label: '质检记录', href: '/manufacturing/qc' },
];

const financeItems: readonly NestedNavItem[] = [
  { label: '财务概览', href: '/finance/overview' },
  { label: '发票管理', href: '/finance/invoice' },
  { label: '记账凭证', href: '/finance/voucher' },
  { label: '收款记录', href: '/finance/collection' },
  { label: '付款记录', href: '/finance/payment' },
  { label: '会计科目', href: '/finance/accounts' },
  { label: '成本中心', href: '/finance/cost-center' },
  { label: '预算管理', href: '/finance/budget' },
];

function isNestedItemActive(pathname: string, item: NestedNavItem) {
  if (item.exactMatch) {
    return pathname === item.href;
  }

  return isRouteActive(pathname, item.href, item.matchPrefixes);
}

function nestedItemClass(pathname: string, item: NestedNavItem) {
  const active = isNestedItemActive(pathname, item);

  return `px-3 py-2 text-sm rounded-sm transition-colors ${
    active ? 'bg-sidebar-hover text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
  }`;
}

export default function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname() ?? '';

  const [isMasterDataActive, setIsMasterDataActive] = React.useState(pathname.startsWith('/mdm'));
  const [isPoActive, setIsPoActive] = React.useState(pathname.startsWith('/procure'));
  const [isSoActive, setIsSoActive] = React.useState(pathname.startsWith('/sales'));
  const [isInvActive, setIsInvActive] = React.useState(pathname.startsWith('/inventory'));
  const [isMfgActive, setIsMfgActive] = React.useState(pathname.startsWith('/manufacturing'));
  const [isFinActive, setIsFinActive] = React.useState(pathname.startsWith('/finance'));

  React.useEffect(() => {
    if (pathname.startsWith('/mdm')) setIsMasterDataActive(true);
    if (pathname.startsWith('/procure')) setIsPoActive(true);
    if (pathname.startsWith('/sales')) setIsSoActive(true);
    if (pathname.startsWith('/inventory')) setIsInvActive(true);
    if (pathname.startsWith('/manufacturing')) setIsMfgActive(true);
    if (pathname.startsWith('/finance')) setIsFinActive(true);
  }, [pathname]);

  return (
    <aside className={`bg-sidebar text-sidebar-foreground h-full overflow-y-auto flex flex-col py-7 px-5 ${className}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2.5 h-2.5 bg-primary" />
        <span className="font-['var(--font-space-grotesk)'] font-bold text-base tracking-[2px]">
          MINIERP
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2 pt-4">
        <Link
          href="/workspace"
          className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
            pathname.startsWith('/workspace') ? 'bg-sidebar-hover text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-bold">工作台</span>
        </Link>

        <Link
          href="/workflow/approval"
          className={`flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
            pathname.startsWith('/workflow') ? 'bg-sidebar-hover text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
          }`}
        >
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5" />
            <span className="font-bold">审批中心</span>
          </div>
          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">8</span>
        </Link>

        <div className="h-[1px] bg-sidebar-border w-full my-4" />

        <div>
          <button
            onClick={() => setIsMasterDataActive((current) => !current)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
              isMasterDataActive ? 'bg-sidebar-hover/50 text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider">主数据</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isMasterDataActive ? 'rotate-180' : ''}`} />
          </button>

          {isMasterDataActive ? (
            <div className="flex flex-col gap-1 pl-11 mt-1 pr-2">
              {masterDataItems.map((item) => (
                <Link key={item.href} href={item.href} className={nestedItemClass(pathname, item)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <button
            onClick={() => setIsPoActive((current) => !current)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
              isPoActive ? 'bg-sidebar-hover/50 text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider">采购管理</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isPoActive ? 'rotate-180' : ''}`} />
          </button>

          {isPoActive ? (
            <div className="flex flex-col gap-1 pl-11 mt-1 pr-2">
              {purchaseItems.map((item) => (
                <Link key={item.href} href={item.href} className={nestedItemClass(pathname, item)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <button
            onClick={() => setIsSoActive((current) => !current)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
              isSoActive ? 'bg-sidebar-hover/50 text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider">销售管理</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSoActive ? 'rotate-180' : ''}`} />
          </button>

          {isSoActive ? (
            <div className="flex flex-col gap-1 pl-11 mt-1 pr-2">
              {salesItems.map((item) => (
                <Link key={item.href} href={item.href} className={nestedItemClass(pathname, item)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <button
            onClick={() => setIsInvActive((current) => !current)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
              isInvActive ? 'bg-sidebar-hover/50 text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider">库存中心</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isInvActive ? 'rotate-180' : ''}`} />
          </button>

          {isInvActive ? (
            <div className="flex flex-col gap-1 pl-11 mt-1 pr-2">
              {inventoryItems.map((item) => (
                <Link key={item.href} href={item.href} className={nestedItemClass(pathname, item)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <button
            onClick={() => setIsMfgActive((current) => !current)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
              isMfgActive ? 'bg-sidebar-hover/50 text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Factory className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider">制造管理</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isMfgActive ? 'rotate-180' : ''}`} />
          </button>

          {isMfgActive ? (
            <div className="flex flex-col gap-1 pl-11 mt-1 pr-2">
              {manufacturingItems.map((item) => (
                <Link key={item.href} href={item.href} className={nestedItemClass(pathname, item)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <button
            onClick={() => setIsFinActive((current) => !current)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
              isFinActive ? 'bg-sidebar-hover/50 text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <CircleDollarSign className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider">财务中心</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFinActive ? 'rotate-180' : ''}`} />
          </button>

          {isFinActive ? (
            <div className="flex flex-col gap-1 pl-11 mt-1 pr-2">
              {financeItems.map((item) => (
                <Link key={item.href} href={item.href} className={nestedItemClass(pathname, item)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <Link
          href="/reports"
          className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
            pathname.startsWith('/reports') ? 'bg-sidebar-hover text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-bold">报表中心</span>
        </Link>

        <div className="flex-1" />

        <div className="h-[1px] bg-sidebar-border w-full my-2" />
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
            pathname.startsWith('/settings') ? 'bg-sidebar-hover text-sidebar-foreground' : 'text-muted hover:text-sidebar-foreground'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-bold">系统设置</span>
        </Link>
      </nav>
    </aside>
  );
}
