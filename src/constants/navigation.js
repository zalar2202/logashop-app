import {
    LayoutDashboard,
    Users,
    Blocks,
    UserPlus,
    Database,
    Network,
    Bell,
    Send,
    Settings,
    Tag,
    Mail,
    Building2,
    FileText,
    CreditCard,
    Ticket,
    Activity,
    ShoppingCart,
    Store,
    Bot,
    Calculator,
    PenSquare,
    Image as ImageIcon,
    MessageSquare,
    Package,
    List,
    Truck,
    Heart,
} from "lucide-react";

export const navigation = [
    {
        name: "Dashboard",
        href: "/panel/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Shop Storefront",
        href: "/",
        icon: Store,
    },
    {
        name: "My Wishlist",
        href: "/wishlist",
        icon: Heart,
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
    {
        name: "Support Tickets",
        href: "/panel/tickets",
        icon: Ticket,
        roles: ["user"],
    },
    {
        name: "Notifications",
        href: "/panel/notifications",
        icon: Bell,
    },
    {
        name: "Settings",
        href: "/panel/settings",
        icon: Settings,
    },
];

// Admin-only navigation items
export const adminNavigation = [
    {
        name: "User Management",
        href: "/panel/users",
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
    // Shared modules
    {
        name: "Accounting",
        href: "/panel/admin/accounting",
        icon: Calculator,
        roles: ["admin", "manager"],
    },
    {
        name: "Send Notification",
        href: "/panel/notifications/send",
        icon: Send,
        roles: ["admin", "manager"],
    },
];

// Development/Testing pages
export const devNavigation = [
    {
        name: "Components Demo",
        href: "/panel/components-demo",
        icon: Blocks,
    },
    {
        name: "Debug Auth",
        href: "/panel/debug-auth",
        icon: Database,
    },
];
