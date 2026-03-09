import type { ReactNode } from 'react';

import { PageHeader, SearchBar } from '@/components/ui';

import type { WorkspaceHomeKpiCard, WorkspaceHomePanelSection, WorkspaceHomeTodoItem } from './workspace-home-page';

type WorkspaceHomePageScaffoldProps = {
  title: string;
  summary: string;
  searchPlaceholder: string;
  kpis: readonly WorkspaceHomeKpiCard[];
  todoItems: readonly WorkspaceHomeTodoItem[];
  rightPanelSections: readonly WorkspaceHomePanelSection[];
};

function getKpiAccentColor(accent: WorkspaceHomeKpiCard['accent']): string {
  if (accent === 'warning') return '#C05A3C';
  if (accent === 'success') return '#4A7C59';
  if (accent === 'info') return '#5C7C8A';
  return '#B54A4A';
}

function WorkspaceKpiCard({ item }: { item: WorkspaceHomeKpiCard }) {
  return (
    <div
      style={{
        background: item.background,
        borderLeft: `3px solid ${getKpiAccentColor(item.accent)}`,
        padding: 24,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 12, color: '#888888' }}>{item.label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: getKpiAccentColor(item.accent) }}>{item.value}</div>
      <div style={{ fontSize: 12, color: '#666666' }}>{item.hint}</div>
    </div>
  );
}

function WorkspaceTodoPane({ items }: { items: readonly WorkspaceHomeTodoItem[] }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #D1CCC4',
        display: 'grid',
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E4DD', fontSize: 14, fontWeight: 700 }}>全局待办</div>
      <div style={{ display: 'grid' }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              padding: '14px 20px',
              borderBottom: index === items.length - 1 ? 'none' : '1px solid #E8E4DD',
              display: 'grid',
              gap: 4,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#C05A3C' }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#1A1A1A' }}>{item.summary}</div>
            <div style={{ fontSize: 11, color: '#888888' }}>{item.meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkspaceRightPanel({ sections }: { sections: readonly WorkspaceHomePanelSection[] }) {
  return (
    <div style={{ display: 'grid', gap: 16, width: 340 }}>
      {sections.map((section, sectionIndex) => {
        const isPrimary = sectionIndex === 0;
        return (
          <div key={section.id} style={{ display: 'grid', gap: 0 }}>
            <div
              style={{
                background: isPrimary ? '#1A1A1A' : '#FFFFFF',
                color: isPrimary ? '#F5F3EF' : '#1A1A1A',
                border: isPrimary ? 'none' : '1px solid #D1CCC4',
                borderBottom: isPrimary ? 'none' : '1px solid #E8E4DD',
                padding: '14px 18px',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {section.title}
            </div>
            <div
              style={{
                background: isPrimary ? '#1A1A1A' : '#FFFFFF',
                border: isPrimary ? 'none' : '1px solid #D1CCC4',
                borderTop: 'none',
                display: 'grid',
              }}
            >
              {section.items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 18px',
                    borderBottom:
                      index === section.items.length - 1 ? 'none' : `1px solid ${isPrimary ? '#333333' : '#E8E4DD'}`,
                    fontSize: 12,
                    color: isPrimary ? '#F5F3EF' : '#1A1A1A',
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WorkspaceHomePageScaffold({
  title,
  summary,
  searchPlaceholder,
  kpis,
  todoItems,
  rightPanelSections,
}: WorkspaceHomePageScaffoldProps) {
  return (
    <div
      style={{
        padding: '32px 40px',
        display: 'grid',
        gap: 28,
        minHeight: '100%',
        background: '#F5F3EF',
      }}
    >
      <div data-testid="workspace-home-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader title={title} subtitle={summary} />
        <SearchBar placeholder={searchPlaceholder} value="" onSearchChange={() => undefined} maxWidth={300} />
      </div>

      <div data-testid="workspace-home-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
        {kpis.map((item) => (
          <WorkspaceKpiCard key={item.id} item={item} />
        ))}
      </div>

      <div data-testid="workspace-home-main" style={{ display: 'flex', gap: 20, minHeight: 420 }}>
        <div style={{ flex: 1 }}>
          <WorkspaceTodoPane items={todoItems} />
        </div>
        <WorkspaceRightPanel sections={rightPanelSections} />
      </div>
    </div>
  );
}
