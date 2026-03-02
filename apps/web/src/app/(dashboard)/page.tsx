"use client";



/* ── 内联风格常量（Nordic Brutalist Light） ── */
const C = {
    charcoal: "#1a1a1a",
    cream: "#F5F3EF",
    creamDark: "#EDE9E2",
    terracotta: "#C05A3C",
    success: "#2E7D32",
    error: "#D94F4F",
    info: "#5C7C8A",
    border: "#E0DDD6",
    textSecondary: "#6B6860",
    textMuted: "#9B9690",
    white: "#FFFFFF",
};

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'Inter', sans-serif";

/* ── Sub Components ── */
function KpiCard({
    label,
    value,
    sub,
    barColor,
}: {
    label: string;
    value: string | number;
    sub: string;
    barColor: string;
}) {
    return (
        <div
            style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${barColor}`,
                borderRadius: 8,
                padding: "18px 20px",
                flex: 1,
                minWidth: 0,
            }}
        >
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
                {label}
            </div>
            <div
                style={{
                    fontFamily: displayFont,
                    fontSize: 36,
                    fontWeight: 700,
                    color: C.charcoal,
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontFamily: bodyFont,
                    fontSize: 12,
                    color: C.textMuted,
                    marginTop: 6,
                }}
            >
                {sub}
            </div>
        </div>
    );
}

function TodoItem({
    title,
    desc,
    tag,
    tagColor,
    tagBg,
}: {
    title: string;
    desc: string;
    tag: string;
    tagColor: string;
    tagBg: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: `1px solid ${C.border}`,
                cursor: "pointer",
                transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = "#F9F7F4")
            }
            onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background = "transparent")
            }
        >
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontFamily: bodyFont,
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: C.charcoal,
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        fontFamily: bodyFont,
                        fontSize: 12,
                        color: C.textMuted,
                        marginTop: 2,
                    }}
                >
                    {desc}
                </div>
            </div>
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: tagBg,
                    color: tagColor,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase" as const,
                    marginRight: 8,
                }}
            >
                {tag}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </div>
    );
}

function TimelineItem({
    action,
    time,
    type,
}: {
    action: string;
    time: string;
    type: "grn" | "out" | "sku";
}) {
    const colorMap = {
        grn: C.success,
        out: C.terracotta,
        sku: C.info,
    };
    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 0",
                borderBottom: `1px solid ${C.border}`,
            }}
        >
            <div
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: colorMap[type],
                    flexShrink: 0,
                    marginTop: 5,
                }}
            />
            <div style={{ flex: 1 }}>
                <div style={{ fontFamily: bodyFont, fontSize: 13, color: C.charcoal }}>
                    {action}
                </div>
                <div style={{ fontFamily: bodyFont, fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                    {time}
                </div>
            </div>
        </div>
    );
}

export default function DashboardHomePage() {
    return (
        <div
            style={{
                padding: "32px 36px",
                minHeight: "100vh",
                background: "#F5F3EF",
                animation: "fadeIn 0.2s ease-out",
            }}
        >
            {/* ── 页面标题 ── */}
            <div style={{ marginBottom: 28 }}>
                <h1
                    style={{
                        fontFamily: displayFont,
                        fontSize: 26,
                        fontWeight: 700,
                        color: C.charcoal,
                        margin: 0,
                    }}
                >
                    工作台
                </h1>
                <p
                    style={{
                        fontFamily: bodyFont,
                        fontSize: 13,
                        color: C.textMuted,
                        margin: "4px 0 0",
                    }}
                >
                    2026年3月2日，星期一，下午
                </p>
            </div>

            {/* ── 全局搜索 ── */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ position: "relative" as const, maxWidth: 480 }}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={C.textMuted}
                        strokeWidth="2"
                        style={{ position: "absolute" as const, left: 12, top: "50%", transform: "translateY(-50%)" }}
                    >
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="搜索 SKU / 单号 / 供应商..."
                        style={{
                            width: "100%",
                            padding: "10px 16px 10px 38px",
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            background: C.white,
                            fontFamily: bodyFont,
                            fontSize: 14,
                            color: C.charcoal,
                            outline: "none",
                            transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = C.terracotta)}
                        onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = C.border)}
                    />
                </div>
            </div>

            {/* ── KPI 卡片行 ── */}
            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                <KpiCard
                    label="低库存 SKU"
                    value={14}
                    sub="需要补货"
                    barColor={C.terracotta}
                />
                <KpiCard
                    label="待入库 GRN"
                    value={3}
                    sub="等待过账确认"
                    barColor={C.success}
                />
                <KpiCard
                    label="待出库 OUT"
                    value={7}
                    sub="等待配货出库"
                    barColor="#5C7C8A"
                />
                <KpiCard
                    label="延迟 PO"
                    value={2}
                    sub="超预计到货日期"
                    barColor={C.error}
                />
            </div>

            {/* ── 下方双栏 ── */}
            <div style={{ display: "flex", gap: 20 }}>
                {/* 左：待办 + 时间线 */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* 全局待办 */}
                    <div
                        style={{
                            background: C.white,
                            borderRadius: 8,
                            border: `1px solid ${C.border}`,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                padding: "14px 16px",
                                borderBottom: `1px solid ${C.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: displayFont,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: C.charcoal,
                                }}
                            >
                                全局待办
                            </span>
                            <button
                                style={{
                                    padding: "4px 10px",
                                    background: "#FEF3C7",
                                    color: "#92400E",
                                    border: "none",
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                查看全部
                            </button>
                        </div>
                        <TodoItem
                            title="14 个 SKU 低库存预警"
                            desc="低于最低库存量 · 建议立即补货 · 点击跳转采购列表"
                            tag="低库存"
                            tagColor={C.terracotta}
                            tagBg="#FEF0EC"
                        />
                        <TodoItem
                            title="3 个待入库 GRN 等待过账"
                            desc="GRN-2026 · 点击进入 GRN 工作台"
                            tag="待过账"
                            tagColor="#92400E"
                            tagBg="#FEF3C7"
                        />
                        <TodoItem
                            title="7 个待出库订单等待处理发货"
                            desc="包含 2 个缺货订单 · 需确认拆分发货 · 点击进入出库工作台"
                            tag="待出库"
                            tagColor="#1E40AF"
                            tagBg="#DBEAFE"
                        />
                    </div>

                    {/* 最近动作时间线 */}
                    <div
                        style={{
                            background: C.white,
                            borderRadius: 8,
                            border: `1px solid ${C.border}`,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                padding: "14px 16px",
                                borderBottom: `1px solid ${C.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: displayFont,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: C.charcoal,
                                }}
                            >
                                最近动作
                            </span>
                            <span
                                style={{
                                    fontFamily: bodyFont,
                                    fontSize: 11,
                                    color: C.terracotta,
                                    cursor: "pointer",
                                }}
                            >
                                查看所有
                            </span>
                        </div>
                        <div style={{ padding: "4px 16px 12px" }}>
                            <TimelineItem
                                action="入库 GRN-2026-0212-0198"
                                time="10分钟前 · admin"
                                type="grn"
                            />
                            <TimelineItem
                                action="出库 OUT-CU72-2026-0546 处理"
                                time="2小时前 · admin"
                                type="out"
                            />
                            <TimelineItem
                                action="新增 SKU: CAB-HDMI-2M"
                                time="昨天 15:20"
                                type="sku"
                            />
                            <TimelineItem
                                action="出库 ST-VGA-VGA 发货"
                                time="昨天 11:04"
                                type="out"
                            />
                        </div>
                    </div>
                </div>

                {/* 右：快捷入口 */}
                <div style={{ width: 240, flexShrink: 0 }}>
                    <div
                        style={{
                            background: C.charcoal,
                            borderRadius: 8,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                padding: "14px 16px",
                                borderBottom: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: displayFont,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: C.white,
                                }}
                            >
                                快捷入口
                            </span>
                        </div>
                        {[
                            { label: "新建 SKU", primary: true, href: "/skus/new" },
                            { label: "录入入库 (GRN)", primary: false, href: "/purchasing/grn/new" },
                            { label: "发起出库 (OUT)", primary: false, href: "/sales/out/new" },
                            { label: "库存查询", primary: false, href: "/inventory" },
                        ].map((btn) => (
                            <a
                                key={btn.label}
                                href={btn.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "11px 16px",
                                    margin: "4px 12px",
                                    borderRadius: 6,
                                    background: btn.primary ? C.terracotta : "rgba(255,255,255,0.06)",
                                    color: C.white,
                                    textDecoration: "none",
                                    fontFamily: bodyFont,
                                    fontSize: 13.5,
                                    fontWeight: btn.primary ? 600 : 400,
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    if (!btn.primary)
                                        (e.currentTarget as HTMLAnchorElement).style.background =
                                            "rgba(255,255,255,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    if (!btn.primary)
                                        (e.currentTarget as HTMLAnchorElement).style.background =
                                            "rgba(255,255,255,0.06)";
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                {btn.label}
                            </a>
                        ))}
                        <div style={{ height: 12 }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
