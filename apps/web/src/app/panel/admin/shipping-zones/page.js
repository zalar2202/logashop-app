"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Globe,
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronUp,
    Package,
    Star,
    ToggleLeft,
    ToggleRight,
    AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Button } from "@/components/common/Button";
import { useGeoData } from "@/hooks/useGeoData";
import { COUNTRIES_FALLBACK } from "@/components/shipping/ShippingZoneForm";

function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}

function getCountryName(code, countries) {
    const list = countries?.length ? countries : COUNTRIES_FALLBACK;
    return list.find((c) => (c.iso2 || c.code) === code)?.name || code;
}

export default function ShippingZonesPage() {
    const { countries } = useGeoData();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedZone, setExpandedZone] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchZones = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/shipping-zones");
            if (data.success) {
                setZones(data.data);
            }
        } catch (error) {
            toast.error("Failed to load shipping zones");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`/api/shipping-zones/${id}`);
            if (data.success) {
                toast.success("Shipping zone deleted");
                setDeleteConfirm(null);
                fetchZones();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete shipping zone");
        }
    };

    const toggleActive = async (zone) => {
        try {
            await axios.put(`/api/shipping-zones/${zone._id}`, {
                isActive: !zone.isActive,
            });
            toast.success(`Zone ${zone.isActive ? "deactivated" : "activated"}`);
            fetchZones();
        } catch (error) {
            toast.error("Failed to update zone");
        }
    };

    return (
        <ContentWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                            Shipping Zones
                        </h1>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                            Configure shipping rates by geographic region
                        </p>
                    </div>
                    <Link href="/panel/admin/shipping-zones/create">
                        <Button icon={<Plus size={16} />}>Create Zone</Button>
                    </Link>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && zones.length === 0 && (
                    <div className="text-center py-20 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)]">
                        <Globe size={56} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No Shipping Zones</h2>
                        <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
                            Create shipping zones to define where you ship and at what rates. You can
                            set up different rates for different regions.
                        </p>
                        <Link href="/panel/admin/shipping-zones/create">
                            <Button>Create First Zone</Button>
                        </Link>
                    </div>
                )}

                {/* Zone List */}
                {!loading && zones.length > 0 && (
                    <div className="space-y-3">
                        {zones.map((zone) => {
                            const isExpanded = expandedZone === zone._id;
                            const activeMethods = zone.methods?.filter((m) => m.isActive) || [];

                            return (
                                <div
                                    key={zone._id}
                                    className={`bg-[var(--color-bg-primary)] rounded-xl border transition ${
                                        zone.isActive
                                            ? "border-[var(--color-border)]"
                                            : "border-dashed border-gray-300 opacity-60"
                                    }`}
                                >
                                    {/* Zone Header */}
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--color-bg-secondary)]/50 rounded-t-xl transition"
                                        onClick={() => setExpandedZone(isExpanded ? null : zone._id)}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    zone.isDefault
                                                        ? "bg-amber-100 text-amber-600"
                                                        : "bg-blue-50 text-blue-500"
                                                }`}
                                            >
                                                {zone.isDefault ? (
                                                    <Star size={20} />
                                                ) : (
                                                    <Globe size={20} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm truncate">
                                                        {zone.name}
                                                    </h3>
                                                    {zone.isDefault && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium whitespace-nowrap">
                                                            Default
                                                        </span>
                                                    )}
                                                    {!zone.isActive && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium whitespace-nowrap">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                                                    {zone.countries?.length > 0
                                                        ? zone.countries
                                                              .map((c) => getCountryName(c, countries))
                                                              .join(", ")
                                                        : "All countries (fallback)"}
                                                    {zone.states?.length > 0 &&
                                                        ` · States: ${zone.states.join(", ")}`}
                                                    {` · ${activeMethods.length} method${activeMethods.length !== 1 ? "s" : ""}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleActive(zone);
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition"
                                                title={zone.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {zone.isActive ? (
                                                    <ToggleRight size={20} className="text-green-500" />
                                                ) : (
                                                    <ToggleLeft size={20} className="text-gray-400" />
                                                )}
                                            </button>
                                            <Link
                                                href={`/panel/admin/shipping-zones/${zone._id}/edit`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition inline-flex"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirm(zone._id);
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            {isExpanded ? (
                                                <ChevronUp
                                                    size={18}
                                                    className="text-[var(--color-text-secondary)]"
                                                />
                                            ) : (
                                                <ChevronDown
                                                    size={18}
                                                    className="text-[var(--color-text-secondary)]"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete Confirmation */}
                                    {deleteConfirm === zone._id && (
                                        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                                            <p className="text-sm text-red-700 flex items-center gap-2">
                                                <AlertCircle size={16} />
                                                Delete &quot;{zone.name}&quot;? This cannot be undone.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-white transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(zone._id)}
                                                    className="text-xs px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Expanded Methods */}
                                    {isExpanded && (
                                        <div className="border-t border-[var(--color-border)] p-4">
                                            <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
                                                Shipping Methods
                                            </h4>
                                            <div className="space-y-2">
                                                {(zone.methods || []).map((method, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)] ${
                                                            !method.isActive ? "opacity-50" : ""
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Package
                                                                size={16}
                                                                className="text-[var(--color-primary)]"
                                                            />
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {method.label}
                                                                    {!method.isActive && (
                                                                        <span className="ml-2 text-[10px] text-gray-400">
                                                                            (inactive)
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-[var(--color-text-secondary)]">
                                                                    {method.description ||
                                                                        method.estimatedDays}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold">
                                                                {method.price === 0
                                                                    ? "Free"
                                                                    : formatPrice(method.price)}
                                                            </p>
                                                            {method.freeThreshold && (
                                                                <p className="text-[10px] text-green-600">
                                                                    Free over{" "}
                                                                    {formatPrice(method.freeThreshold)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
                                                <span>Priority: {zone.sortOrder}</span>
                                                <span className="mx-2">·</span>
                                                <span>
                                                    Created:{" "}
                                                    {new Date(zone.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </ContentWrapper>
    );
}
