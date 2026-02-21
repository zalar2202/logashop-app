"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Skeleton } from "@/components/common/Skeleton";
import {
    Users,
    ShoppingCart,
    Package,
    CreditCard,
    TrendingUp,
    Activity,
    Ticket,
    MessageSquare,
    Bell,
    DollarSign,
    Star,
    Tag,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        if (!user) return;

        const isAdmin = ["admin", "manager"].includes(user.role);

        const fetchStats = async () => {
            try {
                setLoading(true);
                if (isAdmin) {
                    const { data } = await axios.get("/api/stats/admin");
                    if (data.success) {
                        setDashboardData(data.data);
                    }
                } else {
                    // Fetch user specific stats if needed
                    // For now keeping it simple for user
                }
            } catch (e) {
                console.error("Stats fetch error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    const isAdmin = ["admin", "manager"].includes(user?.role);

    if (loading) {
        return (
            <ContentWrapper>
                <div className="space-y-6">
                    <Skeleton variant="rectangle" height="h-10" width="w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} variant="rectangle" height="h-32" />
                        ))}
                    </div>
                </div>
            </ContentWrapper>
        );
    }

    const { counts, recentOrders = [], topProducts = [] } = dashboardData || {};

    const adminStats = [
        {
            title: "Total Revenue",
            value: `$${((counts?.revenue || 0) / 100).toLocaleString()}`,
            icon: DollarSign,
            color: "green",
            gradient: "from-emerald-500 to-teal-500",
            link: "/panel/admin/orders",
        },
        {
            title: "Total Orders",
            value: counts?.orders || 0,
            icon: ShoppingCart,
            color: "blue",
            gradient: "from-blue-500 to-indigo-500",
            link: "/panel/admin/orders",
        },
        {
            title: "Active Products",
            value: counts?.products || 0,
            icon: Package,
            color: "purple",
            gradient: "from-purple-500 to-pink-500",
            link: "/panel/admin/products",
        },
        {
            title: "Customers",
            value: counts?.users || 0,
            icon: Users,
            color: "orange",
            gradient: "from-orange-500 to-amber-500",
            link: "/panel/admin/users",
        },
    ];

    const quickActions = [
        {
            title: "Add Product",
            icon: Package,
            href: "/panel/admin/products/create",
            color: "bg-blue-50 text-blue-600",
            roles: ["admin", "manager"],
        },
        {
            title: "Create Coupon",
            icon: Tag,
            href: "/panel/admin/coupons/create",
            color: "bg-purple-50 text-purple-600",
            roles: ["admin"],
        },
        {
            title: "Manage Reviews",
            icon: MessageSquare,
            href: "/panel/admin/reviews",
            color: "bg-orange-50 text-orange-600",
            roles: ["admin"],
        },
        {
            title: "View Store",
            icon: Activity,
            href: "/",
            color: "bg-green-50 text-green-600",
            roles: ["admin", "manager", "user"],
        },
    ];

    return (
        <ContentWrapper>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {isAdmin ? "Admin Overview" : "My Dashboard"}
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {isAdmin
                        ? "Real-time performance and store metrics."
                        : `Welcome back, ${user?.name}!`}
                </p>
            </div>

            {isAdmin && (
                <>
                    {/* Admin Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {adminStats.map((stat, i) => (
                            <Link key={i} href={stat.link}>
                                <Card hoverable className="group">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                                                {stat.title}
                                            </p>
                                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                                        </div>
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white transform group-hover:scale-110 transition-transform`}
                                        >
                                            <stat.icon size={24} />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Orders */}
                        <div className="lg:col-span-2">
                            <Card className="h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold">Recent Orders</h2>
                                    <Link
                                        href="/panel/admin/orders"
                                        className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                                <th className="text-left py-3 font-medium">
                                                    Order ID
                                                </th>
                                                <th className="text-left py-3 font-medium">
                                                    Customer
                                                </th>
                                                <th className="text-left py-3 font-medium">
                                                    Status
                                                </th>
                                                <th className="text-right py-3 font-medium">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map((order) => (
                                                <tr
                                                    key={order._id}
                                                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-4 font-medium">
                                                        #
                                                        {order._id
                                                            .substring(order._id.length - 8)
                                                            .toUpperCase()}
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="font-medium">
                                                            {order.userId?.name || "Guest"}
                                                        </div>
                                                        <div className="text-[10px] text-[var(--color-text-secondary)]">
                                                            {order.userId?.email}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <Badge
                                                            variant={
                                                                order.status === "processing"
                                                                    ? "primary"
                                                                    : order.status === "completed"
                                                                      ? "success"
                                                                      : "warning"
                                                            }
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 text-right font-bold text-[var(--color-primary)]">
                                                        ${(order.totalAmount / 100).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {recentOrders.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan="4"
                                                        className="py-8 text-center text-[var(--color-text-secondary)] italic"
                                                    >
                                                        No orders found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>

                        {/* Top Products */}
                        <div>
                            <Card className="h-full">
                                <h2 className="text-lg font-bold mb-6">Top Selling Products</h2>
                                <div className="space-y-4">
                                    {topProducts.map((p, i) => (
                                        <div key={p._id} className="flex items-center gap-4 group">
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate group-hover:text-[var(--color-primary)] transition-colors">
                                                    {p.name}
                                                </div>
                                                <div className="text-[10px] text-[var(--color-text-secondary)]">
                                                    {p.totalSold} units sold
                                                </div>
                                            </div>
                                            <div className="font-bold text-sm text-[var(--color-text-primary)]">
                                                ${(p.basePrice / 100).toFixed(0)}
                                            </div>
                                        </div>
                                    ))}
                                    {topProducts.length === 0 && (
                                        <p className="text-sm text-[var(--color-text-secondary)] text-center py-8 italic">
                                            No products yet.
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            )}

            {!isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions
                        .filter((a) => a.roles.includes("user"))
                        .map((action, i) => (
                            <Link key={i} href={action.href}>
                                <Card hoverable className="h-full text-center py-8">
                                    <div
                                        className={`w-14 h-14 rounded-full ${action.color} flex items-center justify-center mx-auto mb-4`}
                                    >
                                        <action.icon size={28} />
                                    </div>
                                    <h3 className="font-bold">{action.title}</h3>
                                </Card>
                            </Link>
                        ))}
                </div>
            )}
        </ContentWrapper>
    );
}
