"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Globe,
    MapPin,
    Truck,
    Plus,
    Trash2,
    Save,
} from "lucide-react";
import { useGeoData } from "@/hooks/useGeoData";
import { ChipSelectInput } from "./ChipSelectInput";

// Fallback for list page when API hasn't loaded yet
export const COUNTRIES_FALLBACK = [
    { iso2: "US", name: "United States" },
    { iso2: "CA", name: "Canada" },
    { iso2: "GB", name: "United Kingdom" },
    { iso2: "IR", name: "Iran" },
    { iso2: "DE", name: "Germany" },
    { iso2: "FR", name: "France" },
];

export const METHOD_OPTIONS = [
    { id: "standard", label: "Standard Shipping" },
    { id: "express", label: "Express Shipping" },
    { id: "overnight", label: "Overnight Shipping" },
    { id: "pickup", label: "Store Pickup" },
];

export const EMPTY_METHOD = {
    methodId: "standard",
    label: "Standard Shipping",
    description: "",
    price: 499,
    freeThreshold: null,
    estimatedDays: "5-7 business days",
    isActive: true,
};

export const EMPTY_ZONE = {
    name: "",
    countries: [],
    states: [],
    methods: [{ ...EMPTY_METHOD }],
    isDefault: false,
    isActive: true,
    sortOrder: 0,
};

function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}

export function ShippingZoneForm({ zone, onChange, onSave, onCancel, saving, isEdit }) {
    const { countries: apiCountries, loadingCountries, fetchStates } = useGeoData();
    const [zoneStates, setZoneStates] = useState([]); // { countryCode, states }[]
    const [loadingStates, setLoadingStates] = useState(false);

    const countries = apiCountries.length > 0 ? apiCountries : COUNTRIES_FALLBACK;

    // Fetch states for all selected countries when zone.countries changes
    useEffect(() => {
        if (zone.countries.length === 0) {
            setZoneStates([]);
            return;
        }
        setLoadingStates(true);
        const countryList = countries;
        Promise.all(zone.countries.map((cc) => fetchStates(cc)))
            .then((results) => {
                setZoneStates(
                    zone.countries.map((cc, i) => ({
                        countryCode: cc,
                        countryName: countryList.find((c) => (c.iso2 || c.code) === cc)?.name || cc,
                        states: results[i] || [],
                    }))
                );
            })
            .finally(() => setLoadingStates(false));
    }, [zone.countries.join(","), fetchStates, countries.length]);

    const addMethod = () => {
        onChange({
            ...zone,
            methods: [...zone.methods, { ...EMPTY_METHOD }],
        });
    };

    const updateMethod = (index, field, value) => {
        const methods = [...zone.methods];
        methods[index] = { ...methods[index], [field]: value };
        if (field === "methodId") {
            const option = METHOD_OPTIONS.find((o) => o.id === value);
            if (option) methods[index].label = option.label;
        }
        onChange({ ...zone, methods });
    };

    const removeMethod = (index) => {
        if (zone.methods.length <= 1) return;
        onChange({ ...zone, methods: zone.methods.filter((_, i) => i !== index) });
    };

    const countryOptions = useMemo(
        () =>
            countries.map((c) => ({
                id: c.iso2 || c.code,
                label: `${c.iso2 || c.code} — ${c.name}`,
            })),
        [countries]
    );

    const stateOptions = useMemo(() => {
        const multi = zone.countries.length > 1;
        return zoneStates.flatMap(({ countryName, states }) =>
            states.map((s) => {
                const stateCode = s.iso2 || String(s.id) || s.name;
                const label = multi ? `${countryName} — ${s.name}` : s.name;
                return { id: stateCode, label };
            })
        );
    }, [zoneStates, zone.countries.length]);

    const addCountry = (code) => {
        if (zone.countries.includes(code)) return;
        onChange({ ...zone, countries: [...zone.countries, code] });
    };

    const removeCountry = (code) => {
        const newCountries = zone.countries.filter((c) => c !== code);
        onChange({
            ...zone,
            countries: newCountries,
            states: newCountries.length === 0 ? [] : zone.states,
        });
    };

    const addState = (stateCode) => {
        if (zone.states.includes(stateCode)) return;
        onChange({ ...zone, states: [...zone.states, stateCode] });
    };

    const removeState = (stateCode) => {
        onChange({ ...zone, states: zone.states.filter((s) => s !== stateCode) });
    };

    return (
        <div className="space-y-6">
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
                            value={zone.name}
                            onChange={(e) => onChange({ ...zone, name: e.target.value })}
                            placeholder="e.g., Domestic US, International Europe"
                            className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-[var(--color-bg-primary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Sort Order</label>
                        <input
                            type="number"
                            value={zone.sortOrder}
                            onChange={(e) =>
                                onChange({ ...zone, sortOrder: parseInt(e.target.value) || 0 })
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
                            checked={zone.isActive}
                            onChange={(e) => onChange({ ...zone, isActive: e.target.checked })}
                            className="accent-[var(--color-primary)]"
                        />
                        <span className="text-sm">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={zone.isDefault}
                            onChange={(e) => onChange({ ...zone, isDefault: e.target.checked })}
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
                <ChipSelectInput
                    options={countryOptions}
                    value={zone.countries}
                    onAdd={addCountry}
                    onRemove={removeCountry}
                    placeholder="Type to search countries..."
                    loading={loadingCountries}
                />
            </div>

            {/* States (optional) - when countries selected */}
            {zone.countries.length > 0 && (
                <div className="bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)] p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-blue-500" />
                        States / Provinces (Optional)
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                        Optionally limit this zone to specific states. Leave empty to cover all
                        states in the selected countries.
                    </p>
                    <ChipSelectInput
                        options={stateOptions}
                        value={zone.states}
                        onAdd={addState}
                        onRemove={removeState}
                        placeholder="Type to search states..."
                        loading={loadingStates}
                    />
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
                        type="button"
                        onClick={addMethod}
                        className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        Add Method
                    </button>
                </div>

                <div className="space-y-4">
                    {zone.methods.map((method, index) => (
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
                                                updateMethod(index, "isActive", e.target.checked)
                                            }
                                            className="accent-[var(--color-primary)]"
                                        />
                                        Active
                                    </label>
                                    {zone.methods.length > 1 && (
                                        <button
                                            type="button"
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
                                    <label className="block text-xs font-medium mb-1">Type</label>
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
                                    <label className="block text-xs font-medium mb-1">Label</label>
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
                                                    e.target.value ? parseInt(e.target.value) : null
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm hover:bg-[var(--color-bg-secondary)] transition"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 flex items-center gap-2"
                >
                    <Save size={16} />
                    {saving ? "Saving..." : isEdit ? "Update Zone" : "Create Zone"}
                </button>
            </div>
        </div>
    );
}
