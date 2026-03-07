'use client';

import type { ReactNode } from 'react';

export interface TableColumn {
    key: string;
    label: string;
    width?: number | string;
    render?: (value: string, row: Record<string, string>) => ReactNode;
}

interface DataTableProps {
    columns: TableColumn[];
    rows: Record<string, string>[];
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    onRowClick?: (row: Record<string, string>) => void;
    selectedRowId?: string;
    showPagination?: boolean;
}

export function DataTable({
    columns,
    rows,
    currentPage = 1,
    totalPages = 1,
    totalItems,
    onPageChange,
    onRowClick,
    selectedRowId,
    showPagination = true,
}: DataTableProps) {
    return (
        <div style={{
            background: '#FFFFFF',
            border: '1px solid #E0DDD8',
            borderRadius: 8,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F5F3EF',
                padding: '12px 16px',
                borderBottom: '1px solid #E0DDD8',
                gap: 0,
            }}>
                {columns.map(col => (
                    <div key={col.key} style={{
                        flex: col.width ? `0 0 ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : 1,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#888888',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.04em',
                    }}>
                        {col.label}
                    </div>
                ))}
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {rows.map((row, idx) => (
                    <div
                        key={row.id || idx}
                        onClick={() => onRowClick?.(row)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '14px 16px',
                            borderBottom: idx < rows.length - 1 ? '1px solid #F0EDE8' : undefined,
                            cursor: onRowClick ? 'pointer' : 'default',
                            background: selectedRowId === row.id ? '#F5F3EF' : 'transparent',
                            transition: 'background 0.1s',
                        }}
                    >
                        {columns.map(col => (
                            <div key={col.key} style={{
                                flex: col.width ? `0 0 ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : 1,
                                fontSize: 13,
                                color: '#1a1a1a',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {col.render ? col.render(row[col.key] || '', row) : (row[col.key] || '')}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Footer / Pagination */}
            {showPagination && totalPages > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderTop: '1px solid #E0DDD8',
                    fontSize: 13,
                    color: '#888888',
                }}>
                    <span>
                        {totalItems !== undefined ? `共 ${totalItems} 条` : `第 ${currentPage} 页`}
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                            onClick={() => onPageChange?.(currentPage - 1)}
                            disabled={currentPage <= 1}
                            style={{
                                padding: '4px 10px',
                                borderRadius: 4,
                                border: '1px solid #D1CCC4',
                                background: '#fff',
                                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                                opacity: currentPage <= 1 ? 0.4 : 1,
                                fontSize: 13,
                            }}
                        >
                            ‹
                        </button>
                        <span>{currentPage} / {totalPages}</span>
                        <button
                            onClick={() => onPageChange?.(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            style={{
                                padding: '4px 10px',
                                borderRadius: 4,
                                border: '1px solid #D1CCC4',
                                background: '#fff',
                                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                                opacity: currentPage >= totalPages ? 0.4 : 1,
                                fontSize: 13,
                            }}
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
