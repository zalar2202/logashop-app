"use client";

import { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { Formik, Form } from "formik";
import { Plus, Edit, Trash2, Tag, Calendar, Save, Percent } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import * as Yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const PromotionSchema = Yup.object().shape({
    title: Yup.string().required("Required"),
    description: Yup.string().required("Required"),
    discountCode: Yup.string(),
    discountAmount: Yup.string(),
    isActive: Yup.boolean(),
});

export default function PromotionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    useEffect(() => {
        if (!authLoading && (!user || !["admin", "manager"].includes(user.role))) {
            router.push("/panel/dashboard");
        }
    }, [user, authLoading, router]);

    const fetchPromotions = async () => {
        try {
            const res = await axios.get("/api/promotions?all=true");
            setPromotions(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch promotions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            if (editingPromotion) {
                await axios.put(`/api/promotions/${editingPromotion._id}`, values);
                toast.success("Promotion updated");
            } else {
                await axios.post("/api/promotions", values);
                toast.success("Promotion created");
            }
            fetchPromotions();
            setIsModalOpen(false);
            setEditingPromotion(null);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await axios.delete(`/api/promotions/${id}`);
            toast.success("Promotion deleted");
            fetchPromotions();
        } catch (error) {
            toast.error("Failed to delete");
        }
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
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Promotions</h1>
                    <p className="text-[var(--color-text-secondary)]">Manage active discounts and bundles</p>
                </div>
                <Button onClick={() => { setEditingPromotion(null); setIsModalOpen(true); }} icon={<Plus size={18} />}>
                    Add Promotion
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promotions.map((promo) => (
                    <Card key={promo._id} className="border-l-4 border-l-[var(--color-primary)]">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant={promo.isActive ? "success" : "secondary"}>
                                    {promo.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {promo.discountCode && (
                                    <Badge variant="primary" className="font-mono">
                                        {promo.discountCode}
                                    </Badge>
                                )}
                            </div>

                            <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed">
                                {promo.description}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-[var(--color-text-tertiary)] mb-6">
                                <div className="flex items-center gap-1.5">
                                    <Percent size={14} className="text-[var(--color-primary)]" />
                                    <span>{promo.discountAmount || "Varies"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    <span>Until {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'Endless'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-[var(--color-border)]">
                                <Button variant="secondary" size="sm" onClick={() => { setEditingPromotion(promo); setIsModalOpen(true); }} icon={<Edit size={16} />}>
                                    Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(promo._id)} icon={<Trash2 size={16} />}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPromotion ? "Edit Promotion" : "Create Promotion"}
            >
                <Formik
                    initialValues={editingPromotion || {
                        title: "",
                        description: "",
                        discountCode: "",
                        discountAmount: "",
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: "",
                        isActive: true
                    }}
                    validationSchema={PromotionSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className="space-y-4 py-4">
                            <InputField name="title" label="Promotion Title" placeholder="e.g. New Year Special" required />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="w-full p-2.5 rounded-lg border bg-[var(--color-background-elevated)] border-[var(--color-border)] min-h-[80px]"
                                    value={values.description}
                                    onChange={(e) => setFieldValue("description", e.target.value)}
                                    placeholder="Enter promotion details..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="discountCode" label="Discount Code" placeholder="NEW2026" />
                                <InputField name="discountAmount" label="Discount Amount" placeholder="20% OFF" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="startDate" label="Start Date" type="date" />
                                <InputField name="endDate" label="End Date" type="date" />
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="isActivePromo" 
                                    checked={values.isActive}
                                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                                />
                                <label htmlFor="isActivePromo" className="text-sm font-medium">Active (visible to users)</label>
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" loading={isSubmitting} icon={<Save size={18} />}>
                                    {editingPromotion ? "Update Promotion" : "Create Promotion"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </ContentWrapper>
    );
}
