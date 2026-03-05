'use client';

import { PageHeader } from '@/components/ui';

const cards = [
    {
        title: 'GraphQL API',
        desc: '使用 GraphQL 查询和变更数据，支持类型安全的 schema-first 开发。',
        endpoint: '/graphql',
    },
    {
        title: 'REST API',
        desc: '传统 REST 风格接口，支持分页、过滤和排序。',
        endpoint: '/api/v1/*',
    },
];

const codeExample = `query {
  skus(first: 10) {
    edges {
      node {
        id
        name
        barcode
        inventory { quantity }
      }
    }
  }
}`;

export default function DeveloperCenterPage() {
    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'auto' }}>
            <PageHeader title="开发者中心" />

            {/* API Cards */}
            <div style={{ display: 'flex', gap: 20 }}>
                {cards.map(card => (
                    <div key={card.title} style={{
                        flex: 1, background: '#fff', border: '1px solid #E0DDD8',
                        borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
                    }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
                            {card.title}
                        </h3>
                        <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.6 }}>{card.desc}</p>
                        <div style={{
                            padding: '8px 14px', background: '#F5F3EF', borderRadius: 4,
                            fontSize: 13, fontFamily: 'monospace', color: '#C05A3C',
                        }}>
                            {card.endpoint}
                        </div>
                    </div>
                ))}
            </div>

            {/* Code area */}
            <div style={{
                background: '#1a1a1a',
                borderRadius: 8,
                padding: 24,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
            }}>
                <div style={{
                    fontSize: 14, fontWeight: 600, color: '#C05A3C',
                    fontFamily: 'var(--font-display-family), sans-serif',
                }}>
                    GraphQL 示例查询
                </div>
                <pre style={{
                    margin: 0, fontSize: 13, color: '#E0DDD8',
                    fontFamily: 'monospace', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                }}>
                    {codeExample}
                </pre>
            </div>
        </div>
    );
}
