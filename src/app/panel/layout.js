import "@/styles/panel.css";
import { MainLayout } from "@/components/layout/MainLayout";

/**
 * Dashboard Layout
 * Wraps all dashboard pages with MainLayout (Sidebar + Header + BottomNav)
 */
export default function DashboardLayout({ children }) {
    return <MainLayout>{children}</MainLayout>;
}
