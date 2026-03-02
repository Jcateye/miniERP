"use client";

// Note: metadata cannot be used in client components
// SEO is handled by the parent layout

const C = {
    charcoal: "#1a1a1a",
    cream: "#F5F3EF",
    terracotta: "#C05A3C",
    border: "#E0DDD6",
    textMuted: "#9B9690",
    textSecondary: "#6B6860",
    white: "#FFFFFF",
};

const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'Inter', sans-serif";

export default function LoginPage() {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                fontFamily: bodyFont,
            }}
        >
            {/* 左侧深色面板 */}
            <div
                style={{
                    width: "42%",
                    background: C.charcoal,
                    display: "flex",
                    flexDirection: "column" as const,
                    justifyContent: "space-between",
                    padding: "48px",
                }}
            >
                {/* Logo */}
                <div>
                    <div
                        style={{
                            fontFamily: displayFont,
                            fontSize: 18,
                            fontWeight: 700,
                            letterSpacing: "3px",
                            textTransform: "uppercase" as const,
                            color: C.white,
                        }}
                    >
                        MINIERP
                    </div>
                </div>

                {/* 中部标语 */}
                <div>
                    <h2
                        style={{
                            fontFamily: displayFont,
                            fontSize: 36,
                            fontWeight: 700,
                            color: C.white,
                            lineHeight: 1.25,
                            margin: "0 0 16px",
                        }}
                    >
                        简单・高效・可追溯
                    </h2>
                    <p
                        style={{
                            fontFamily: bodyFont,
                            fontSize: 15,
                            color: "rgba(255,255,255,0.5)",
                            lineHeight: 1.6,
                            margin: 0,
                        }}
                    >
                        面向中小企业的轻量级 ERP 系统。<br />
                        库存、采购、销售，一站式管理。
                    </p>

                    {/* 特性点 */}
                    <div style={{ marginTop: 32, display: "flex", flexDirection: "column" as const, gap: 12 }}>
                        {[
                            "多租户隔离，数据安全",
                            "库存流水驱动，可审计",
                            "开放 API，深度集成",
                        ].map((feat) => (
                            <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        background: C.terracotta,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span style={{ fontFamily: bodyFont, fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
                                    {feat}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 底部版权 */}
                <div style={{ fontFamily: bodyFont, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    © 2026 miniERP. All rights reserved.
                </div>
            </div>

            {/* 右侧登录区域 */}
            <div
                style={{
                    flex: 1,
                    background: C.cream,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: 400,
                    }}
                >
                    <div style={{ marginBottom: 36 }}>
                        <h1
                            style={{
                                fontFamily: displayFont,
                                fontSize: 26,
                                fontWeight: 700,
                                color: C.charcoal,
                                margin: "0 0 8px",
                            }}
                        >
                            欢迎回来
                        </h1>
                        <p style={{ fontFamily: bodyFont, fontSize: 14, color: C.textMuted, margin: 0 }}>
                            登录您的 miniERP 账户
                        </p>
                    </div>

                    {/* 登录表单 */}
                    <form>
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
                                邮箱 / 用户名
                            </label>
                            <input
                                type="text"
                                id="login-email"
                                placeholder="admin@company.com"
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 6,
                                    background: C.white,
                                    fontFamily: bodyFont,
                                    fontSize: 14,
                                    color: C.charcoal,
                                    outline: "none",
                                    boxSizing: "border-box" as const,
                                    transition: "border-color 0.15s",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = C.terracotta)}
                                onBlur={(e) => (e.target.style.borderColor = C.border)}
                            />
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontFamily: bodyFont,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: C.charcoal,
                                    marginBottom: 6,
                                }}
                            >
                                密码
                            </label>
                            <input
                                type="password"
                                id="login-password"
                                placeholder="••••••••"
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 6,
                                    background: C.white,
                                    fontFamily: bodyFont,
                                    fontSize: 14,
                                    color: C.charcoal,
                                    outline: "none",
                                    boxSizing: "border-box" as const,
                                    transition: "border-color 0.15s",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = C.terracotta)}
                                onBlur={(e) => (e.target.style.borderColor = C.border)}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 24,
                            }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    cursor: "pointer",
                                    fontFamily: bodyFont,
                                    fontSize: 13,
                                    color: C.textSecondary,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    id="remember-me"
                                    style={{
                                        width: 16,
                                        height: 16,
                                        accentColor: C.terracotta,
                                    }}
                                />
                                记住登录
                            </label>
                            <a
                                href="/auth/forgot-password"
                                style={{
                                    fontFamily: bodyFont,
                                    fontSize: 13,
                                    color: C.terracotta,
                                    textDecoration: "none",
                                }}
                            >
                                忘记密码？
                            </a>
                        </div>

                        <button
                            type="submit"
                            id="login-submit"
                            style={{
                                width: "100%",
                                padding: "12px",
                                background: C.terracotta,
                                border: "none",
                                borderRadius: 6,
                                fontFamily: displayFont,
                                fontSize: 15,
                                fontWeight: 600,
                                color: C.white,
                                cursor: "pointer",
                                transition: "background 0.15s",
                                letterSpacing: "0.5px",
                            }}
                            onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLButtonElement).style.background = "#A84C31")
                            }
                            onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLButtonElement).style.background = C.terracotta)
                            }
                        >
                            登录
                        </button>
                    </form>

                    {/* 错误提示区（隐藏状态） */}
                    <div
                        style={{
                            marginTop: 16,
                            padding: "10px 14px",
                            background: "#FEE2E2",
                            border: "1px solid #FECACA",
                            borderRadius: 6,
                            fontFamily: bodyFont,
                            fontSize: 13,
                            color: "#B54A4A",
                            display: "none",
                        }}
                    >
                        用户名或密码错误，请重试
                    </div>

                    <p
                        style={{
                            marginTop: 24,
                            textAlign: "center" as const,
                            fontFamily: bodyFont,
                            fontSize: 13,
                            color: C.textMuted,
                        }}
                    >
                        还没有账户？{" "}
                        <a
                            href="/register"
                            style={{ color: C.terracotta, textDecoration: "none", fontWeight: 500 }}
                        >
                            立即注册
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
