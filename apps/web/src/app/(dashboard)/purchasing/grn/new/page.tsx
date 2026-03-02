"use client";

import { useState } from "react";

const C = {
    charcoal: "#1a1a1a",
    cream: "#F5F3EF",
    terracotta: "#C05A3C",
    success: "#2E7D32",
    successBg: "#E8F5E9",
    border: "#E0DDD6",
    textMuted: "#9B9690",
    textSecondary: "#6B6860",
    white: "#FFFFFF",
};

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'Inter', sans-serif";

type StepStatus = "completed" | "active" | "pending";

interface Step {
    id: number;
    label: string;
    sublabel: string;
    status: StepStatus;
}

const INITIAL_STEPS: Step[] = [
    { id: 1, label: "基础信息", sublabel: "仓库、PO、日期", status: "active" },
    { id: 2, label: "录入明细", sublabel: "明细、数量、差异", status: "pending" },
    { id: 3, label: "差异校验", sublabel: "差异确认", status: "pending" },
    { id: 4, label: "过账确认", sublabel: "最终确认", status: "pending" },
];

const PO_DETAIL = {
    no: "PO-V279-0408",
    supplier: "SAMPLE供应商",
    date: "2026-01-08",
    qty: "5 件",
    items: [
        { sku: "CDS-HDMI-5M", name: "HDMI 5米线", qty: -205 },
        { sku: "VM-LAN-GATE-5M", name: "5m LAN 线", qty: +480 },
        { sku: "ADP-USB5-VGA", name: "USB5→VGA 适配", qty: +82 },
    ],
};

function StepIndicator({ steps }: { steps: Step[] }) {
    return (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
            {steps.map((step, idx) => (
                <div key={step.id} style={{ display: "flex", alignItems: "center", flex: idx < steps.length - 1 ? 1 : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", minWidth: 120 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background:
                                    step.status === "completed"
                                        ? C.success
                                        : step.status === "active"
                                            ? C.terracotta
                                            : "#E0DDD6",
                                color:
                                    step.status === "pending" ? C.textMuted : C.white,
                                fontFamily: displayFont,
                                fontWeight: 700,
                                fontSize: 14,
                                transition: "all 0.2s",
                            }}
                        >
                            {step.status === "completed" ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : (
                                step.id
                            )}
                        </div>
                        <div
                            style={{
                                marginTop: 6,
                                fontFamily: bodyFont,
                                fontSize: 12,
                                fontWeight: step.status === "active" ? 600 : 400,
                                color:
                                    step.status === "active"
                                        ? C.charcoal
                                        : step.status === "completed"
                                            ? C.success
                                            : C.textMuted,
                                textAlign: "center" as const,
                            }}
                        >
                            {step.label}
                        </div>
                        <div
                            style={{
                                fontFamily: bodyFont,
                                fontSize: 11,
                                color: C.textMuted,
                                textAlign: "center" as const,
                            }}
                        >
                            {step.sublabel}
                        </div>
                    </div>
                    {idx < steps.length - 1 && (
                        <div
                            style={{
                                flex: 1,
                                height: 1,
                                background:
                                    step.status === "completed" ? C.success : C.border,
                                margin: "0 4px",
                                marginTop: -24,
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

function FormField({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div style={{ marginBottom: 18 }}>
            <label
                style={{
                    display: "block",
                    fontFamily: bodyFont,
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.charcoal,
                    marginBottom: 6,
                    letterSpacing: "0.3px",
                }}
            >
                {label}
                {required && (
                    <span style={{ color: C.terracotta, marginLeft: 3 }}>*</span>
                )}
            </label>
            {children}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    background: C.white,
    fontFamily: bodyFont,
    fontSize: 13.5,
    color: C.charcoal,
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
};

export default function GrnNewPage() {
    const [steps, setSteps] = useState(INITIAL_STEPS);
    const currentStep = steps.find((s) => s.status === "active")?.id ?? 1;

    const handleNext = () => {
        setSteps((prev) =>
            prev.map((s) => {
                if (s.id === currentStep) return { ...s, status: "completed" };
                if (s.id === currentStep + 1) return { ...s, status: "active" };
                return s;
            })
        );
    };

    const handlePrev = () => {
        setSteps((prev) =>
            prev.map((s) => {
                if (s.id === currentStep) return { ...s, status: "pending" };
                if (s.id === currentStep - 1) return { ...s, status: "active" };
                return s;
            })
        );
    };

    return (
        <div
            style={{
                padding: "32px 36px",
                minHeight: "100vh",
                background: "#F5F3EF",
            }}
        >
            {/* 页面标题 */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <a
                        href="/purchasing/grn"
                        style={{
                            fontFamily: bodyFont,
                            fontSize: 12,
                            color: C.textMuted,
                            textDecoration: "none",
                        }}
                    >
                        采购管理
                    </a>
                    <span style={{ color: C.border }}>/</span>
                    <a
                        href="/purchasing/grn"
                        style={{ fontFamily: bodyFont, fontSize: 12, color: C.textMuted, textDecoration: "none" }}
                    >
                        GRN 入库单
                    </a>
                    <span style={{ color: C.border }}>/</span>
                    <span style={{ fontFamily: bodyFont, fontSize: 12, color: C.charcoal }}>新建</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1
                        style={{
                            fontFamily: displayFont,
                            fontSize: 24,
                            fontWeight: 700,
                            color: C.charcoal,
                            margin: 0,
                        }}
                    >
                        新建入库单 (GRN)
                    </h1>
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
                            保存草稿
                        </button>
                        <button
                            style={{
                                padding: "8px 16px",
                                background: "#FEE2E2",
                                border: `1px solid #FECACA`,
                                borderRadius: 6,
                                fontFamily: bodyFont,
                                fontSize: 13,
                                color: "#B54A4A",
                                cursor: "pointer",
                            }}
                        >
                            取消
                        </button>
                    </div>
                </div>
            </div>

            {/* 步骤导航 */}
            <StepIndicator steps={steps} />

            {/* 主体 */}
            <div style={{ display: "flex", gap: 20 }}>
                {/* 步骤表单 */}
                <div
                    style={{
                        flex: 1,
                        background: C.white,
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                        padding: "24px",
                    }}
                >
                    {currentStep === 1 && (
                        <div>
                            <h2
                                style={{
                                    fontFamily: displayFont,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: C.charcoal,
                                    margin: "0 0 20px",
                                    paddingBottom: 12,
                                    borderBottom: `1px solid ${C.border}`,
                                }}
                            >
                                STEP 1 — 基础信息
                            </h2>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                                <FormField label="入库仓库" required>
                                    <select style={{ ...inputStyle }}>
                                        <option>选择仓库...</option>
                                        <option>上海主仓</option>
                                        <option>北京备货仓</option>
                                    </select>
                                </FormField>
                                <FormField label="关联 PO 号（可选）">
                                    <input
                                        type="text"
                                        placeholder="PO-V279-0408"
                                        style={inputStyle}
                                        onFocus={(e) => (e.target.style.borderColor = C.terracotta)}
                                        onBlur={(e) => (e.target.style.borderColor = C.border)}
                                    />
                                </FormField>
                                <FormField label="入库时间" required>
                                    <input
                                        type="date"
                                        defaultValue="2026-01-04"
                                        style={inputStyle}
                                        onFocus={(e) => (e.target.style.borderColor = C.terracotta)}
                                        onBlur={(e) => (e.target.style.borderColor = C.border)}
                                    />
                                </FormField>
                                <FormField label="备注">
                                    <input
                                        type="text"
                                        placeholder="请输入备注..."
                                        style={inputStyle}
                                        onFocus={(e) => (e.target.style.borderColor = C.terracotta)}
                                        onBlur={(e) => (e.target.style.borderColor = C.border)}
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h2
                                style={{
                                    fontFamily: displayFont,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: C.charcoal,
                                    margin: "0 0 20px",
                                    paddingBottom: 12,
                                    borderBottom: `1px solid ${C.border}`,
                                }}
                            >
                                STEP 2 — 录入明细
                            </h2>
                            <p style={{ fontFamily: bodyFont, fontSize: 13, color: C.textMuted, marginTop: 0 }}>
                                请逐行录入本次入库的 SKU 和数量
                            </p>
                            <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                                <thead>
                                    <tr style={{ background: "#F9F7F4" }}>
                                        {["SKU 编码", "SKU 名称", "预期数量", "实收数量"].map((h) => (
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
                                    {PO_DETAIL.items.map((item, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                                            <td style={{ padding: "10px 12px", fontFamily: displayFont, fontSize: 13, fontWeight: 600 }}>
                                                {item.sku}
                                            </td>
                                            <td style={{ padding: "10px 12px", fontFamily: bodyFont, fontSize: 13 }}>
                                                {item.name}
                                            </td>
                                            <td style={{ padding: "10px 12px", fontFamily: bodyFont, fontSize: 13 }}>
                                                {Math.abs(item.qty)}
                                            </td>
                                            <td style={{ padding: "10px 12px" }}>
                                                <input
                                                    type="number"
                                                    defaultValue={Math.abs(item.qty)}
                                                    style={{ ...inputStyle, width: 100, padding: "6px 10px" }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h2
                                style={{
                                    fontFamily: displayFont,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: C.charcoal,
                                    margin: "0 0 20px",
                                    paddingBottom: 12,
                                    borderBottom: `1px solid ${C.border}`,
                                }}
                            >
                                STEP 3 — 差异校验
                            </h2>
                            <div
                                style={{
                                    background: "#FEF3C7",
                                    border: "1px solid #FDE68A",
                                    borderRadius: 6,
                                    padding: "12px 16px",
                                    marginBottom: 16,
                                    fontFamily: bodyFont,
                                    fontSize: 13,
                                    color: "#92400E",
                                }}
                            >
                                ⚠ 检测到 2 项数量差异，请确认后继续
                            </div>
                            <div style={{ fontFamily: bodyFont, fontSize: 13, color: C.textSecondary }}>
                                所有差异已在下方列出，请核对并选择处理方式。
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div>
                            <h2
                                style={{
                                    fontFamily: displayFont,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: C.charcoal,
                                    margin: "0 0 20px",
                                    paddingBottom: 12,
                                    borderBottom: `1px solid ${C.border}`,
                                }}
                            >
                                STEP 4 — 过账确认
                            </h2>
                            <div
                                style={{
                                    background: C.successBg,
                                    border: "1px solid #A5D6A7",
                                    borderRadius: 6,
                                    padding: "12px 16px",
                                    marginBottom: 16,
                                    fontFamily: bodyFont,
                                    fontSize: 13,
                                    color: C.success,
                                }}
                            >
                                ✓ 所有明细已校验完成，点击「确认过账」将正式写入库存流水
                            </div>
                        </div>
                    )}

                    {/* 底部按钮 */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 28,
                            paddingTop: 16,
                            borderTop: `1px solid ${C.border}`,
                        }}
                    >
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 1}
                            style={{
                                padding: "9px 20px",
                                background: C.white,
                                border: `1px solid ${C.border}`,
                                borderRadius: 6,
                                fontFamily: bodyFont,
                                fontSize: 13,
                                color: currentStep === 1 ? C.textMuted : C.charcoal,
                                cursor: currentStep === 1 ? "not-allowed" : "pointer",
                                opacity: currentStep === 1 ? 0.5 : 1,
                            }}
                        >
                            ← 上一步
                        </button>
                        <button
                            onClick={currentStep < 4 ? handleNext : undefined}
                            style={{
                                padding: "9px 24px",
                                background: C.terracotta,
                                border: "none",
                                borderRadius: 6,
                                fontFamily: bodyFont,
                                fontSize: 13,
                                fontWeight: 600,
                                color: C.white,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            {currentStep < 4 ? (
                                <>下一步 / 录入明细 →</>
                            ) : (
                                <>✓ 确认过账</>
                            )}
                        </button>
                    </div>
                </div>

                {/* 右侧 PO 信息卡 */}
                <div
                    style={{
                        width: 260,
                        flexShrink: 0,
                    }}
                >
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
                            <div style={{ fontFamily: displayFont, fontSize: 13, fontWeight: 700, color: C.white }}>
                                关联 PO 信息
                            </div>
                            <div style={{ fontFamily: displayFont, fontSize: 13, fontWeight: 600, color: C.terracotta, marginTop: 4 }}>
                                {PO_DETAIL.no}
                            </div>
                        </div>
                        <div style={{ padding: "12px 16px" }}>
                            {[
                                ["供应商", PO_DETAIL.supplier],
                                ["下单日期", PO_DETAIL.date],
                                ["明细行数", PO_DETAIL.qty],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "6px 0",
                                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: bodyFont,
                                            fontSize: 11,
                                            color: "rgba(255,255,255,0.4)",
                                            textTransform: "uppercase" as const,
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        {label}
                                    </span>
                                    <span
                                        style={{ fontFamily: bodyFont, fontSize: 12, color: C.white }}
                                    >
                                        {value}
                                    </span>
                                </div>
                            ))}

                            <div style={{ marginTop: 12 }}>
                                <div
                                    style={{
                                        fontFamily: bodyFont,
                                        fontSize: 11,
                                        color: "rgba(255,255,255,0.4)",
                                        letterSpacing: "1px",
                                        textTransform: "uppercase" as const,
                                        marginBottom: 8,
                                    }}
                                >
                                    明细预览
                                </div>
                                {PO_DETAIL.items.map((item) => (
                                    <div
                                        key={item.sku}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "5px 0",
                                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                                        }}
                                    >
                                        <span
                                            style={{ fontFamily: displayFont, fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                                        >
                                            {item.sku}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: bodyFont,
                                                fontSize: 12,
                                                color: item.qty > 0 ? "#6EE7B7" : "#F87171",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {item.qty > 0 ? "+" : ""}
                                            {item.qty}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
