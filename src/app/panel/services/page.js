"use client";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { Activity, Plus, Search, Calendar, CreditCard, Clock, Globe, Zap, Shield, Trash2, Edit } from "lucide-react";
import * as Yup from "yup";

const serviceSchema = Yup.object().shape({
    user: Yup.string().required("User is required"),
    package: Yup.string().required("Package is required"),
    price: Yup.number().min(0).required("Price is required"),
    billingCycle: Yup.string().required("Billing cycle is required"),
    status: Yup.string().required("Status is required"),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date().nullable(),
    autoRenew: Yup.boolean(),
    notes: Yup.string(),
});

function ServicesContent() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [packages, setPackages] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const isAdmin = user && ['admin', 'manager'].includes(user.role);

    const searchParams = useSearchParams();

    useEffect(() => {
        fetchServices();
        if (isAdmin) {
            fetchPackages();
            fetchUsersList();
        }
    }, [user]);

    useEffect(() => {
        const assignTo = searchParams.get('assignTo');
        if (assignTo && isAdmin) {
            setSelectedService(null);
            setIsModalOpen(true);
        }
    }, [searchParams, isAdmin]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/services");
            if (data.success) setServices(data.data);
        } catch (error) {
            toast.error("Failed to fetch services");
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const { data } = await axios.get("/api/packages");
            if (data.success) setPackages(data.data || []);
        } catch (error) {
            console.error("Failed to fetch packages");
        }
    };

    const fetchUsersList = async () => {
        try {
            const { data } = await axios.get("/api/users?limit=1000");
            if (data.success) setUsers(data.data || []);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            if (selectedService) {
                const { data } = await axios.put(`/api/services/${selectedService._id}`, values);
                if (data.success) {
                    toast.success("Service updated");
                    fetchServices();
                    setIsModalOpen(false);
                }
            } else {
                const { data } = await axios.post("/api/services", values);
                if (data.success) {
                    toast.success("Service assigned successfully");
                    fetchServices();
                    setIsModalOpen(false);
                    resetForm();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Remove this service assignment?")) return;
        try {
            await axios.delete(`/api/services/${id}`);
            toast.success("Service removed");
            fetchServices();
        } catch (error) {
            toast.error("Failed to remove service");
        }
    };

    const filteredServices = services.filter(s =>
        s.package?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.user?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const activeServices = services.filter(s => s.status === 'active');

    return (
        <ContentWrapper>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                        <Activity className="w-6 h-6 text-emerald-600" />
                        {isAdmin ? "User Services" : "My Services"}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        {isAdmin ? "Manage all active and past service assignments." : "View your active and past services."}
                    </p>
                </div>
                {isAdmin && (
                    <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setSelectedService(null); setIsModalOpen(true); }}>
                        Assign Service
                    </Button>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-secondary)]">Active Services</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeServices.length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-secondary)]">Total Services</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{services.length}</p>
                    </div>
                </Card>
                {!isAdmin && (
                    <Card className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">Member Since</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Services List/Grid */}
            <Card>
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-transparent text-[var(--color-text-primary)]"
                        style={{ borderColor: "var(--color-border)" }}
                    />
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading services...</div>
                    ) : filteredServices.length === 0 ? (
                        <div className="p-12 text-center">
                            <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No services found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {filteredServices.map((svc) => (
                                <div key={svc._id} className="p-4 border border-[var(--color-border)] rounded-xl hover:shadow-md transition-all group relative">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={svc.status === 'active' ? 'success' : svc.status === 'pending' ? 'warning' : 'secondary'} size="sm" className="capitalize">
                                                    {svc.status}
                                                </Badge>
                                                <span className="text-xs text-[var(--color-text-tertiary)] font-mono">#{svc._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1 truncate">
                                                {svc.package?.name || "Premium Plan"}
                                            </h3>
                                            {isAdmin && (
                                                <p className="text-sm text-emerald-600 font-medium mb-2">Client: {svc.user?.name}</p>
                                            )}
                                            
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Started: {new Date(svc.startDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Expires: {svc.endDate ? new Date(svc.endDate).toLocaleDateString() : 'Lifetime'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                    <CreditCard className="w-4 h-4" />
                                                    <span>${svc.price?.toFixed(2)} / {svc.billingCycle}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                    <Globe className="w-4 h-4" />
                                                    <span>Auto-renew: {svc.autoRenew ? "Yes" : "No"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => { setSelectedService(svc); setIsModalOpen(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(svc._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {svc.notes && (
                                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 italic">
                                            "{svc.notes}"
                                        </div>
                                    )}

                                    {isAdmin && svc.invoice?.paymentPlan?.isInstallment && (
                                        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-300">
                                                <CreditCard className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Active Payment Plan</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                <div className="text-gray-500">Installments:</div>
                                                <div className="text-right font-medium text-indigo-900 dark:text-indigo-100">{svc.invoice.paymentPlan.installmentsCount} Payments</div>
                                                <div className="text-gray-500">Amount/Period:</div>
                                                <div className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                                                    ${svc.invoice.paymentPlan.installmentAmount?.toFixed(2)} / {svc.invoice.paymentPlan.period}
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800 flex justify-between items-center">
                                                <span className="text-[10px] text-indigo-500 font-mono">LINKED INV: {svc.invoice.invoiceNumber}</span>
                                                <Button size="sm" variant="secondary" className="h-7 text-[10px] px-2" onClick={() => (window.location.href = `/panel/invoices`)}>View Payments</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Admin Modal for Assigning/Editing */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedService ? "Edit Service" : "Assign New Service"} size="lg">
                <Formik
                    initialValues={{
                        user: searchParams.get('assignTo') || selectedService?.user?._id || selectedService?.user || "",
                        package: selectedService?.package?._id || "",
                        price: selectedService?.price || 0,
                        billingCycle: selectedService?.billingCycle || "monthly",
                        status: selectedService?.status || "active",
                        startDate: selectedService?.startDate ? new Date(selectedService.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        endDate: selectedService?.endDate ? new Date(selectedService.endDate).toISOString().split('T')[0] : "",
                        autoRenew: selectedService?.autoRenew ?? true,
                        notes: selectedService?.notes || "",
                    }}
                    validationSchema={serviceSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ values, isSubmitting, setFieldValue }) => {
                        const handlePackageChange = (e) => {
                            const pkgId = e.target.value;
                            setFieldValue('package', pkgId);
                            const pkg = packages.find(p => p._id === pkgId);
                            if (pkg) {
                                setFieldValue('price', pkg.price);
                                // Optionally calculate end date based on pkg duration if it existed
                            }
                        };

                        return (
                            <Form className="space-y-4">
                                <SelectField name="user" label="Select Client">
                                    <option value="">-- Choose User --</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                    ))}
                                </SelectField>

                                <div className="grid grid-cols-2 gap-4">
                                    <SelectField name="package" label="Package" onChange={handlePackageChange}>
                                        <option value="">-- Choose Package --</option>
                                        {packages.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </SelectField>
                                    <InputField type="number" name="price" label="Price Override ($)" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <SelectField name="billingCycle" label="Billing Cycle">
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="semi-annually">Semi-Annually</option>
                                        <option value="annually">Annually</option>
                                        <option value="one-time">One Time</option>
                                    </SelectField>
                                    <SelectField name="status" label="Status">
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="expired">Expired</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="cancelled">Cancelled</option>
                                    </SelectField>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField type="date" name="startDate" label="Start Date" />
                                    <InputField type="date" name="endDate" label="Expiration Date (Optional)" />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="autoRenew" checked={values.autoRenew} onChange={e => setFieldValue('autoRenew', e.target.checked)} className="rounded text-emerald-600" />
                                    <span className="text-sm font-medium">Enable Auto-Renewal</span>
                                </label>

                                <TextareaField name="notes" label="Admin Notes" rows={3} placeholder="Internal details, server info, etc." />

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" loading={isSubmitting}>
                                        {selectedService ? "Save Changes" : "Confirm Assignment"}
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </Modal>
        </ContentWrapper>
    );
}

export default function ServicesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ServicesContent />
        </Suspense>
    );
}
