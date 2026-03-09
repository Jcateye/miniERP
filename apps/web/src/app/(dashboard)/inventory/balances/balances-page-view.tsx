import type { ReactNode } from 'react';

import { ActionButton, PageHeader, SearchBar } from '@/components/ui';

import { INVENTORY_BALANCE_FILTER_OPTIONS, type InventoryBalanceFilter } from './balances-page';

type InventoryBalancesPageScaffoldProps = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  searchPlaceholder: string;
  keyword?: string;
  onKeywordChange?: (value: string) => void;
  activeFilter: InventoryBalanceFilter;
  onFilterChange?: (filter: InventoryBalanceFilter) => void;
  table: ReactNode;
};

export function InventoryBalancesPageScaffold({
  title,
  summary,
  primaryActionLabel,
  searchPlaceholder,
  keyword = '',
  onKeywordChange,
  activeFilter,
  onFilterChange,
  table,
}: InventoryBalancesPageScaffoldProps) {
  return (
    <div
      style={{
        padding: '32px 40px',
        display: 'grid',
        gap: 24,
        minHeight: '100%',
        background: '#F5F3EF',
      }}
    >
      <div data-testid="inventory-balances-topbar">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={<ActionButton label={primaryActionLabel} tone="secondary" disabled />}
        />
      </div>

      <div data-testid="inventory-balances-search">
        <SearchBar
          placeholder={searchPlaceholder}
          value={keyword}
          onSearchChange={onKeywordChange}
          maxWidth={9999}
        />
      </div>

      <div data-testid="inventory-balances-filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {INVENTORY_BALANCE_FILTER_OPTIONS.map((option) => {
          const isActive = option.value === activeFilter;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onFilterChange?.(option.value)}
              style={{
                borderRadius: 4,
                border: isActive ? '1px solid #1A1A1A' : '1px solid #D1CCC4',
                background: isActive ? '#1A1A1A' : '#FFFFFF',
                color: isActive ? '#F5F3EF' : '#666666',
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#888888' }}>共 1,247 条 · 显示 1-50</div>
      </div>

      <div data-testid="inventory-balances-table">{table}</div>
    </div>
  );
}
