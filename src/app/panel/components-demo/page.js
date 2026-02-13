"use client";

import { useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Loader } from "@/components/common/Loader";
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonForm } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardFooter } from "@/components/common/Card";
import { Badge, StatusBadge } from "@/components/common/Badge";
import { Modal, ConfirmModal } from "@/components/common/Modal";
import { Tabs } from "@/components/common/Tabs";
import { Pagination, SimplePagination } from "@/components/common/Pagination";
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
    TableActions,
} from "@/components/tables";
import { Download, Edit, Trash2, UserPlus, Mail, Settings, PackagePlus, Eye } from "lucide-react";

export default function ComponentsDemoPage() {
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [simplePage, setSimplePage] = useState(1);

    // Tab state
    const [activeTab, setActiveTab] = useState("overview");

    // Table state
    const [sortColumn, setSortColumn] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");

    // Sample table data
    const sampleUsers = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "active" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "active" },
        { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User", status: "pending" },
        {
            id: 4,
            name: "Alice Williams",
            email: "alice@example.com",
            role: "Manager",
            status: "inactive",
        },
        {
            id: 5,
            name: "Charlie Brown",
            email: "charlie@example.com",
            role: "User",
            status: "active",
        },
    ];

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // Simulate confirm action
    const handleConfirm = () => {
        setModalLoading(true);
        setTimeout(() => {
            setModalLoading(false);
            setShowConfirmModal(false);
            alert("Action confirmed!");
        }, 1500);
    };

    return (
        <ContentWrapper>
            <div className="space-y-8">
                {/* Page Header */}
                <div>
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Components Library
                    </h1>
                    <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
                        Complete showcase of all reusable components in the LogaTech Admin Panel
                    </p>
                </div>

                {/* Phase 3.1: Loading & Feedback Components */}
                <section className="space-y-6">
                    <div>
                        <h2
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Phase 3.1: Loading & Feedback
                        </h2>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Loader, Skeleton, and EmptyState components
                        </p>
                    </div>

                    {/* Loader Section */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Loader Component
                        </h3>
                        <div className="space-y-6">
                            {/* Size variants */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Size Variants
                                </h4>
                                <div className="flex items-center gap-8 flex-wrap">
                                    <div className="text-center">
                                        <Loader size="sm" />
                                        <p
                                            className="text-xs mt-2"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Small
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <Loader size="md" />
                                        <p
                                            className="text-xs mt-2"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Medium
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <Loader size="lg" />
                                        <p
                                            className="text-xs mt-2"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Large
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <Loader size="xl" />
                                        <p
                                            className="text-xs mt-2"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Extra Large
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* With text */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    With Text Label
                                </h4>
                                <Loader size="lg" text="Loading data..." />
                            </div>
                        </div>
                    </Card>

                    {/* Skeleton Section */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Skeleton Component
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Basic variants */}
                            <div className="space-y-4">
                                <h4
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Basic Variants
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <p
                                            className="text-xs mb-2"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Text Line
                                        </p>
                                        <Skeleton variant="text" />
                                    </div>
                                    <div>
                                        <p
                                            className="text-xs mb-2"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Multiple Text Lines
                                        </p>
                                        <Skeleton variant="text" count={3} />
                                    </div>
                                    <div>
                                        <p
                                            className="text-xs mb-2"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Rectangle
                                        </p>
                                        <Skeleton variant="rectangle" />
                                    </div>
                                    <div>
                                        <p
                                            className="text-xs mb-2"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Circle (Avatar)
                                        </p>
                                        <Skeleton variant="circle" />
                                    </div>
                                </div>
                            </div>

                            {/* Skeleton Card */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Skeleton Card
                                </h4>
                                <SkeletonCard />
                            </div>

                            {/* Skeleton Form */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Skeleton Form
                                </h4>
                                <SkeletonForm />
                            </div>

                            {/* Skeleton Table */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Skeleton Table
                                </h4>
                                <SkeletonTable rows={3} />
                            </div>
                        </div>
                    </Card>

                    {/* EmptyState Section */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            EmptyState Component
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <EmptyState />
                            <EmptyState variant="search" />
                            <EmptyState variant="error" />
                            <EmptyState
                                variant="empty"
                                action={
                                    <Button variant="primary">
                                        <PackagePlus size={16} />
                                        Create First Item
                                    </Button>
                                }
                            />
                        </div>
                    </Card>
                </section>

                {/* Phase 3.3: UI Components */}
                <section className="space-y-6">
                    <div>
                        <h2
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Phase 3.3: UI Components
                        </h2>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Buttons, Cards, Badges, Modals, Tabs, and Pagination
                        </p>
                    </div>

                    {/* Buttons Section */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Buttons
                        </h3>
                        <div className="space-y-6">
                            {/* Variants */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Variants
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="primary">Primary</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="danger">Danger</Button>
                                    <Button variant="success">Success</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="outline">Outline</Button>
                                </div>
                            </div>

                            {/* Sizes */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Sizes
                                </h4>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button size="sm">Small</Button>
                                    <Button size="md">Medium</Button>
                                    <Button size="lg">Large</Button>
                                </div>
                            </div>

                            {/* With Icons */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    With Icons
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="primary">
                                        <UserPlus size={16} />
                                        Add User
                                    </Button>
                                    <Button variant="secondary">
                                        <Download size={16} />
                                        Download
                                    </Button>
                                    <Button variant="success">
                                        <Mail size={16} />
                                        Send Email
                                    </Button>
                                    <Button variant="danger">
                                        <Trash2 size={16} />
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            {/* States */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    States
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    <Button loading>Loading</Button>
                                    <Button disabled>Disabled</Button>
                                    <Button variant="primary" loading>
                                        Processing
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Cards Section */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Cards
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <h4
                                    className="text-md font-semibold mb-2"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Basic Card
                                </h4>
                                <p style={{ color: "var(--color-text-secondary)" }}>
                                    This is a basic card with default padding.
                                </p>
                            </Card>

                            <Card
                                header={
                                    <CardHeader title="Card with Header" subtitle="With subtitle" />
                                }
                            >
                                <p style={{ color: "var(--color-text-secondary)" }}>
                                    Card with a custom header section.
                                </p>
                            </Card>

                            <Card
                                footer={
                                    <CardFooter>
                                        <Button variant="secondary" size="sm">
                                            Cancel
                                        </Button>
                                        <Button variant="primary" size="sm">
                                            Save
                                        </Button>
                                    </CardFooter>
                                }
                            >
                                <h4
                                    className="text-md font-semibold mb-2"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Card with Footer
                                </h4>
                                <p style={{ color: "var(--color-text-secondary)" }}>
                                    This card has action buttons in the footer.
                                </p>
                            </Card>

                            <Card hoverable>
                                <h4
                                    className="text-md font-semibold mb-2"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Hoverable Card
                                </h4>
                                <p style={{ color: "var(--color-text-secondary)" }}>
                                    Hover over this card to see the shadow effect.
                                </p>
                            </Card>
                        </div>
                    </Card>

                    {/* Badges Section */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Badges
                        </h3>
                        <div className="space-y-6">
                            {/* Variants */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Variants
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    <Badge variant="success">Success</Badge>
                                    <Badge variant="error">Error</Badge>
                                    <Badge variant="warning">Warning</Badge>
                                    <Badge variant="info">Info</Badge>
                                    <Badge variant="neutral">Neutral</Badge>
                                    <Badge variant="primary">Primary</Badge>
                                </div>
                            </div>

                            {/* Sizes */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Sizes
                                </h4>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge size="sm">Small</Badge>
                                    <Badge size="md">Medium</Badge>
                                    <Badge size="lg">Large</Badge>
                                </div>
                            </div>

                            {/* With Dots */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    With Indicator Dots
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    <Badge variant="success" dot>
                                        Active
                                    </Badge>
                                    <Badge variant="error" dot>
                                        Offline
                                    </Badge>
                                    <Badge variant="warning" dot>
                                        Pending
                                    </Badge>
                                    <Badge variant="info" dot>
                                        Processing
                                    </Badge>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Pre-configured Status Badges
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    <StatusBadge status="active" />
                                    <StatusBadge status="inactive" />
                                    <StatusBadge status="pending" />
                                    <StatusBadge status="approved" />
                                    <StatusBadge status="rejected" />
                                    <StatusBadge status="cancelled" />
                                    <StatusBadge status="completed" />
                                    <StatusBadge status="processing" />
                                    <StatusBadge status="draft" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Modals Section */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Modals
                        </h3>
                        <div className="space-y-4">
                            <p style={{ color: "var(--color-text-secondary)" }}>
                                Click the buttons below to see different modal variations
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button onClick={() => setShowModal(true)}>Open Modal</Button>
                                <Button variant="danger" onClick={() => setShowConfirmModal(true)}>
                                    Open Confirm Modal
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Tabs Section */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Tabs (Line Variant)
                        </h3>
                        <Tabs
                            tabs={[
                                {
                                    id: "overview",
                                    label: "Overview",
                                    content: (
                                        <div className="p-4 bg-[var(--color-secondary)] rounded-lg">
                                            <p style={{ color: "var(--color-text-secondary)" }}>
                                                This is the overview tab content with line variant
                                                styling.
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    id: "details",
                                    label: "Details",
                                    icon: <Settings size={16} />,
                                    content: (
                                        <div className="p-4 bg-[var(--color-secondary)] rounded-lg">
                                            <p style={{ color: "var(--color-text-secondary)" }}>
                                                This tab has an icon and shows detailed information.
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    id: "notifications",
                                    label: "Notifications",
                                    badge: "3",
                                    content: (
                                        <div className="p-4 bg-[var(--color-secondary)] rounded-lg">
                                            <p style={{ color: "var(--color-text-secondary)" }}>
                                                This tab has a badge showing 3 new notifications.
                                            </p>
                                        </div>
                                    ),
                                },
                            ]}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                        />
                    </Card>

                    {/* Pagination Section */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Pagination
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Full Pagination
                                </h4>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={20}
                                    totalItems={197}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                />
                            </div>

                            <div>
                                <h4
                                    className="text-sm font-medium mb-3"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Simple Pagination
                                </h4>
                                <SimplePagination
                                    currentPage={simplePage}
                                    totalPages={10}
                                    onPageChange={setSimplePage}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Combined Example */}
                    <Card
                        header={
                            <CardHeader
                                title="Combined Example"
                                subtitle="Components working together"
                                actions={
                                    <Button variant="primary" size="sm">
                                        <UserPlus size={16} />
                                        Add User
                                    </Button>
                                }
                            />
                        }
                    >
                        <div className="space-y-4">
                            {/* Sample User List */}
                            <div className="space-y-3">
                                {[
                                    {
                                        name: "John Doe",
                                        email: "john@example.com",
                                        status: "active",
                                    },
                                    {
                                        name: "Jane Smith",
                                        email: "jane@example.com",
                                        status: "pending",
                                    },
                                    {
                                        name: "Bob Johnson",
                                        email: "bob@example.com",
                                        status: "inactive",
                                    },
                                ].map((user, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-secondary)] transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p
                                                    className="font-medium"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {user.name}
                                                </p>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {user.email}
                                                </p>
                                            </div>
                                            <StatusBadge status={user.status} />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Edit size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <SimplePagination
                                currentPage={1}
                                totalPages={5}
                                onPageChange={() => {}}
                            />
                        </div>
                    </Card>
                </section>

                {/* Phase 3.4: Data Display (Tables) */}
                <section className="space-y-6">
                    <div>
                        <h2
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Phase 3.4: Data Display (Tables)
                        </h2>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Table components with sorting, actions, and responsive design
                        </p>
                    </div>

                    {/* Basic Table */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Basic Table
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>Email</TableHeaderCell>
                                    <TableHeaderCell>Role</TableHeaderCell>
                                    <TableHeaderCell align="center">Status</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sampleUsers.slice(0, 3).map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <span
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {user.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell align="center">
                                            <StatusBadge status={user.status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Sortable Table */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Sortable Table
                        </h3>
                        <Table>
                            <TableHeader>
                                <tr>
                                    <TableHeaderCell
                                        sortable
                                        sortDirection={sortColumn === "name" ? sortDirection : null}
                                        onSort={() => handleSort("name")}
                                    >
                                        Name
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        sortable
                                        sortDirection={
                                            sortColumn === "email" ? sortDirection : null
                                        }
                                        onSort={() => handleSort("email")}
                                    >
                                        Email
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        sortable
                                        sortDirection={sortColumn === "role" ? sortDirection : null}
                                        onSort={() => handleSort("role")}
                                    >
                                        Role
                                    </TableHeaderCell>
                                    <TableHeaderCell align="center">Status</TableHeaderCell>
                                </tr>
                            </TableHeader>
                            <TableBody striped hoverable>
                                {sampleUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <span
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {user.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell align="center">
                                            <StatusBadge status={user.status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <p className="text-xs mt-3" style={{ color: "var(--color-text-tertiary)" }}>
                            Click on column headers to sort. This table also features striped rows
                            and hover effects.
                        </p>
                    </Card>

                    {/* Table with Actions */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Table with Action Buttons
                        </h3>
                        <Table>
                            <TableHeader>
                                <tr>
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>Email</TableHeaderCell>
                                    <TableHeaderCell>Role</TableHeaderCell>
                                    <TableHeaderCell align="center">Status</TableHeaderCell>
                                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                                </tr>
                            </TableHeader>
                            <TableBody hoverable>
                                {sampleUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <span
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {user.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell align="center">
                                            <StatusBadge status={user.status} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableActions
                                                onView={() => alert(`Viewing ${user.name}`)}
                                                onEdit={() => alert(`Editing ${user.name}`)}
                                                onDelete={() => alert(`Deleting ${user.name}`)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Table with Compact Actions */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Table with Compact Actions (Dropdown)
                        </h3>
                        <Table>
                            <TableHeader>
                                <tr>
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>Email</TableHeaderCell>
                                    <TableHeaderCell>Role</TableHeaderCell>
                                    <TableHeaderCell align="center">Status</TableHeaderCell>
                                    <TableHeaderCell align="right" width="80px">
                                        Actions
                                    </TableHeaderCell>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {sampleUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <span
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {user.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell align="center">
                                            <StatusBadge status={user.status} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableActions
                                                compact
                                                onView={() => alert(`Viewing ${user.name}`)}
                                                onEdit={() => alert(`Editing ${user.name}`)}
                                                onDelete={() => alert(`Deleting ${user.name}`)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <p className="text-xs mt-3" style={{ color: "var(--color-text-tertiary)" }}>
                            Compact mode shows actions in a dropdown menu to save space on mobile
                            devices.
                        </p>
                    </Card>

                    {/* Complete Example with All Features */}
                    <Card
                        header={
                            <CardHeader
                                title="User Management Table"
                                subtitle="Complete example with all table features"
                                actions={
                                    <Button variant="primary" size="sm">
                                        <UserPlus size={16} />
                                        Add User
                                    </Button>
                                }
                            />
                        }
                    >
                        <div className="space-y-4">
                            <Table>
                                <TableHeader sticky>
                                    <tr>
                                        <TableHeaderCell
                                            sortable
                                            sortDirection={
                                                sortColumn === "name" ? sortDirection : null
                                            }
                                            onSort={() => handleSort("name")}
                                        >
                                            Name
                                        </TableHeaderCell>
                                        <TableHeaderCell
                                            sortable
                                            sortDirection={
                                                sortColumn === "email" ? sortDirection : null
                                            }
                                            onSort={() => handleSort("email")}
                                        >
                                            Email
                                        </TableHeaderCell>
                                        <TableHeaderCell>Role</TableHeaderCell>
                                        <TableHeaderCell align="center">Status</TableHeaderCell>
                                        <TableHeaderCell align="right">Actions</TableHeaderCell>
                                    </tr>
                                </TableHeader>
                                <TableBody striped hoverable>
                                    {sampleUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            onClick={() => console.log("Row clicked:", user.name)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                                                        style={{
                                                            backgroundColor: "var(--color-primary)",
                                                        }}
                                                    >
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{user.role}</Badge>
                                            </TableCell>
                                            <TableCell align="center">
                                                <StatusBadge status={user.status} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TableActions
                                                    onView={() => alert(`Viewing ${user.name}`)}
                                                    onEdit={() => alert(`Editing ${user.name}`)}
                                                    onDelete={() => alert(`Deleting ${user.name}`)}
                                                    actions={["view", "edit", "delete"]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <SimplePagination
                                currentPage={1}
                                totalPages={5}
                                onPageChange={() => {}}
                            />
                        </div>
                    </Card>

                    {/* Table Features Showcase */}
                    <Card>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Table Features Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <h4
                                        className="font-semibold mb-2"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Responsive Design
                                    </h4>
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Tables automatically scroll horizontally on small screens
                                    </p>
                                </div>
                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <h4
                                        className="font-semibold mb-2"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Sortable Columns
                                    </h4>
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Click column headers to sort data ascending or descending
                                    </p>
                                </div>
                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <h4
                                        className="font-semibold mb-2"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Action Buttons
                                    </h4>
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Inline or compact dropdown actions for CRUD operations
                                    </p>
                                </div>
                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <h4
                                        className="font-semibold mb-2"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Dark Mode Support
                                    </h4>
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        All tables use CSS variables for seamless theme switching
                                    </p>
                                </div>
                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <h4
                                        className="font-semibold mb-2"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Striped Rows
                                    </h4>
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Optional alternating row colors for better readability
                                    </p>
                                </div>
                                <div className="p-4 border border-[var(--color-border)] rounded-lg">
                                    <h4
                                        className="font-semibold mb-2"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Hover Effects
                                    </h4>
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Rows highlight on hover for better user interaction
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Example Modal"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => setShowModal(false)}>
                            Save Changes
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p style={{ color: "var(--color-text-secondary)" }}>
                        This is a modal dialog with a title, content area, and action buttons in the
                        footer.
                    </p>
                    <p style={{ color: "var(--color-text-secondary)" }}>
                        You can close it by clicking the X button, pressing Escape, or clicking
                        outside the modal.
                    </p>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirm}
                title="Confirm Deletion"
                message="Are you sure you want to delete this item? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={modalLoading}
            />
        </ContentWrapper>
    );
}
