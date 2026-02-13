"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Star, X, AlertCircle, Check } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

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

const EMPTY_ADDRESS = {
    label: "",
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
    isDefault: false,
};

export default function AddressBookPage() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null); // address ID being edited
    const [form, setForm] = useState(EMPTY_ADDRESS);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get("/api/addresses");
            if (data.success) {
                setAddresses(data.data);
            }
        } catch (error) {
            console.error("Fetch addresses error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const resetForm = () => {
        setForm(EMPTY_ADDRESS);
        setEditing(null);
        setShowForm(false);
        setErrors({});
    };

    const openEditForm = (addr) => {
        setForm({
            label: addr.label || "",
            firstName: addr.firstName,
            lastName: addr.lastName,
            company: addr.company || "",
            address1: addr.address1,
            address2: addr.address2 || "",
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country || "US",
            phone: addr.phone || "",
            isDefault: addr.isDefault || false,
        });
        setEditing(addr._id);
        setShowForm(true);
    };

    const validate = () => {
        const newErrors = {};
        if (!form.firstName.trim()) newErrors.firstName = "Required";
        if (!form.lastName.trim()) newErrors.lastName = "Required";
        if (!form.address1.trim()) newErrors.address1 = "Required";
        if (!form.city.trim()) newErrors.city = "Required";
        if (!form.state.trim()) newErrors.state = "Required";
        if (!form.zipCode.trim()) newErrors.zipCode = "Required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            if (editing) {
                await axios.put("/api/addresses", { addressId: editing, ...form });
                toast.success("Address updated!");
            } else {
                await axios.post("/api/addresses", form);
                toast.success("Address added!");
            }
            resetForm();
            await fetchAddresses();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (addressId) => {
        if (!confirm("Delete this address?")) return;
        try {
            await axios.delete(`/api/addresses?addressId=${addressId}`);
            toast.success("Address deleted");
            await fetchAddresses();
        } catch (error) {
            toast.error("Failed to delete address");
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await axios.put("/api/addresses", {
                addressId,
                isDefault: true,
            });
            toast.success("Default address updated");
            await fetchAddresses();
        } catch (error) {
            toast.error("Failed to set default");
        }
    };

    const Input = ({
        label,
        name,
        value,
        onChange,
        error,
        required,
        placeholder,
        type = "text",
    }) => (
        <div>
            <label className="block text-sm font-medium mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                    error ? "border-red-500" : "border-[var(--color-border)]"
                } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-white text-sm`}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {error}
                </p>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Address Book</h2>
                {!showForm && (
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition"
                    >
                        <Plus size={16} /> Add Address
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold">{editing ? "Edit Address" : "New Address"}</h3>
                        <button
                            onClick={resetForm}
                            className="p-1 rounded hover:bg-gray-100 transition"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Input
                                label="Label"
                                value={form.label}
                                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                                placeholder='e.g. "Home", "Office"'
                            />
                        </div>
                        <Input
                            label="First Name"
                            value={form.firstName}
                            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                            error={errors.firstName}
                            required
                        />
                        <Input
                            label="Last Name"
                            value={form.lastName}
                            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                            error={errors.lastName}
                            required
                        />
                        <div className="sm:col-span-2">
                            <Input
                                label="Company"
                                value={form.company}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, company: e.target.value }))
                                }
                                placeholder="Optional"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Input
                                label="Address Line 1"
                                value={form.address1}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, address1: e.target.value }))
                                }
                                error={errors.address1}
                                required
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Input
                                label="Address Line 2"
                                value={form.address2}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, address2: e.target.value }))
                                }
                                placeholder="Apt, Suite, etc."
                            />
                        </div>
                        <Input
                            label="City"
                            value={form.city}
                            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                            error={errors.city}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                State <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.state}
                                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                                className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
                                    errors.state ? "border-red-500" : "border-[var(--color-border)]"
                                } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-white`}
                            >
                                <option value="">Select State</option>
                                {US_STATES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="ZIP Code"
                            value={form.zipCode}
                            onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
                            error={errors.zipCode}
                            required
                        />
                        <Input
                            label="Phone"
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                            type="tel"
                            placeholder="Optional"
                        />
                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isDefault}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            isDefault: e.target.checked,
                                        }))
                                    }
                                    className="accent-[var(--color-primary)]"
                                />
                                <span className="text-sm">Set as default address</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            onClick={resetForm}
                            className="px-5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    {editing ? "Update Address" : "Save Address"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Address List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : addresses.length === 0 && !showForm ? (
                <div className="bg-white rounded-xl border border-[var(--color-border)] text-center py-16 px-4">
                    <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-lg font-medium mb-1">No saved addresses</p>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                        Add a shipping address for faster checkout.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition"
                    >
                        <Plus size={16} /> Add Your First Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                        <div
                            key={addr._id}
                            className={`bg-white rounded-xl border-2 p-5 relative ${
                                addr.isDefault
                                    ? "border-[var(--color-primary)]"
                                    : "border-[var(--color-border)]"
                            }`}
                        >
                            {/* Default Badge */}
                            {addr.isDefault && (
                                <span className="absolute top-3 right-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    <Star size={10} /> Default
                                </span>
                            )}

                            {/* Label */}
                            {addr.label && (
                                <p className="text-xs font-medium text-[var(--color-primary)] mb-1 uppercase tracking-wider">
                                    {addr.label}
                                </p>
                            )}

                            <p className="font-medium text-sm">
                                {addr.firstName} {addr.lastName}
                            </p>
                            {addr.company && (
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    {addr.company}
                                </p>
                            )}
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
                                {addr.address1}
                                {addr.address2 && <>, {addr.address2}</>}
                                <br />
                                {addr.city}, {addr.state} {addr.zipCode}
                            </p>
                            {addr.phone && (
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                    📞 {addr.phone}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--color-border)]">
                                <button
                                    onClick={() => openEditForm(addr)}
                                    className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                                >
                                    <Edit2 size={12} /> Edit
                                </button>
                                {!addr.isDefault && (
                                    <>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={() => handleSetDefault(addr._id)}
                                            className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                                        >
                                            <Star size={12} /> Set Default
                                        </button>
                                    </>
                                )}
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={() => handleDelete(addr._id)}
                                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
