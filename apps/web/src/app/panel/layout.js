import "@/styles/panel.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { PanelGuard } from "@/components/layout/PanelGuard";

/**
 * Dashboard Layout
 * Wraps all dashboard pages with MainLayout (Sidebar + Header + BottomNav).
 * PanelGuard redirects unauthenticated users to login.
 */
export default function DashboardLayout({ children }) {
    return (
        <PanelGuard>
            <MainLayout>{children}</MainLayout>
        </PanelGuard>
    );
}
