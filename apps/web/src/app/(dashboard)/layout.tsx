import Sidebar from "@/components/layout/sidebar";

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
