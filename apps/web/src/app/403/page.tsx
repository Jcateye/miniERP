"use client";

import Link from "next/link";


const C = {
    charcoal: "#1a1a1a",
    terracotta: "#C05A3C",
    cream: "#F5F3EF",
    textMuted: "#9B9690",
    border: "#E0DDD6",
    white: "#FFFFFF",
};

export default function NotAuthorizedPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: C.cream,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column" as const,
                fontFamily: "'Inter', sans-serif",
                animation: "fadeIn 0.2s ease-out",
            }}
        >
            <div style={{ textAlign: "center" as const, maxWidth: 420 }}>
                {/* 盾牌图标 */}
                <div
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "#FEE2E2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                    }}
                >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B54A4A" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                </div>

                <div
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 72,
                        fontWeight: 700,
                        color: C.charcoal,
                        lineHeight: 1,
                        marginBottom: 12,
                    }}
                >
                    403
                </div>
                <h1
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 22,
                        fontWeight: 600,
                        color: C.charcoal,
                        margin: "0 0 12px",
                    }}
                >
                    无权限访问
                </h1>
                <p
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        color: C.textMuted,
                        lineHeight: 1.6,
                        margin: "0 0 28px",
                    }}
                >
                    您没有权限访问此页面。请联系管理员获取相应的访问权限，或返回首页。
                </p>
                <Link
                    href="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 24px",
                        background: C.terracotta,
                        border: "none",
                        borderRadius: 6,
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.white,
                        cursor: "pointer",
                        textDecoration: "none",
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.background = "#A84C31")
                    }
                    onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.background = C.terracotta)
                    }
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    返回首页
                </Link>
            </div>
        </div>
    );
}
