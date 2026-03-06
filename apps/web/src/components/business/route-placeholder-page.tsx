import Link from 'next/link';

import { DetailLayout, OverviewLayout, SurfaceCard, TemplateBadge, WorkbenchLayout, WizardLayout } from '@/components/layouts';
import type {
  DetailTemplateContract,
  OverviewTemplateContract,
  TemplateAction,
  TemplateMetric,
  TemplateTag,
  WizardTemplateContract,
  WorkbenchTemplateContract,
} from '@/contracts';

type PlaceholderFamily = 'T1' | 'T2' | 'T3' | 'T4';

type PlaceholderPageProps = {
  family: PlaceholderFamily;
  route: string;
  title: string;
  summary: string;
  statusLabel?: string;
  statusTone?: TemplateTag['tone'];
  primaryAction?: TemplateAction;
  secondaryActions?: TemplateAction[];
  relatedLinks?: Array<{ label: string; href: string; description: string }>;
};

const readiness = ['DFP-READY', 'BE-READY', 'FE-E-READY', 'FE-F-READY'] as const;

function createTag(label: string, tone: TemplateTag['tone'] = 'info'): TemplateTag {
  return {
    key: label.toLowerCase().replace(/\s+/g, '-'),
    label,
    tone,
  };
}

function createMetrics(): TemplateMetric[] {
  return [
    { key: 'coverage', label: '蓝图覆盖', value: '新域 IA', hint: '已接入新导航与模板壳', tone: 'info' },
    { key: 'runtime', label: '运行态', value: '可访问', hint: '后续接入真实 BFF/SDK', tone: 'success' },
    { key: 'migration', label: '迁移状态', value: '兼容期', hint: '旧路径仍保留，逐步切换', tone: 'warning' },
  ];
}

function createOverviewContract(props: PlaceholderPageProps): OverviewTemplateContract {
  return {
    family: 'T1',
    route: props.route,
    title: props.title,
    summary: props.summary,
    readiness: [...readiness],
    header: {
      title: props.title,
      description: props.summary,
      statusTag: props.statusLabel ? createTag(props.statusLabel, props.statusTone) : undefined,
      primaryAction: props.primaryAction,
      secondaryActions: props.secondaryActions,
    },
    metrics: createMetrics(),
    navigationLabel: props.title,
    slots: {
      search: { key: 'search', title: '搜索', description: '保留跨域搜索入口' },
      todo: { key: 'todo', title: '待办', description: '展示当前域的优先任务' },
      quickActions: { key: 'quick-actions', title: '快捷操作', description: '连接旧页面与后续真实功能' },
      timeline: { key: 'timeline', title: '最近动作', description: '展示本域的迁移与实现轨迹' },
    },
  };
}

function createWorkbenchContract(props: PlaceholderPageProps): WorkbenchTemplateContract {
  return {
    family: 'T2',
    route: props.route,
    title: props.title,
    summary: props.summary,
    readiness: [...readiness],
    header: {
      title: props.title,
      description: props.summary,
      statusTag: props.statusLabel ? createTag(props.statusLabel, props.statusTone) : undefined,
      primaryAction: props.primaryAction,
      secondaryActions: props.secondaryActions,
    },
    filters: [
      { key: 'keyword', label: '关键词', kind: 'search', placeholder: '搜索编号、名称、责任人或状态' },
      { key: 'status', label: '状态', kind: 'multi-select', options: [{ label: '进行中', value: 'active' }] },
    ],
    slots: {
      toolbar: { key: 'toolbar', title: '工具条', description: '筛选、排序、批量操作' },
      results: { key: 'results', title: '结果', description: '列表与工作台主区' },
      detailDrawer: { key: 'detail', title: '详情抽屉', description: '显示记录摘要与后续动作' },
      bulkBar: { key: 'bulk', title: '批量条', description: '保留批量处理位' },
    },
  };
}

function createDetailContract(props: PlaceholderPageProps): DetailTemplateContract {
  return {
    family: 'T3',
    route: props.route,
    title: props.title,
    summary: props.summary,
    readiness: [...readiness],
    header: {
      title: props.title,
      description: props.summary,
      statusTag: props.statusLabel ? createTag(props.statusLabel, props.statusTone) : undefined,
      primaryAction: props.primaryAction,
      secondaryActions: props.secondaryActions,
    },
    sections: {
      primary: { key: 'primary', title: '基本信息' },
      secondary: { key: 'secondary', title: '关联数据' },
      tertiary: { key: 'tertiary', title: '迁移侧栏' },
    },
    tabs: [
      { key: 'overview', label: '概览' },
      { key: 'evidence', label: '证据' },
      { key: 'audit', label: '审计' },
    ],
    slots: {
      tabContent: { key: 'content', title: '详情内容', description: '占位承接明细、证据与日志' },
      quickActions: { key: 'quick', title: '快捷操作', description: '保留复制、跳转与迁移动作' },
    },
  };
}

function createWizardContract(props: PlaceholderPageProps): WizardTemplateContract {
  return {
    family: 'T4',
    route: props.route,
    title: props.title,
    summary: props.summary,
    readiness: [...readiness],
    header: {
      title: props.title,
      description: props.summary,
      statusTag: props.statusLabel ? createTag(props.statusLabel, props.statusTone) : undefined,
      primaryAction: props.primaryAction,
      secondaryActions: props.secondaryActions,
    },
    steps: [
      { key: 'base', title: '基础信息', description: '录入主数据与组织上下文', status: 'completed' },
      { key: 'lines', title: '明细', description: '录入业务行与关联数据', status: 'current' },
      { key: 'validate', title: '校验', description: '执行状态、凭证与库存校验', status: 'upcoming' },
      { key: 'submit', title: '提交', description: '幂等提交到真实后端', status: 'upcoming' },
    ],
    summaryMetrics: createMetrics(),
    footerActions: [
      { key: 'save', label: '保存草稿', tone: 'secondary' },
      { key: 'submit', label: '提交实现', tone: 'primary' },
    ],
    slots: {
      editor: { key: 'editor', title: '编辑区', description: '承接表单、表格与行级证据' },
      summary: { key: 'summary', title: '汇总区', description: '承接校验、统计与风险提示' },
    },
  };
}

function PlaceholderCardList({ title, items }: { title: string; items: string[] }) {
  return (
    <SurfaceCard title={title} description="当前页面已进入新 IA，但真实域能力仍在逐步并入。">
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              border: '1px solid rgba(224,221,214,0.92)',
              background: 'rgba(255,255,255,0.72)',
              fontSize: 14,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function RelatedLinks({ links }: { links: PlaceholderPageProps['relatedLinks'] }) {
  if (!links || links.length === 0) {
    return (
      <PlaceholderCardList
        title="后续接入点"
        items={[
          '接入 packages/shared 新枚举与领域 DTO',
          '接入对应域的 BFF/SDK 路由',
          '把占位卡片替换成真实列表、详情或向导数据',
        ]}
      />
    );
  }

  return (
    <SurfaceCard title="可用入口" description="先复用已落地页面，确保新 IA 可用。">
      <div style={{ display: 'grid', gap: 12 }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'grid',
              gap: 4,
              padding: '12px 14px',
              borderRadius: 14,
              border: '1px solid rgba(224,221,214,0.92)',
              background: 'rgba(255,255,255,0.72)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 650 }}>{link.label}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{link.description}</div>
          </Link>
        ))}
      </div>
    </SurfaceCard>
  );
}

export function RoutePlaceholderPage(props: PlaceholderPageProps) {
  if (props.family === 'T1') {
    return (
      <OverviewLayout
        contract={createOverviewContract(props)}
        searchSlot={<PlaceholderCardList title="搜索入口" items={['全局搜索已保留，后续按新域接入真正索引。']} />}
        todoSlot={<PlaceholderCardList title="当前待办" items={['这部分页面壳已经到位，下一步接入真实列表与状态机。']} />}
        quickActionsSlot={<RelatedLinks links={props.relatedLinks} />}
        timelineSlot={<PlaceholderCardList title="迁移轨迹" items={['2026-03-07：新 IA 路由已建立', '下一步：接入真实领域数据']} />}
      />
    );
  }

  if (props.family === 'T2') {
    return (
      <WorkbenchLayout
        contract={createWorkbenchContract(props)}
        toolbarSlot={<PlaceholderCardList title="筛选区" items={['列表页要求仍然是 URL 化筛选、排序和分页。']} />}
        resultsSlot={<PlaceholderCardList title="工作台主区" items={['这里将替换为真实表格/列表数据。']} />}
        detailSlot={<RelatedLinks links={props.relatedLinks} />}
        bulkBarSlot={<PlaceholderCardList title="批量操作" items={['批量动作位已预留，等领域服务接入后启用。']} />}
      />
    );
  }

  if (props.family === 'T3') {
    return (
      <DetailLayout
        contract={createDetailContract(props)}
        activeTabKey="overview"
        primarySlot={<PlaceholderCardList title="基本信息" items={['详情页头部动作、区域分栏和证据位已固定。']} />}
        secondarySlot={<PlaceholderCardList title="关联关系" items={['这里会接入对应实体的行项目、关联单据与风险提示。']} />}
        tertiarySlot={<PlaceholderCardList title="侧栏" items={['保留快捷操作、迁移说明与接口状态。']} />}
        tabContentSlot={<PlaceholderCardList title="Tab 内容" items={['概览、证据、审计三类内容都将统一到这个详情模板。']} />}
        quickActionsSlot={<RelatedLinks links={props.relatedLinks} />}
      />
    );
  }

  return (
    <WizardLayout
      contract={createWizardContract(props)}
      editorSlot={<PlaceholderCardList title="编辑区" items={['向导页底部固定动作、校验摘要和幂等提交约束已经确定。']} />}
      summarySlot={
        <SurfaceCard title="汇总与迁移" description="当前先用模板壳承接新路由，后续逐步挂入真实表单与计算。">
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <TemplateBadge label="Idempotency-Key" tone="warning" />
              <TemplateBadge label="Evidence Ready" tone="info" />
              <TemplateBadge label="URL Replay" tone="success" />
            </div>
            <RelatedLinks links={props.relatedLinks} />
          </div>
        </SurfaceCard>
      }
    />
  );
}

export function buildRoutePlaceholderProps(
  family: PlaceholderFamily,
  route: string,
  title: string,
  summary: string,
  relatedLinks?: PlaceholderPageProps['relatedLinks'],
): PlaceholderPageProps {
  return {
    family,
    route,
    title,
    summary,
    statusLabel: '迁移中',
    statusTone: 'warning',
    primaryAction: relatedLinks?.[0]
      ? {
          key: 'open-related',
          label: `打开${relatedLinks[0].label}`,
          tone: 'primary',
          href: relatedLinks[0].href,
        }
      : undefined,
    secondaryActions: relatedLinks?.slice(1, 3).map((link, index) => ({
      key: `link-${index}`,
      label: link.label,
      tone: 'secondary',
      href: link.href,
    })),
    relatedLinks,
  };
}
