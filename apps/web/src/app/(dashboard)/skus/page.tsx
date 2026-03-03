"use client";

import Link from "next/link";
import { useState } from "react";

/* ── 设计常量 ── */
const C = {
    charcoal: "#1a1a1a",
    cream: "#F5F3EF",
    terracotta: "#C05A3C",
    terracottaDark: "#A84C31",
    success: "#2E7D32",
    successBg: "#E8F5E9",
    error: "#D94F4F",
    border: "#E0DDD6",
    textMuted: "#9B9690",
    textSecondary: "#6B6860",
    white: "#FFFFFF",
    rowHover: "#F9F7F4",
    rowSelected: "#FEF0EC",
};

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'Inter', sans-serif";

/* ── 类型 ── */
type SkuStatus = "active" | "inactive" | "pending";

interface Sku {
    id: string;
    code: string;
    name: string;
    category: string;
    spec: string;
    stock: number;
    minStock: number;
    price: number;
    status: SkuStatus;
}

/* ── 模拟数据 ── */
const MOCK_SKUS: Sku[] = [
    { id: "1", code: "TAY-HDMI-2M", name: "HDMI 高速线材 2m / 锌合金接头 / 4K", category: "线材类", spec: "2m", stock: 562, minStock: 50, price: 32.5, status: "active" },
    { id: "2", code: "CON-PURE-GATE", name: "Pure#8 音频连接器 Gate", category: "连接器", spec: "标准型", price: 120.0, stock: 12, minStock: 30, status: "active" },
    { id: "3", code: "ADP-USB3-VGA", name: "USB 3.0 转 VGA 适配器", category: "适配器", spec: "标准", price: 58.0, stock: 89, minStock: 20, status: "active" },
    { id: "4", code: "HAB-USB4-F12", name: "USB4 Hub 12 口 / 铝合金外壳", category: "集线器", spec: "12口", price: 299.0, stock: 5, minStock: 10, status: "inactive" },
    { id: "5", code: "CAB-SC-PC-1M5", name: "SC-PC 光纤跳线 1.5m", category: "光纤", spec: "1.5m", price: 18.5, stock: 340, minStock: 80, status: "active" },
    { id: "6", code: "TAY-HDMI-5M", name: "HDMI 高速线材 5m / 锌合金接头 / 4K", category: "线材类", spec: "5m", price: 45.0, stock: 233, minStock: 50, status: "active" },
    { id: "7", code: "ADP-DP-HDMI", name: "DisplayPort 转 HDMI 适配器 4K@60", category: "适配器", spec: "4K版", price: 72.0, stock: 67, minStock: 20, status: "active" },
];

function StatusBadge({ status }: { status: SkuStatus }) {
    const map = {
        active: { label: "活跃", bg: "#E8F5E9", color: C.success },
        inactive: { label: "停用", bg: "#FEE2E2", color: "#B54A4A" },
        pending: { label: "待审", bg: "#FEF3C7", color: "#92400E" },
    };
    const s = map[status];
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: 4,
                background: s.bg,
                color: s.color,
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
                    background: s.color,
                    marginRight: 5,
                }}
            />
            {s.label}
        </span>
    );
}

function SearchIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
    );
}

function Drawer({ sku, onClose }: { sku: Sku; onClose: () => void }) {
    return (
        <div
            style={{
                width: 320,
                background: C.white,
                borderLeft: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                animation: "slideInRight 0.25s ease-out",
                flexShrink: 0,
            }}
        >
            {/* 抽屉头部 */}
            <div
                style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <div style={{ fontFamily: displayFont, fontSize: 14, fontWeight: 700, color: C.charcoal }}>
                        快速详情
                    </div>
                    <div style={{ fontFamily: bodyFont, fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                        {sku.code}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        color: C.textMuted,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* 抽屉内容 */}
            <div style={{ padding: "16px 20px", flex: 1, overflowY: "auto" }}>
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: bodyFont, fontSize: 13, fontWeight: 600, color: C.charcoal }}>
                        {sku.name}
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <StatusBadge status={sku.status} />
                    </div>
                </div>

                {/* 规格标签 */}
                <div style={{ marginBottom: 16 }}>
                    <div
                        style={{
                            fontFamily: bodyFont,
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase" as const,
                            color: C.textMuted,
                            marginBottom: 8,
                        }}
                    >
                        规格信息
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                        {[sku.spec, sku.category].map((tag) => (
                            <span
                                key={tag}
                                style={{
                                    padding: "3px 8px",
                                    background: "#F3F4F6",
                                    borderRadius: 4,
                                    fontSize: 12,
                                    color: C.textSecondary,
                                    fontFamily: bodyFont,
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 库存概览 */}
                <div
                    style={{
                        background: C.charcoal,
                        borderRadius: 8,
                        padding: "14px 16px",
                        marginBottom: 16,
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
                        当前库存
                    </div>
                    <div
                        style={{
                            fontFamily: displayFont,
                            fontSize: 40,
                            fontWeight: 700,
                            color: C.white,
                            lineHeight: 1,
                        }}
                    >
                        {sku.stock}
                    </div>
                    <div style={{ fontFamily: bodyFont, fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                        最低库存 {sku.minStock}
                        {sku.stock < sku.minStock && (
                            <span style={{ color: "#F87171", marginLeft: 8 }}>⚠ 低于预警</span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <Link
                            href="/purchasing/grn/new"
                            style={{
                                flex: 1,
                                padding: "7px 0",
                                background: C.terracotta,
                                color: C.white,
                                border: "none",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                textDecoration: "none",
                                textAlign: "center" as const,
                                fontFamily: bodyFont,
                            }}
                        >
                            入库
                        </Link>
                        <Link
                            href="/sales/out/new"
                            style={{
                                flex: 1,
                                padding: "7px 0",
                                background: "transparent",
                                color: C.white,
                                border: "1px solid rgba(255,255,255,0.3)",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                textDecoration: "none",
                                textAlign: "center" as const,
                                fontFamily: bodyFont,
                            }}
                        >
                            出库
                        </Link>
                    </div>
                </div>

                {/* 快捷操作 */}
                <div style={{ display: "flex", gap: 8 }}>
                    <Link
                        href={`/skus/${sku.id}`}
                        style={{
                            flex: 1,
                            padding: "8px",
                            background: "#F5F3EF",
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            textDecoration: "none",
                            color: C.charcoal,
                            textAlign: "center" as const,
                            fontFamily: bodyFont,
                        }}
                    >
                        查看详情
                    </Link>
                    <button
                        style={{
                            flex: 1,
                            padding: "8px",
                            background: "#F5F3EF",
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            color: C.charcoal,
                            fontFamily: bodyFont,
                        }}
                    >
                        编辑
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SkuListPage() {
    const [selected, setSelected] = useState<Sku | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | SkuStatus>("all");

    const filtered = MOCK_SKUS.filter((s) => {
        const matchSearch =
            search === "" ||
            s.code.toLowerCase().includes(search.toLowerCase()) ||
            s.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                background: "#F5F3EF",
            }}
        >
            {/* ── 页面头部 ── */}
            <div
                style={{
                    padding: "24px 32px 0",
                    background: "#F5F3EF",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 20,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontFamily: displayFont,
                                fontSize: 24,
                                fontWeight: 700,
                                color: C.charcoal,
                                margin: 0,
                            }}
                        >
                            SKU 管理
                        </h1>
                        <p
                            style={{
                                fontFamily: bodyFont,
                                fontSize: 12,
                                color: C.textMuted,
                                margin: "4px 0 0",
                            }}
                        >
                            SKU 档案 · 库存管理工作台
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            style={{
                                padding: "8px 14px",
                                background: C.white,
                                border: `1px solid ${C.border}`,
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: "pointer",
                                color: C.charcoal,
                                fontFamily: bodyFont,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            导入
                        </button>
                        <button
                            style={{
                                padding: "8px 14px",
                                background: C.white,
                                border: `1px solid ${C.border}`,
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: "pointer",
                                color: C.charcoal,
                                fontFamily: bodyFont,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            导出
                        </button>
                        <Link
                            href="/skus/new"
                            style={{
                                padding: "8px 16px",
                                background: C.terracotta,
                                border: `1px solid ${C.terracotta}`,
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                color: C.white,
                                fontFamily: bodyFont,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                textDecoration: "none",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            新建 SKU
                        </Link>
                    </div>
                </div>

                {/* 筛选工具栏 */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        paddingBottom: 16,
                        borderBottom: `1px solid ${C.border}`,
                    }}
                >
                    <div style={{ position: "relative" as const, flex: 1, maxWidth: 360 }}>
                        <div style={{ position: "absolute" as const, left: 10, top: "50%", transform: "translateY(-50%)" }}>
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="搜索 SKU 编码、品名、分类..."
                            style={{
                                width: "100%",
                                padding: "8px 12px 8px 34px",
                                border: `1px solid ${C.border}`,
                                borderRadius: 6,
                                background: C.white,
                                fontFamily: bodyFont,
                                fontSize: 13,
                                color: C.charcoal,
                                outline: "none",
                            }}
                        />
                    </div>
                    {(["all", "active", "inactive"] as const).map((s) => {
                        const labels = { all: "全部", active: "活跃", inactive: "停用" };
                        const isActive = statusFilter === s;
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                style={{
                                    padding: "7px 14px",
                                    background: isActive ? C.terracotta : C.white,
                                    border: `1px solid ${isActive ? C.terracotta : C.border}`,
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? C.white : C.textSecondary,
                                    cursor: "pointer",
                                    fontFamily: bodyFont,
                                    transition: "all 0.15s",
                                }}
                            >
                                {labels[s]}
                            </button>
                        );
                    })}
                    <div
                        style={{
                            marginLeft: "auto",
                            fontFamily: bodyFont,
                            fontSize: 12,
                            color: C.textMuted,
                        }}
                    >
                        共 {filtered.length} 条
                    </div>
                </div>
            </div>

            {/* ── 表格区域 ── */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <div style={{ flex: 1, overflow: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse" as const,
                        }}
                    >
                        <thead>
                            <tr style={{ background: "#F9F7F4" }}>
                                {["SKU 编码", "品名 / 规格", "分类", "当前库存", "最低库存", "状态", "操作"].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: "10px 16px",
                                                textAlign: "left" as const,
                                                fontFamily: bodyFont,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                letterSpacing: "1px",
                                                textTransform: "uppercase" as const,
                                                color: C.textMuted,
                                                borderBottom: `1px solid ${C.border}`,
                                                whiteSpace: "nowrap" as const,
                                            }}
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((sku) => {
                                const isSelected = selected?.id === sku.id;
                                const isLow = sku.stock < sku.minStock;
                                return (
                                    <tr
                                        key={sku.id}
                                        onClick={() => setSelected(isSelected ? null : sku)}
                                        style={{
                                            background: isSelected ? "#FEF0EC" : C.white,
                                            borderBottom: `1px solid ${C.border}`,
                                            cursor: "pointer",
                                            transition: "background 0.12s",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected)
                                                (e.currentTarget as HTMLTableRowElement).style.background = "#F9F7F4";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected)
                                                (e.currentTarget as HTMLTableRowElement).style.background = C.white;
                                        }}
                                    >
                                        <td style={{ padding: "12px 16px" }}>
                                            <span
                                                style={{
                                                    fontFamily: displayFont,
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: isLow ? C.terracotta : C.charcoal,
                                                }}
                                            >
                                                {sku.code}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", maxWidth: 280 }}>
                                            <div
                                                style={{
                                                    fontFamily: bodyFont,
                                                    fontSize: 13,
                                                    color: C.charcoal,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap" as const,
                                                }}
                                            >
                                                {sku.name}
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span
                                                style={{
                                                    padding: "2px 8px",
                                                    background: "#F3F4F6",
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    color: C.textSecondary,
                                                    fontFamily: bodyFont,
                                                }}
                                            >
                                                {sku.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span
                                                style={{
                                                    fontFamily: displayFont,
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: isLow ? C.terracotta : C.charcoal,
                                                }}
                                            >
                                                {sku.stock}
                                            </span>
                                            {isLow && (
                                                <span
                                                    style={{
                                                        marginLeft: 6,
                                                        fontSize: 11,
                                                        color: C.terracotta,
                                                        fontFamily: bodyFont,
                                                    }}
                                                >
                                                    ⚠ 低库存
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span
                                                style={{
                                                    fontFamily: bodyFont,
                                                    fontSize: 13,
                                                    color: C.textSecondary,
                                                }}
                                            >
                                                {sku.minStock}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <StatusBadge status={sku.status} />
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <a
                                                    href={`/skus/${sku.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        fontFamily: bodyFont,
                                                        fontSize: 12,
                                                        color: C.terracotta,
                                                        textDecoration: "none",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    查看
                                                </a>
                                                <span style={{ color: C.border }}>|</span>
                                                <button
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        fontFamily: bodyFont,
                                                        fontSize: 12,
                                                        color: C.textSecondary,
                                                        cursor: "pointer",
                                                        padding: 0,
                                                    }}
                                                >
                                                    编辑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* 分页器 */}
                    <div
                        style={{
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderTop: `1px solid ${C.border}`,
                            background: C.white,
                        }}
                    >
                        <span style={{ fontFamily: bodyFont, fontSize: 12, color: C.textMuted }}>
                            第 1 页，共 1 页
                        </span>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[1].map((p) => (
                                <button
                                    key={p}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        border: `1px solid ${C.terracotta}`,
                                        borderRadius: 4,
                                        background: C.terracotta,
                                        color: C.white,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        fontFamily: bodyFont,
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 右侧抽屉 */}
                {selected && <Drawer sku={selected} onClose={() => setSelected(null)} />}
            </div>
        </div>
    );
}
