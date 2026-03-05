'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';

interface SearchBarProps {
    /** 搜索框 placeholder */
    placeholder?: string;
    /** 搜索值 */
    value?: string;
    /** 搜索值变化 */
    onSearchChange?: (value: string) => void;
    /** 搜索框最大宽度 */
    maxWidth?: number;
    /** 是否显示"高级筛选"按钮 */
    showAdvancedFilter?: boolean;
    /** 高级筛选按钮文字 */
    advancedFilterLabel?: string;
    /** 点击高级筛选 */
    onAdvancedFilter?: () => void;
    /** 右侧额外内容 */
    trailing?: ReactNode;
}

export function SearchBar({
    placeholder = '搜索...',
    value = '',
    onSearchChange,
    maxWidth = 400,
    showAdvancedFilter = false,
    advancedFilterLabel = '高级筛选',
    onAdvancedFilter,
    trailing,
}: SearchBarProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            {/* Search Input */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#FFFFFF',
                    border: '1px solid #E0DDD8',
                    borderRadius: 6,
                    padding: '0 12px',
                    height: 40,
                    flex: 1,
                    maxWidth,
                }}
            >
                <Search size={16} color="#888888" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
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

            {/* Advanced Filter Button */}
            {showAdvancedFilter && (
                <button
                    onClick={onAdvancedFilter}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '0 14px',
                        height: 40,
                        border: '1px solid #E0DDD8',
                        borderRadius: 6,
                        background: '#FFFFFF',
                        fontSize: 13,
                        cursor: 'pointer',
                        color: '#666666',
                        fontFamily: 'inherit',
                    }}
                >
                    <SlidersHorizontal size={14} />
                    {advancedFilterLabel}
                </button>
            )}

            {trailing}
        </div>
    );
}
