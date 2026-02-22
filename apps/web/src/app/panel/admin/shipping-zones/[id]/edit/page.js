"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Button } from "@/components/common/Button";
import { ShippingZoneForm } from "@/components/shipping/ShippingZoneForm";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function EditShippingZonePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [zone, setZone] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        axios
            .get(`/api/shipping-zones/${id}`)
            .then(({ data }) => {
                if (data.success && data.data) {
                    setZone({
                        ...data.data,
                        countries: data.data.countries || [],
                        states: data.data.states || [],
                        methods: data.data.methods?.length
                            ? data.data.methods.map((m) => ({ ...m }))
                            : [{ methodId: "standard", label: "Standard Shipping", description: "", price: 499, freeThreshold: null, estimatedDays: "5-7 business days", isActive: true }],
                    });
                }
            })
            .catch(() => {
                toast.error("Failed to load shipping zone");
                router.push("/panel/admin/shipping-zones");
            })
            .finally(() => setLoading(false));
    }, [id, router]);

    const validate = () => {
        if (!zone.name.trim()) {
            toast.error("Zone name is required");
            return false;
        }
        if (zone.methods.length === 0) {
            toast.error("At least one shipping method is required");
            return false;
        }
        for (const method of zone.methods) {
            if (!method.label?.trim()) {
                toast.error("All shipping methods must have a label");
                return false;
            }
            if (method.price < 0) {
                toast.error("Shipping prices cannot be negative");
                return false;
            }
        }
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            const { data } = await axios.put(`/api/shipping-zones/${id}`, zone);
            if (data.success) {
                toast.success("Shipping zone updated");
                router.push("/panel/admin/shipping-zones");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update shipping zone");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !zone) {
        return (
            <ContentWrapper>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper>
            <div className="mb-6">
                <Button
                    variant="secondary"
                    icon={<ArrowLeft size={18} />}
                    onClick={() => router.push("/panel/admin/shipping-zones")}
                    className="mb-4"
                >
                    Back
                </Button>
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Edit Shipping Zone
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Update geographic regions and shipping rates
                </p>
            </div>

            <ShippingZoneForm
                zone={zone}
                onChange={setZone}
                onSave={handleSave}
                onCancel={() => router.push("/panel/admin/shipping-zones")}
                saving={saving}
                isEdit={true}
            />
        </ContentWrapper>
    );
}
