import { PageFrame, SurfaceCard, TemplateBadge, styles } from '@/components/layouts';

const abbreviations = [
  { code: 'SKU', name: 'Stock Keeping Unit', cn: '商品编码 / 库存单位', meaning: '可管理的最小商品单位。' },
  { code: 'PO', name: 'Purchase Order', cn: '采购订单', meaning: '计划向供应商采购什么、采购多少。' },
  { code: 'GRN', name: 'Goods Receipt Note', cn: '入库单 / 收货单', meaning: '仓库实际收货记录；过账后增加库存。' },
  { code: 'SO', name: 'Sales Order', cn: '销售订单', meaning: '客户订单，定义销售条目与数量。' },
  { code: 'OUT', name: 'Outbound Order', cn: '出库单', meaning: '仓库实际发货记录；过账后减少库存。' },
  { code: 'ADJ', name: 'Adjustment', cn: '调整单', meaning: '盘点差异形成的库存调整单。' },
  { code: 'PAY', name: 'Payment', cn: '付款单', meaning: '向供应商付款（当前系统预留）。' },
  { code: 'REC', name: 'Receipt', cn: '收款单', meaning: '向客户收款（当前系统预留）。' },
];

const flows = [
  {
    title: '采购入库流程',
    path: '需求/补货建议 -> PO -> 供应商到货 -> GRN -> 库存增加 -> 对账/付款(PAY)',
    notes: ['PO/GRN 列表和详情可查。', 'PO/GRN 新建页面已存在，但提交流程尚未闭环。'],
  },
  {
    title: '销售出库流程',
    path: '客户询价 -> 报价(Quotation) -> SO -> OUT -> 库存减少 -> 开票/收款(REC)',
    notes: ['SO/OUT 列表和详情可查。', 'SO/OUT 新建页面已存在，但提交流程尚未闭环。'],
  },
  {
    title: '盘点调整流程',
    path: '盘点任务 -> 实盘录入 -> 差异复核 -> ADJ过账 -> 库存修正',
    notes: ['盘点查询可用。', '盘点新增与持久化链路仍需补齐。'],
  },
];

export default function HelpPage() {
  return (
    <PageFrame>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>帮助说明</h1>
          <p style={styles.description}>
            这页用于快速解释 miniERP 常见缩写与核心业务流程，给业务同学和新成员做统一口径。
          </p>
          <div style={styles.metaRow}>
            <TemplateBadge label="术语速查" tone="info" />
            <TemplateBadge label="业务流程" tone="success" />
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 20 }}>
        <SurfaceCard title="缩写对照表" description="先看这张表，再看流程图最容易理解。">
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>缩写</th>
                  <th style={styles.th}>英文</th>
                  <th style={styles.th}>中文</th>
                  <th style={styles.th}>说明</th>
                </tr>
              </thead>
              <tbody>
                {abbreviations.map((item) => (
                  <tr key={item.code}>
                    <td style={styles.td}>
                      <TemplateBadge label={item.code} tone="warning" />
                    </td>
                    <td style={styles.td}>{item.name}</td>
                    <td style={styles.td}>{item.cn}</td>
                    <td style={styles.td}>{item.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard title="业务流程（简版）" description="按实际操作顺序串联单据。">
          <div style={{ display: 'grid', gap: 14 }}>
            {flows.map((flow) => (
              <div key={flow.title} style={styles.fieldCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <TemplateBadge label={flow.title} tone="info" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 650, lineHeight: 1.6 }}>{flow.path}</div>
                <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                  {flow.notes.map((note) => (
                    <div key={note} style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      - {note}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </PageFrame>
  );
}
