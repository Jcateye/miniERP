import Sidebar from "@/components/layout/sidebar";
import DashboardSecondaryNav from "@/components/layout/dashboard-secondary-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="flex h-screen overflow-hidden bg-[#F5F3EF]"
        >
            <Sidebar />
            <DashboardSecondaryNav />
            <main className="flex-1 min-w-0 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
