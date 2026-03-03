import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 — 页面不存在 | miniERP",
};

export default function NotFoundPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#F5F3EF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column" as const,
                fontFamily: "'Inter', sans-serif",
            }}
        >
            <div style={{ textAlign: "center" as const, maxWidth: 420 }}>
                {/* 问号图标 */}
                <div
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "#EDE9E2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                    }}
                >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9B9690" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>

                <div
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 72,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        lineHeight: 1,
                        marginBottom: 12,
                    }}
                >
                    404
                </div>
                <h1
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        margin: "0 0 12px",
                    }}
                >
                    页面不存在
                </h1>
                <p
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        color: "#9B9690",
                        lineHeight: 1.6,
                        margin: "0 0 28px",
                    }}
                >
                    您访问的页面不存在或已被删除。请检查 URL 是否正确，或返回首页重新导航。
                </p>
                <Link
                    href="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 24px",
                        background: "#C05A3C",
                        border: "none",
                        borderRadius: 6,
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#FFFFFF",
                        cursor: "pointer",
                        textDecoration: "none",
                    }}
                >
                    返回首页
                </Link>
            </div>
        </div>
    );
}
