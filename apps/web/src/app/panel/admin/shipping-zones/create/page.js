"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Button } from "@/components/common/Button";
import { ShippingZoneForm, EMPTY_ZONE } from "@/components/shipping/ShippingZoneForm";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function CreateShippingZonePage() {
    const router = useRouter();
    const [zone, setZone] = useState({ ...EMPTY_ZONE });
    const [saving, setSaving] = useState(false);

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
            const { data } = await axios.post("/api/shipping-zones", zone);
            if (data.success) {
                toast.success("Shipping zone created");
                router.push("/panel/admin/shipping-zones");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create shipping zone");
        } finally {
            setSaving(false);
        }
    };

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
                    Create Shipping Zone
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Define geographic regions and their shipping rates
                </p>
            </div>

            <ShippingZoneForm
                zone={zone}
                onChange={setZone}
                onSave={handleSave}
                onCancel={() => router.push("/panel/admin/shipping-zones")}
                saving={saving}
                isEdit={false}
            />
        </ContentWrapper>
    );
}
