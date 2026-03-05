'use client';

import { useState, type ReactNode } from 'react';

export interface Tab {
    key: string;
    label: string;
    content: ReactNode;
}

interface TabPanelProps {
    tabs: Tab[];
    defaultTab?: string;
}

export function TabPanel({ tabs, defaultTab }: TabPanelProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key || '');

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
            {/* Tab Headers */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #E0DDD8',
            }}>
                {tabs.map(tab => {
                    const isActive = tab.key === activeTab;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '14px 24px',
                                fontSize: 13,
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#C05A3C' : '#888888',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '2px solid #C05A3C' : '2px solid transparent',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'color 0.15s',
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '16px 24px', flex: 1, overflowY: 'auto' }}>
                {tabs.find(t => t.key === activeTab)?.content}
            </div>
        </div>
    );
}
