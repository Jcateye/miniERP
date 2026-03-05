'use client';

import { useState } from 'react';

export interface FilterTabItem {
    key: string;
    label: string;
    /** 可选 badge 数量 */
    count?: number;
}

interface FilterTabsProps {
    tabs: FilterTabItem[];
    /** 默认激活的 key，不传则激活第一个 */
    activeKey?: string;
    /** 切换回调 */
    onChange?: (key: string) => void;
    /** 右侧统计提示文字，如 "显示 1 到 5 / 总 5 条" */
    summary?: string;
}

export function FilterTabs({
    tabs,
    activeKey,
    onChange,
    summary,
}: FilterTabsProps) {
    const [internalActive, setInternalActive] = useState(activeKey || tabs[0]?.key || '');
    const currentKey = activeKey ?? internalActive;

    const handleClick = (key: string) => {
        setInternalActive(key);
        onChange?.(key);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {tabs.map((tab) => {
                const isActive = tab.key === currentKey;
                return (
                    <button
                        key={tab.key}
                        onClick={() => handleClick(tab.key)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: 4,
                            border: isActive ? '1px solid #1a1a1a' : '1px solid #E0DDD8',
                            background: isActive ? '#1a1a1a' : 'transparent',
                            color: isActive ? '#FFFFFF' : '#666666',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    opacity: 0.7,
                                }}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
            {summary && (
                <span style={{ fontSize: 12, color: '#888888', marginLeft: 8 }}>
                    {summary}
                </span>
            )}
        </div>
    );
}
