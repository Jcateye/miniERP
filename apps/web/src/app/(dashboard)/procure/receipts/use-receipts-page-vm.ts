'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  buildGoodsReceiptSearchQuery,
  filterGoodsReceiptListItems,
  parseGoodsReceiptSearchParams,
  type GoodsReceiptListItem,
} from './receipts-page';

const SEED_GOODS_RECEIPT_LIST_ITEMS: readonly GoodsReceiptListItem[] = [
  {
    id: 'grn_1',
    grnNumber: 'DOC-GRN-20260306-005',
    purchaseOrderNumber: 'DOC-PO-20260305-008',
    supplierName: '华为技术',
    warehouseName: '深圳总仓',
    quantityLabel: '150',
    postedAtLabel: '03-06 14:30',
    statusLabel: '已过账',
  },
  {
    id: 'grn_2',
    grnNumber: 'DOC-GRN-20260307-002',
    purchaseOrderNumber: 'DOC-PO-20260306-013',
    supplierName: '立讯精密',
    warehouseName: '苏州成品仓',
    quantityLabel: '80',
    postedAtLabel: '03-07 09:10',
    statusLabel: '草稿',
  },
];

export function getSeedGoodsReceiptListItems(): GoodsReceiptListItem[] {
  return SEED_GOODS_RECEIPT_LIST_ITEMS.map((item) => ({ ...item }));
}

export function buildGoodsReceiptNavigationTarget(pathname: string, filters: { keyword: string }): string {
  const query = buildGoodsReceiptSearchQuery(filters);
  return query ? `${pathname}?${query}` : pathname;
}

export function getGoodsReceiptNavigationReplaceTarget(
  pathname: string,
  searchParams: URLSearchParams,
  filters: { keyword: string },
): string | null {
  const nextTarget = buildGoodsReceiptNavigationTarget(pathname, filters);
  const currentQuery = searchParams.toString();
  const currentTarget = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  return nextTarget === currentTarget ? null : nextTarget;
}

export function useReceiptsPageVm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseGoodsReceiptSearchParams(searchParams), [searchParams]);
  const [keywordInput, setKeywordInput] = useState(filters.keyword);
  const items = useMemo(() => getSeedGoodsReceiptListItems(), []);

  useEffect(() => {
    setKeywordInput(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const replaceTarget = getGoodsReceiptNavigationReplaceTarget(pathname, searchParams, {
        keyword: keywordInput,
      });

      if (replaceTarget) {
        router.replace(replaceTarget);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [keywordInput, pathname, router, searchParams]);

  const visibleItems = useMemo(() => filterGoodsReceiptListItems(items, { keyword: keywordInput }), [items, keywordInput]);

  return {
    items,
    keywordInput,
    setKeywordInput,
    visibleItems,
  };
}
