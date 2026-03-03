import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SKU 详情 — miniERP",
    description: "SKU 详细信息、库存概览、外部映射、库存流水",
};

const C = {
    charcoal: "#1a1a1a",
    terracotta: "#C05A3C",
    success: "#2E7D32",
    successBg: "#E8F5E9",
    error: "#D94F4F",
    border: "#E0DDD6",
    textMuted: "#9B9690",
    textSecondary: "#6B6860",
    white: "#FFFFFF",
    cream: "#F5F3EF",
};

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'Inter', sans-serif";

const SKU_DETAIL = {
    code: "CAB-HDMI-2M",
    name: "HDMI 高速视频线 2m / 镀金 / 4K@60",
    status: "active",
    category: "线材类",
    brand: "TBX",
    unit: "件",
    createdAt: "2024-08-14",
    updatedAt: "2025-02-05",
    spec: {
        type: "HDMI 2.0",
        length: "2m",
        connector: "镀金",
        resolution: "4K@60Hz",
        bandwidth: "18Gbps",
        color: "黑色",
    },
    stock: 342,
    minStock: 50,
    warehouse: [
        { name: "上海主仓", qty: 285 },
        { name: "北京备货仓", qty: 57 },
    ],
    mappings: [
        { source: "供应商", mappingCode: "SC-HDM-2M-0.3S", isPrimary: true },
        { source: "客户码", mappingCode: "CL-H72-2M-0M", isPrimary: false },
    ],
    ledger: [
        { date: "2025-02-05", doc: "GRN-2025-0201-118", type: "入库", qty: "+50", balance: 342 },
        { date: "2025-01-22", doc: "OUT-2025-0122-043", type: "出库", qty: "-20", balance: 292 },
        { date: "2024-12-10", doc: "GRN-2024-1210-098", type: "入库", qty: "+100", balance: 312 },
    ],
};

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                display: "flex",
                padding: "7px 0",
                borderBottom: `1px solid ${C.border}`,
            }}
        >
            <span
                style={{
                    width: 110,
                    fontFamily: bodyFont,
                    fontSize: 12,
                    color: C.textMuted,
                    flexShrink: 0,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontFamily: bodyFont,
                    fontSize: 12,
                    color: C.charcoal,
                    fontWeight: 500,
                }}
            >
                {value}
            </span>
        </div>
    );
}

export default function SkuDetailPage() {
    return (
        <div
            style={{
                padding: "28px 32px",
                minHeight: "100vh",
                background: "#F5F3EF",
            }}
        >
            {/* 面包屑 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Link href="/" style={{ fontFamily: bodyFont, fontSize: 12, color: C.textMuted, textDecoration: "none" }}>
                    首页
                </Link>
                <span style={{ color: C.border }}>/</span>
                <Link href="/skus" style={{ fontFamily: bodyFont, fontSize: 12, color: C.textMuted, textDecoration: "none" }}>
                    SKU 管理
                </Link>
                <span style={{ color: C.border }}>/</span>
                <span style={{ fontFamily: bodyFont, fontSize: 12, color: C.charcoal }}>
                    {SKU_DETAIL.code}
                </span>
            </div>

            {/* 页面头部 */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 24,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Link
                        href="/skus"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            background: C.white,
                            textDecoration: "none",
                            color: C.textSecondary,
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </Link>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <h1
                                style={{
                                    fontFamily: displayFont,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: C.charcoal,
                                    margin: 0,
                                }}
                            >
                                {SKU_DETAIL.code}
                            </h1>
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                    background: C.successBg,
                                    color: C.success,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: "0.5px",
                                    textTransform: "uppercase" as const,
                                }}
                            >
                                <span
                                    style={{
                                        width: 5,
                                        height: 5,
                                        borderRadius: "50%",
                                        background: C.success,
                                        marginRight: 5,
                                    }}
                                />
                                活跃
                            </span>
                        </div>
                        <p style={{ fontFamily: bodyFont, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
                            {SKU_DETAIL.name}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        style={{
                            padding: "8px 16px",
                            background: C.white,
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            fontFamily: bodyFont,
                            fontSize: 13,
                            color: C.textSecondary,
                            cursor: "pointer",
                        }}
                    >
                        编辑
                    </button>
                    <button
                        style={{
                            padding: "8px 16px",
                            background: C.white,
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            fontFamily: bodyFont,
                            fontSize: 13,
                            color: C.textSecondary,
                            cursor: "pointer",
                        }}
                    >
                        复制变体
                    </button>
                    <button
                        style={{
                            padding: "8px 16px",
                            background: "#FEE2E2",
                            border: "1px solid #FECACA",
                            borderRadius: 6,
                            fontFamily: bodyFont,
                            fontSize: 13,
                            color: "#B54A4A",
                            cursor: "pointer",
                        }}
                    >
                        停用
                    </button>
                </div>
            </div>

            {/* 三栏布局 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 220px", gap: 16, marginBottom: 24 }}>
                {/* 基本信息 */}
                <div
                    style={{
                        background: C.white,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "18px 20px",
                    }}
                >
                    <div
                        style={{
                            fontFamily: displayFont,
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.charcoal,
                            marginBottom: 12,
                            paddingBottom: 10,
                            borderBottom: `1px solid ${C.border}`,
                        }}
                    >
                        基本信息
                    </div>
                    <InfoRow label="品名" value={SKU_DETAIL.name} />
                    <InfoRow label="分类" value={SKU_DETAIL.category} />
                    <InfoRow label="品牌" value={SKU_DETAIL.brand} />
                    <InfoRow label="单位" value={SKU_DETAIL.unit} />
                    <InfoRow label="创建时间" value={SKU_DETAIL.createdAt} />
                    <InfoRow label="最后更新" value={SKU_DETAIL.updatedAt} />
                </div>

                {/* 规格字段 */}
                <div
                    style={{
                        background: C.white,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "18px 20px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 12,
                            paddingBottom: 10,
                            borderBottom: `1px solid ${C.border}`,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: displayFont,
                                fontSize: 13,
                                fontWeight: 600,
                                color: C.charcoal,
                            }}
                        >
                            规格字段
                        </span>
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                fontFamily: bodyFont,
                                fontSize: 11,
                                color: C.terracotta,
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            复制为文本
                        </button>
                    </div>
                    {Object.entries(SKU_DETAIL.spec).map(([k, v]) => (
                        <InfoRow
                            key={k}
                            label={
                                { type: "接口类型", length: "长度", connector: "接头", resolution: "分辨率", bandwidth: "带宽", color: "颜色" }[k] ?? k
                            }
                            value={v}
                        />
                    ))}
                </div>

                {/* 库存概览（黑色卡片） */}
                <div
                    style={{
                        background: C.charcoal,
                        borderRadius: 8,
                        padding: "18px 16px",
                        display: "flex",
                        flexDirection: "column" as const,
                    }}
                >
                    <div
                        style={{
                            fontFamily: bodyFont,
                            fontSize: 11,
                            letterSpacing: "1px",
                            textTransform: "uppercase" as const,
                            color: "rgba(255,255,255,0.4)",
                            marginBottom: 6,
                        }}
                    >
                        库存概览
                    </div>
                    <div
                        style={{
                            fontFamily: displayFont,
                            fontSize: 52,
                            fontWeight: 700,
                            color: C.white,
                            lineHeight: 1,
                            marginBottom: 4,
                        }}
                    >
                        {SKU_DETAIL.stock}
                    </div>
                    <div style={{ fontFamily: bodyFont, fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
                        最低库存 {SKU_DETAIL.minStock}
                    </div>

                    {SKU_DETAIL.warehouse.map((w) => (
                        <div
                            key={w.name}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "5px 0",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            <span style={{ fontFamily: bodyFont, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                                {w.name}
                            </span>
                            <span style={{ fontFamily: displayFont, fontSize: 12, fontWeight: 600, color: C.white }}>
                                {w.qty}
                            </span>
                        </div>
                    ))}

                    <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 16 }}>
                        <a
                            href="/purchasing/grn/new"
                            style={{
                                flex: 1,
                                padding: "7px 0",
                                background: C.terracotta,
                                border: "none",
                                borderRadius: 6,
                                fontFamily: bodyFont,
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.white,
                                cursor: "pointer",
                                textDecoration: "none",
                                textAlign: "center" as const,
                            }}
                        >
                            入库
                        </a>
                        <a
                            href="/sales/out/new"
                            style={{
                                flex: 1,
                                padding: "7px 0",
                                background: "transparent",
                                border: "1px solid rgba(255,255,255,0.3)",
                                borderRadius: 6,
                                fontFamily: bodyFont,
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.white,
                                cursor: "pointer",
                                textDecoration: "none",
                                textAlign: "center" as const,
                            }}
                        >
                            出库
                        </a>
                    </div>
                </div>
            </div>

            {/* Tab 区域 */}
            <div
                style={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    overflow: "hidden",
                }}
            >
                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        borderBottom: `1px solid ${C.border}`,
                        padding: "0 20px",
                    }}
                >
                    {["外部映射", "库存流水", "关联单据", "附件", "操作日志"].map((tab, i) => (
                        <button
                            key={tab}
                            style={{
                                padding: "12px 16px",
                                background: "none",
                                border: "none",
                                borderBottom: i === 0 ? `2px solid ${C.terracotta}` : "2px solid transparent",
                                fontFamily: bodyFont,
                                fontSize: 13,
                                fontWeight: i === 0 ? 600 : 400,
                                color: i === 0 ? C.terracotta : C.textMuted,
                                cursor: "pointer",
                                marginRight: 4,
                                transition: "all 0.15s",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 外部映射表 */}
                <div style={{ padding: "16px 20px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                        <thead>
                            <tr style={{ background: "#F9F7F4" }}>
                                {["来源类型", "映射编码", "主映射"].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: "8px 12px",
                                            textAlign: "left" as const,
                                            fontFamily: bodyFont,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            letterSpacing: "1px",
                                            textTransform: "uppercase" as const,
                                            color: C.textMuted,
                                            borderBottom: `1px solid ${C.border}`,
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {SKU_DETAIL.mappings.map((m, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: "10px 12px", fontFamily: bodyFont, fontSize: 13 }}>
                                        {m.source}
                                    </td>
                                    <td
                                        style={{
                                            padding: "10px 12px",
                                            fontFamily: displayFont,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: C.charcoal,
                                        }}
                                    >
                                        {m.mappingCode}
                                    </td>
                                    <td style={{ padding: "10px 12px" }}>
                                        {m.isPrimary && (
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    padding: "2px 8px",
                                                    background: C.successBg,
                                                    color: C.success,
                                                    borderRadius: 4,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                ✓ 主映射
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
