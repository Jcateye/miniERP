'use client';

import * as React from 'react';

export interface TableColumn {
  key: string;
  label: string;
  width?: number;
}

interface DataTableProps {
  columns: readonly TableColumn[];
  rows: readonly Record<string, React.ReactNode>[];
  showPagination?: boolean;
}

export function DataTable({
  columns,
  rows,
  showPagination = true,
}: DataTableProps) {
  return (
    <div
      style={{
        overflow: 'hidden',
        borderRadius: 8,
        border: '1px solid #E0DDD8',
        background: '#FFFFFF',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 640,
          }}
        >
          <thead style={{ background: '#FAF8F4' }}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    width: column.width,
                    padding: '14px 16px',
                    borderBottom: '1px solid #E0DDD8',
                    color: '#666666',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={String(row.id ?? rowIndex)}>
                {columns.map((column) => (
                  <td
                    key={`${String(row.id ?? rowIndex)}-${column.key}`}
                    style={{
                      padding: '16px',
                      borderBottom:
                        rowIndex === rows.length - 1
                          ? 'none'
                          : '1px solid #F0ECE6',
                      color: '#1A1A1A',
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row[column.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '24px 16px',
                    color: '#666666',
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                >
                  暂无数据
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {showPagination ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderTop: '1px solid #F0ECE6',
            color: '#666666',
            fontSize: 12,
          }}
        >
          <span>共 {rows.length} 条</span>
          <span>分页控件待接入</span>
        </div>
      ) : null}
    </div>
  );
}
