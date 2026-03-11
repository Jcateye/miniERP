import Sidebar from "@/components/layout/sidebar";
import DashboardSecondaryNav from "@/components/layout/dashboard-secondary-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#F5F3EF",
            }}
        >
            <Sidebar />
            <DashboardSecondaryNav />
            <main
                style={{
                    flex: 1,
                    minWidth: 0,
                    overflowY: "auto",
                }}
            >
                {children}
            </main>
        </div>
    );
}
