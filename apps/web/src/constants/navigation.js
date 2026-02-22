import {
    LayoutDashboard,
    Users,
    Blocks,
    Database,
    Send,
    Tag,
    Mail,
    Megaphone,
    FileText,
    CreditCard,
    Ticket,
    Activity,
    ShoppingCart,
    Bot,
    Calculator,
    PenSquare,
    MessageSquare,
    Package,
    List,
    Truck,
    FlaskConical,
} from "lucide-react";

export const navigation = [
    {
        name: "Dashboard",
        href: "/panel/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "My Cart",
        href: "/cart", // Public cart page
        icon: ShoppingCart,
        roles: ["user", "guest"], // Visible to everyone really
    },
    {
        name: "My Orders",
        href: "/panel/orders",
        icon: Package,
        roles: ["user"],
    },
];

// Admin-only navigation items
export const adminNavigation = [
    {
        name: "User Management",
        href: "/panel/admin/users",
        icon: Users,
        roles: ["admin", "manager"],
    },
    // E-Commerce Admin
    {
        name: "Products",
        href: "/panel/admin/products",
        icon: Package,
        roles: ["admin", "manager"],
    },
    {
        name: "Categories",
        href: "/panel/admin/categories",
        icon: List,
        roles: ["admin", "manager"],
    },
    {
        name: "Orders",
        href: "/panel/admin/orders",
        icon: ShoppingCart,
        roles: ["admin", "manager"],
    },
    {
        name: "Shipping Zones",
        href: "/panel/admin/shipping-zones",
        icon: Truck,
        roles: ["admin"],
    },
    {
        name: "Coupons",
        href: "/panel/admin/coupons",
        icon: Ticket,
        roles: ["admin"],
    },
    {
        name: "Reviews",
        href: "/panel/admin/reviews",
        icon: MessageSquare,
        roles: ["admin"],
    },
    {
        name: "Support Tickets",
        href: "/panel/admin/tickets",
        icon: Ticket,
        roles: ["admin", "manager"],
    },
    // Shared modules
    {
        name: "Accounting",
        href: "/panel/admin/accounting",
        icon: Calculator,
        roles: ["admin", "manager"],
    },
    {
        name: "Send Notification",
        href: "/panel/admin/notifications/send",
        icon: Send,
        roles: ["admin", "manager"],
    },
    {
        name: "Email Marketing",
        href: "/panel/admin/marketing",
        icon: Megaphone,
        roles: ["admin", "manager"],
    },
];

// Manager tools index and development/testing pages
export const managerNavItem = {
    name: "Dev & Testing",
    href: "/panel/manager",
    icon: FlaskConical,
};

// Development/Testing pages (under /panel/manager/)
export const devNavigation = [
    { name: "Components Demo", href: "/panel/manager/components-demo", icon: Blocks },
    { name: "DB Tools", href: "/panel/manager/db-tools", icon: Database },
];
