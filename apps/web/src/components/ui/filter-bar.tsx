'use client';

import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
}

interface FilterBarProps {
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    filters?: FilterConfig[];
    actions?: ReactNode;
}

export function FilterBar({
    searchPlaceholder = '搜索...',
    searchValue = '',
    onSearchChange,
    filters,
    actions,
}: FilterBarProps) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
        }}>
            {/* Search */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#FFFFFF',
                border: '1px solid #E0DDD8',
                borderRadius: 6,
                padding: '0 12px',
                height: 40,
                flex: 1,
                maxWidth: 360,
            }}>
                <Search size={16} color="#888888" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: 13,
                        color: '#1a1a1a',
                        background: 'transparent',
                        width: '100%',
                        fontFamily: 'inherit',
                    }}
                />
            </div>

            {/* Filters */}
            {filters?.map(filter => (
                <select
                    key={filter.key}
                    style={{
                        height: 40,
                        padding: '0 14px',
                        borderRadius: 6,
                        border: '1px solid #E0DDD8',
                        background: '#FFFFFF',
                        fontSize: 13,
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        outline: 'none',
                        fontFamily: 'inherit',
                    }}
                >
                    <option value="">{filter.label}</option>
                    {filter.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ))}

            {/* Spacer + actions */}
            {actions && (
                <>
                    <div style={{ flex: 1 }} />
                    {actions}
                </>
            )}
        </div>
    );
}
