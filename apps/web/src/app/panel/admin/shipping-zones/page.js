"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Globe,
    MapPin,
    Truck,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Package,
    Star,
    ToggleLeft,
    ToggleRight,
    AlertCircle,
    Save,
    GripVertical,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

// ─── Country Options ───────────────────────────────────────────
const COUNTRIES = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "United Kingdom" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "AU", name: "Australia" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "South Korea" },
    { code: "IN", name: "India" },
    { code: "BR", name: "Brazil" },
    { code: "MX", name: "Mexico" },
    { code: "IT", name: "Italy" },
    { code: "ES", name: "Spain" },
    { code: "NL", name: "Netherlands" },
    { code: "SE", name: "Sweden" },
    { code: "NO", name: "Norway" },
    { code: "DK", name: "Denmark" },
    { code: "CH", name: "Switzerland" },
    { code: "AT", name: "Austria" },
    { code: "BE", name: "Belgium" },
    { code: "IE", name: "Ireland" },
    { code: "NZ", name: "New Zealand" },
    { code: "SG", name: "Singapore" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "TR", name: "Turkey" },
    { code: "PL", name: "Poland" },
    { code: "PT", name: "Portugal" },
    { code: "FI", name: "Finland" },
    { code: "CZ", name: "Czech Republic" },
];

const US_STATES = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
];

const METHOD_OPTIONS = [
    { id: "standard", label: "Standard Shipping" },
    { id: "express", label: "Express Shipping" },
    { id: "overnight", label: "Overnight Shipping" },
    { id: "pickup", label: "Store Pickup" },
];

const EMPTY_METHOD = {
    methodId: "standard",
    label: "Standard Shipping",
    description: "",
    price: 499,
    freeThreshold: null,
    estimatedDays: "5-7 business days",
    isActive: true,
};

const EMPTY_ZONE = {
    name: "",
    countries: [],
    states: [],
    methods: [{ ...EMPTY_METHOD }],
    isDefault: false,
    isActive: true,
    sortOrder: 0,
};

// ─── Helpers ───────────────────────────────────────────────────
function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}

function getCountryName(code) {
    return COUNTRIES.find((c) => c.code === code)?.name || code;
}

// ─── Main Component ────────────────────────────────────────────
export default function ShippingZonesPage() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingZone, setEditingZone] = useState(null); // null = list view, object = editing
    const [isNew, setIsNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedZone, setExpandedZone] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Fetch zones
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

    // Save zone
    const handleSave = async () => {
        if (!editingZone.name.trim()) {
            toast.error("Zone name is required");
            return;
        }
        if (editingZone.methods.length === 0) {
            toast.error("At least one shipping method is required");
            return;
        }

        // Validate methods
        for (const method of editingZone.methods) {
            if (!method.label?.trim()) {
                toast.error("All shipping methods must have a label");
                return;
            }
            if (method.price < 0) {
                toast.error("Shipping prices cannot be negative");
                return;
            }
        }

        try {
            setSaving(true);
            if (isNew) {
                const { data } = await axios.post("/api/shipping-zones", editingZone);
                if (data.success) {
                    toast.success("Shipping zone created");
                }
            } else {
                const { data } = await axios.put(
                    `/api/shipping-zones/${editingZone._id}`,
                    editingZone
                );
                if (data.success) {
                    toast.success("Shipping zone updated");
                }
            }
            setEditingZone(null);
            setIsNew(false);
            fetchZones();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save shipping zone");
        } finally {
            setSaving(false);
        }
    };

    // Delete zone
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

    // Toggle zone active status
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

    // Add method to editing zone
    const addMethod = () => {
        setEditingZone((prev) => ({
            ...prev,
            methods: [...prev.methods, { ...EMPTY_METHOD }],
        }));
    };

    // Update method in editing zone
    const updateMethod = (index, field, value) => {
        setEditingZone((prev) => {
            const methods = [...prev.methods];
            methods[index] = { ...methods[index], [field]: value };

            // Auto-update label when methodId changes
            if (field === "methodId") {
                const option = METHOD_OPTIONS.find((o) => o.id === value);
                if (option) {
                    methods[index].label = option.label;
                }
            }

            return { ...prev, methods };
        });
    };

    // Remove method from editing zone
    const removeMethod = (index) => {
        setEditingZone((prev) => ({
            ...prev,
            methods: prev.methods.filter((_, i) => i !== index),
        }));
    };

    // Toggle country in editing zone
    const toggleCountry = (code) => {
        setEditingZone((prev) => {
            const countries = prev.countries.includes(code)
                ? prev.countries.filter((c) => c !== code)
                : [...prev.countries, code];
            return { ...prev, countries };
        });
    };

    // Toggle state in editing zone
    const toggleState = (code) => {
        setEditingZone((prev) => {
            const states = prev.states.includes(code)
                ? prev.states.filter((s) => s !== code)
                : [...prev.states, code];
            return { ...prev, states };
        });
    };

    // ─── EDIT/CREATE FORM ──────────────────────────────────────
    if (editingZone) {
        return (
            <ContentWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                            {isNew ? "Create Shipping Zone" : "Edit Shipping Zone"}
                        </h1>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            Define geographic regions and their shipping rates
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setEditingZone(null);
                                setIsNew(false);
                            }}
                            className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm hover:bg-[var(--color-bg-secondary)] transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save size={16} />
                            {saving ? "Saving..." : "Save Zone"}
                        </button>
                    </div>
                </div>

                {/* Zone Info */}
                <div className="bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)] p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-[var(--color-primary)]" />
                        Zone Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Zone Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editingZone.name}
                                onChange={(e) =>
                                    setEditingZone((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="e.g., Domestic US, International Europe"
                                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-[var(--color-bg-primary)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Sort Order</label>
                            <input
                                type="number"
                                value={editingZone.sortOrder}
                                onChange={(e) =>
                                    setEditingZone((prev) => ({
                                        ...prev,
                                        sortOrder: parseInt(e.target.value) || 0,
                                    }))
                                }
                                placeholder="0"
                                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-[var(--color-bg-primary)]"
                            />
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                Lower = higher priority when matching
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editingZone.isActive}
                                onChange={(e) =>
                                    setEditingZone((prev) => ({
                                        ...prev,
                                        isActive: e.target.checked,
                                    }))
                                }
                                className="accent-[var(--color-primary)]"
                            />
                            <span className="text-sm">Active</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editingZone.isDefault}
                                onChange={(e) =>
                                    setEditingZone((prev) => ({
                                        ...prev,
                                        isDefault: e.target.checked,
                                    }))
                                }
                                className="accent-[var(--color-primary)]"
                            />
                            <span className="text-sm">
                                Default Zone (fallback for unmatched addresses)
                            </span>
                        </label>
                    </div>
                </div>

                {/* Countries */}
                <div className="bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)] p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-[var(--color-primary)]" />
                        Countries
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                        Select which countries belong to this zone. Leave empty for a catch-all /
                        fallback zone.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {COUNTRIES.map((country) => {
                            const selected = editingZone.countries.includes(country.code);
                            return (
                                <button
                                    key={country.code}
                                    onClick={() => toggleCountry(country.code)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                                        selected
                                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                            : "bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                    }`}
                                >
                                    {country.code} — {country.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* States (only show if US is selected) */}
                {editingZone.countries.includes("US") && (
                    <div className="bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)] p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-blue-500" />
                            US States (Optional)
                        </h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                            Optionally limit this zone to specific US states. Leave empty to cover
                            all US states.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {US_STATES.map((state) => {
                                const selected = editingZone.states.includes(state);
                                return (
                                    <button
                                        key={state}
                                        onClick={() => toggleState(state)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                                            selected
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-blue-300"
                                        }`}
                                    >
                                        {state}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Shipping Methods */}
                <div className="bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Truck size={20} className="text-[var(--color-primary)]" />
                            Shipping Methods
                        </h2>
                        <button
                            onClick={addMethod}
                            className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition flex items-center gap-1.5"
                        >
                            <Plus size={14} />
                            Add Method
                        </button>
                    </div>

                    <div className="space-y-4">
                        {editingZone.methods.map((method, index) => (
                            <div
                                key={index}
                                className="border border-[var(--color-border)] rounded-xl p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                                        Method #{index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                                            <input
                                                type="checkbox"
                                                checked={method.isActive}
                                                onChange={(e) =>
                                                    updateMethod(
                                                        index,
                                                        "isActive",
                                                        e.target.checked
                                                    )
                                                }
                                                className="accent-[var(--color-primary)]"
                                            />
                                            Active
                                        </label>
                                        {editingZone.methods.length > 1 && (
                                            <button
                                                onClick={() => removeMethod(index)}
                                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Type
                                        </label>
                                        <select
                                            value={method.methodId}
                                            onChange={(e) =>
                                                updateMethod(index, "methodId", e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                        >
                                            {METHOD_OPTIONS.map((opt) => (
                                                <option key={opt.id} value={opt.id}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Label
                                        </label>
                                        <input
                                            type="text"
                                            value={method.label}
                                            onChange={(e) =>
                                                updateMethod(index, "label", e.target.value)
                                            }
                                            placeholder="Standard Shipping"
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Price (cents)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={method.price}
                                                onChange={(e) =>
                                                    updateMethod(
                                                        index,
                                                        "price",
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                min="0"
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)]">
                                                {formatPrice(method.price)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Free Threshold (cents)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={method.freeThreshold ?? ""}
                                                onChange={(e) =>
                                                    updateMethod(
                                                        index,
                                                        "freeThreshold",
                                                        e.target.value
                                                            ? parseInt(e.target.value)
                                                            : null
                                                    )
                                                }
                                                min="0"
                                                placeholder="Leave empty for never"
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                            />
                                            {method.freeThreshold && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">
                                                    Free over {formatPrice(method.freeThreshold)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Estimated Delivery
                                        </label>
                                        <input
                                            type="text"
                                            value={method.estimatedDays}
                                            onChange={(e) =>
                                                updateMethod(index, "estimatedDays", e.target.value)
                                            }
                                            placeholder="5-7 business days"
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-1">
                                        <label className="block text-xs font-medium mb-1">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={method.description}
                                            onChange={(e) =>
                                                updateMethod(index, "description", e.target.value)
                                            }
                                            placeholder="Short description"
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            </ContentWrapper>
        );
    }

    // ─── LIST VIEW ─────────────────────────────────────────────
    return (
        <ContentWrapper>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        Shipping Zones
                    </h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Configure shipping rates by geographic region
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingZone({ ...EMPTY_ZONE });
                        setIsNew(true);
                    }}
                    className="px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition flex items-center gap-2 shadow-sm"
                >
                    <Plus size={16} />
                    Add Zone
                </button>
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
                    <button
                        onClick={() => {
                            setEditingZone({ ...EMPTY_ZONE });
                            setIsNew(true);
                        }}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition inline-flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Create First Zone
                    </button>
                </div>
            )}

            {/* Zone List */}
            {!loading && zones.length > 0 && (
                <div className="space-y-3">
                    {zones.map((zone) => {
                        const isExpanded = expandedZone === zone._id;
                        const activeMethods = zone.methods.filter((m) => m.isActive);

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
                                                {zone.countries.length > 0
                                                    ? zone.countries.map(getCountryName).join(", ")
                                                    : "All countries (fallback)"}
                                                {zone.states.length > 0 &&
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
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingZone({ ...zone });
                                                setIsNew(false);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
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
                                            {zone.methods.map((method, i) => (
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
