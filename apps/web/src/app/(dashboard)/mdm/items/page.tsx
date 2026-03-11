const ITEM_ROWS = [
  {
    id: 'item-001',
    code: 'CAB-HDMI-2M',
    name: 'HDMI 高清线束',
    category: '线材',
    unit: '条',
    supplier: '华为技术',
    availableStock: '56',
    safetyStock: '10',
    status: '在售',
  },
  {
    id: 'item-002',
    code: 'PWR-100W-GN3',
    name: 'GaN 100W 充电器',
    category: '充电设备',
    unit: '套',
    supplier: '立讯精密',
    availableStock: '69',
    safetyStock: '20',
    status: '在售',
  },
  {
    id: 'item-003',
    code: 'ADP-USB-C-VGA',
    name: 'USB-C 转 VGA 转接器',
    category: '转接设备',
    unit: '个',
    supplier: '鸿海精密',
    availableStock: '12',
    safetyStock: '15',
    status: '低库存',
  },
] as const;

const FILTER_CHIPS = ['电子', '线材', '在售', '库存预警', '默认供应商'] as const;

const tableCellStyle = {
  padding: '12px 14px',
  borderBottom: '1px solid #E8E4DD',
  fontSize: 13,
  color: '#1A1A1A',
  textAlign: 'left' as const,
};

function ToolbarButton({ label, primary = false }: { label: string; primary?: boolean }) {
  return (
    <button
      type="button"
      style={{
        minHeight: 40,
        padding: '0 16px',
        borderRadius: 10,
        border: primary ? '1px solid #C05A3C' : '1px solid #D1CCC4',
        background: primary ? '#C05A3C' : '#FFFFFF',
        color: primary ? '#FFFFFF' : '#666666',
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}

export default function ItemsPage() {
  return (
    <div style={{ padding: '32px 40px', display: 'grid', gap: 20, background: '#F5F3EF' }}>
      <section
        data-testid="items-list-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 28, color: '#1A1A1A' }}>SKU 管理</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#666666', lineHeight: 1.6 }}>SKU 管理 · 管理工作台</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <ToolbarButton label="导入" />
          <ToolbarButton label="导出" />
          <ToolbarButton label="新建 SKU" primary />
        </div>
      </section>

      <section data-testid="items-list-search" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          value=""
          readOnly
          placeholder="搜索 SKU 编码、名称、分类、供应商..."
          style={{
            width: '100%',
            minHeight: 40,
            padding: '0 16px',
            borderRadius: 8,
            border: '1px solid #D1CCC4',
            background: '#FFFFFF',
            fontSize: 13,
          }}
        />
      </section>

      <section data-testid="items-list-filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            style={{
              borderRadius: 4,
              border: chip === '电子' ? '1px solid #1A1A1A' : '1px solid #D1CCC4',
              background: chip === '电子' ? '#1A1A1A' : '#FFFFFF',
              color: chip === '电子' ? '#F5F3EF' : '#666666',
              padding: '6px 14px',
              fontSize: 12,
            }}
          >
            {chip}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888888' }}>共 1,247 个 SKU</span>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 20 }}>
        <div>
          <section
            data-testid="items-list-table"
            style={{ borderRadius: 10, border: '1px solid #E8E4DD', background: '#FFFFFF', overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #E8E4DD',
                background: '#FAF8F5',
                fontSize: 12,
                color: '#888888',
              }}
            >
              <span>筛选 1,247 个结果</span>
              <span>查看预览</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAF8F5' }}>
                  <th style={tableCellStyle}>编码</th>
                  <th style={tableCellStyle}>名称 / 规格</th>
                  <th style={tableCellStyle}>分类</th>
                  <th style={tableCellStyle}>默认供应商</th>
                  <th style={tableCellStyle}>可用库存</th>
                  <th style={tableCellStyle}>最低库存</th>
                  <th style={tableCellStyle}>状态</th>
                </tr>
              </thead>
              <tbody>
                {ITEM_ROWS.map((item) => (
                  <tr key={item.id}>
                    <td style={tableCellStyle}>
                      <span style={{ color: '#C05A3C', fontWeight: 600 }}>
                        {item.code}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{item.name}</td>
                    <td style={tableCellStyle}>{item.category}</td>
                    <td style={tableCellStyle}>{item.supplier}</td>
                    <td style={tableCellStyle}>{item.availableStock}</td>
                    <td style={tableCellStyle}>{item.safetyStock}</td>
                    <td style={tableCellStyle}>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside
          data-testid="items-list-preview"
          style={{
            borderRadius: 10,
            border: '1px solid #E8E4DD',
            background: '#FFFFFF',
            padding: 16,
            display: 'grid',
            gap: 12,
            alignSelf: 'start',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>预览</div>
          <div style={{ fontSize: 13, color: '#1A1A1A' }}>ADP-USB-C-VGA</div>
          <div style={{ fontSize: 12, color: '#666666' }}>USB-C 转 VGA 转接器</div>
          <div style={{ fontSize: 12, color: '#666666' }}>分类：转接设备</div>
          <div style={{ fontSize: 12, color: '#666666' }}>默认供应商：鸿海精密</div>
          <div style={{ fontSize: 12, color: '#666666' }}>可用库存：12</div>
          <div style={{ fontSize: 12, color: '#666666' }}>最低库存：15</div>
        </aside>
      </section>
    </div>
  );
}
