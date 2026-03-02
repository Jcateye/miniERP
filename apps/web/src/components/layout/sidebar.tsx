"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    sub?: NavItem[];
}

const BarChartIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
);
const PackageIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
);
const ShoppingCartIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
);
const TrendingUpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
);
const WarehouseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.43a2 2 0 0 1 1.48 0l8 3.43A2 2 0 0 1 22 8.35Z" /><path d="M6 18h12" /><path d="M6 14h12" /><rect x="8" y="10" width="8" height="14" />
    </svg>
);
const FileTextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);
const PaperclipIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
);
const SettingsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const NAV_ITEMS: NavItem[] = [
    { label: "SKU 管理", href: "/", icon: <BarChartIcon /> },
    { label: "库存管理", href: "/inventory", icon: <WarehouseIcon /> },
    { label: "采购管理", href: "/purchasing", icon: <ShoppingCartIcon /> },
    { label: "销售管理", href: "/sales", icon: <TrendingUpIcon /> },
    { label: "报表中心", href: "/reports", icon: <FileTextIcon /> },
    { label: "附件管理", href: "/attachments", icon: <PaperclipIcon /> },
    { label: "系统设置", href: "/settings", icon: <SettingsIcon /> },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/" || pathname.startsWith("/skus");
        return pathname.startsWith(href);
    };

    return (
        <aside
            style={{
                width: "260px",
                minWidth: "260px",
                background: "#1a1a1a",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                position: "sticky",
                top: 0,
                flexShrink: 0,
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: "20px 20px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <div
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "#FFFFFF",
                    }}
                >
                    MINIERP
                </div>
                <div
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        marginTop: 2,
                        letterSpacing: "0.5px",
                    }}
                >
                    Enterprise Resource Planning
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "9px 20px",
                                margin: "1px 8px",
                                borderRadius: 6,
                                textDecoration: "none",
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 13.5,
                                fontWeight: active ? 600 : 400,
                                color: active ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                                background: active ? "rgba(192,90,60,0.85)" : "transparent",
                                borderLeft: active ? "3px solid #C05A3C" : "3px solid transparent",
                                transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.8)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)";
                                }
                            }}
                        >
                            <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom — User Profile */}
            <div
                style={{
                    padding: "12px 16px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#C05A3C",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#FFFFFF",
                        flexShrink: 0,
                    }}
                >
                    A
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#FFFFFF",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Admin
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.35)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        admin@minierp.com
                    </div>
                </div>
            </div>
        </aside>
    );
}
