'use client';

import type { ReactNode } from 'react';

export interface PreviewField {
    label: string;
    value: string;
}

interface QuickPreviewProps {
    /** 预览面板标题 */
    title?: string;
    /** 主标识（如 SKU 编码） */
    heading: string;
    /** 副标题（如产品名称） */
    subheading?: string;
    /** 键值对字段 */
    fields: PreviewField[];
    /** 底部操作按钮区域 */
    actions?: ReactNode;
    /** 关闭回调 */
    onClose: () => void;
    /** 面板宽度 */
    width?: number;
}

export function QuickPreview({
    title = '快速预览',
    heading,
    subheading,
    fields,
    actions,
    onClose,
    width = 280,
}: QuickPreviewProps) {
    return (
        <div
            style={{
                width,
                background: '#FFFFFF',
                borderLeft: '1px solid #E0DDD8',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                overflowY: 'auto',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3
                    style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: 'var(--font-display-family), sans-serif',
                    }}
                >
                    {title}
                </h3>
                <button
                    onClick={onClose}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 16,
                        color: '#888888',
                        padding: '2px 6px',
                    }}
                    aria-label="关闭预览"
                >
                    ×
                </button>
            </div>

            {/* Heading */}
            <div
                style={{
                    fontFamily: 'var(--font-display-family), sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#1a1a1a',
                }}
            >
                {heading}
            </div>

            {subheading && (
                <div style={{ fontSize: 13, color: '#666666', marginTop: -8 }}>
                    {subheading}
                </div>
            )}

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {fields.map((field) => (
                    <div
                        key={field.label}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 13,
                        }}
                    >
                        <span style={{ color: '#888888' }}>{field.label}</span>
                        <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{field.value || '—'}</span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            {actions && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {actions}
                </div>
            )}
        </div>
    );
}
