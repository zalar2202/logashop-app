"use client";

import { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { Formik, Form } from "formik";
import { Plus, Edit, Trash2, Package as PackageIcon, Save, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import * as Yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw, Star } from "lucide-react";

const PackageSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    category: Yup.string().required("Required"),
    startingPrice: Yup.string().required("Required"),
    isActive: Yup.boolean(),
});

export default function PackagesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);

    useEffect(() => {
        if (!authLoading && (!user || !["admin", "manager"].includes(user.role))) {
            router.push("/panel/dashboard");
        }
    }, [user, authLoading, router]);

    const fetchPackages = async () => {
        try {
            const res = await axios.get("/api/packages?all=true");
            setPackages(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch packages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            if (editingPackage) {
                await axios.put(`/api/packages/${editingPackage._id}`, values);
                toast.success("Package updated");
            } else {
                await axios.post("/api/packages", values);
                toast.success("Package created");
            }
            fetchPackages();
            setIsModalOpen(false);
            setEditingPackage(null);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            await axios.delete(`/api/packages/${id}`);
            toast.success("Package deleted");
            fetchPackages();
        } catch (error) {
            toast.error("Failed to delete package");
        }
    };

    const openCreateModal = () => {
        setEditingPackage(null);
        setIsModalOpen(true);
    };

    const openEditModal = (pkg) => {
        setEditingPackage(pkg);
        setIsModalOpen(true);
    };

    if (authLoading || !user || !["admin", "manager"].includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <ContentWrapper>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Packages</h1>
                    <p className="text-[var(--color-text-secondary)]">Manage your service packages and pricing</p>
                </div>
                <div className="flex gap-3">
                    {["admin", "manager"].includes(user.role) && (
                        <Button 
                            variant="secondary" 
                            onClick={async () => {
                                if(confirm("This will replace current design/dev/maintenance packages and all promotions with defaults. Continue?")) {
                                    try {
                                        await axios.post("/api/packages/seed");
                                        toast.success("Data seeded!");
                                        fetchPackages();
                                    } catch(e) { toast.error("Seeding failed"); }
                                }
                            }}
                        >
                            Seed Base Data
                        </Button>
                    )}
                    <Button onClick={openCreateModal} icon={<Plus size={18} />}>
                        Add Package
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Card key={i} className="h-64 animate-pulse bg-[var(--color-background-elevated)]" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <Card key={pkg._id} className="relative overflow-hidden group hover:border-[var(--color-primary)] transition-all">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-[var(--color-primary)] bg-opacity-10 rounded-xl text-[var(--color-primary)]">
                                        <PackageIcon size={24} />
                                    </div>
                                    <Badge variant={pkg.isActive ? "success" : "secondary"}>
                                        {pkg.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                
                                <h3 className="text-xl font-bold mb-1 text-[var(--color-text-primary)]">{pkg.name}</h3>
                                <p className="text-xs text-[var(--color-text-secondary)] uppercase font-bold mb-4 tracking-widest">
                                    {pkg.category}
                                </p>
                                
                                <div className="mb-5">
                                    <span className="text-3xl font-bold text-[var(--color-primary)]">{pkg.startingPrice}</span>
                                    {pkg.priceRange && <span className="text-sm text-[var(--color-text-secondary)] ml-2">({pkg.priceRange})</span>}
                                </div>

                                <div className="space-y-2 mb-4">
                                    {pkg.deliveryTime && (
                                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                            <Clock size={14} /> {pkg.deliveryTime}
                                        </div>
                                    )}
                                    {pkg.revisions && (
                                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                            <RefreshCw size={14} /> {pkg.revisions}
                                        </div>
                                    )}
                                </div>

                                <ul className="mb-6 space-y-2">
                                    {pkg.features?.slice(0, 3).map((f, i) => (
                                        <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                                            {f}
                                        </li>
                                    ))}
                                    {pkg.features?.length > 3 && (
                                        <li className="text-xs text-[var(--color-text-tertiary)] italic">+{pkg.features.length - 3} more features</li>
                                    )}
                                </ul>

                                <div className="flex gap-2 pt-4 border-t border-[var(--color-border)]">
                                    <Button variant="secondary" size="sm" fullWidth onClick={() => openEditModal(pkg)} icon={<Edit size={16} />}>
                                        Edit
                                    </Button>
                                    <Button variant="danger" size="sm" fullWidth onClick={() => handleDelete(pkg._id)} icon={<Trash2 size={16} />}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {packages.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                            <PackageIcon size={48} className="mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-20" />
                            <h3 className="text-xl font-medium text-[var(--color-text-primary)]">No packages yet</h3>
                            <p className="text-[var(--color-text-secondary)] mb-8">Start by creating your first service package</p>
                            <Button onClick={openCreateModal} icon={<Plus size={18} />}>
                                Create First Package
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPackage ? "Edit Package" : "Create New Package"}
            >
                <Formik
                    initialValues={editingPackage || {
                        name: "",
                        category: "design",
                        startingPrice: "",
                        priceRange: "",
                        deliveryTime: "",
                        revisions: "",
                        badge: "",
                        description: "",
                        features: [],
                        isActive: true,
                        order: 0
                    }}
                    validationSchema={PackageSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className="space-y-5 py-4">
                            <InputField name="name" label="Package Name" placeholder="e.g. Premium Branding" required />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-primary)]">Category</label>
                                    <select 
                                        name="category"
                                        value={values.category}
                                        onChange={(e) => setFieldValue("category", e.target.value)}
                                        className="w-full p-2.5 rounded-lg border bg-[var(--color-background-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                    >
                                        <option value="design">Design</option>
                                        <option value="development">Development</option>
                                        <option value="deployment">Deployment</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="bundle">Bundle</option>
                                    </select>
                                </div>
                                <InputField name="order" label="Order" type="number" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="startingPrice" label="Starting Price" placeholder="$800" required />
                                <InputField name="priceRange" label="Price Range" placeholder="$800 - $1500" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="deliveryTime" label="Delivery Time" placeholder="e.g. 5-7 days" />
                                <InputField name="revisions" label="Revisions" placeholder="e.g. 3 Revisions" />
                            </div>

                            <InputField name="badge" label="Badge (Optional)" placeholder="e.g. Most Popular" />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">Features (one per line)</label>
                                <textarea
                                    className="w-full p-3 rounded-lg border bg-[var(--color-background-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-h-[120px]"
                                    value={values.features.join("\n")}
                                    onChange={(e) => setFieldValue("features", e.target.value.split("\n").filter(f => f.trim()))}
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-[var(--color-background-elevated)] rounded-lg transition-all border border-[var(--color-border)]">
                                <input 
                                    type="checkbox" 
                                    id="isActive" 
                                    className="w-5 h-5 accent-[var(--color-primary)]"
                                    checked={values.isActive}
                                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-[var(--color-text-primary)] cursor-pointer">
                                    Show this package to users
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end pt-6 border-t border-[var(--color-border)]">
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" loading={isSubmitting} icon={<Save size={18} />}>
                                    {editingPackage ? "Save Changes" : "Create Package"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </ContentWrapper>
    );
}
