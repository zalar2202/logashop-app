"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { Badge } from "@/components/common/Badge";
import { Plus, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

/**
 * VariantsManager Component
 * Manages product options (Color, Size, etc.) and generates variants
 *
 * @param {Object} props
 * @param {Array} props.options - Current product options [{name: "Color", values: ["Red", "Blue"]}]
 * @param {Array} props.variants - Current variants [{sku, attributes, price, stockQuantity}]
 * @param {Function} props.onOptionsChange - Callback when options change
 * @param {Function} props.onVariantsChange - Callback when variants change
 */
export function VariantsManager({
    options = [],
    variants = [],
    onOptionsChange,
    onVariantsChange,
}) {
    const [localOptions, setLocalOptions] = useState(options);
    const [localVariants, setLocalVariants] = useState(variants);
    const [showVariants, setShowVariants] = useState(variants.length > 0);
    const [newOptionName, setNewOptionName] = useState("");
    const [newOptionValues, setNewOptionValues] = useState("");

    // Sync with parent
    useEffect(() => {
        onOptionsChange?.(localOptions);
    }, [localOptions]);

    useEffect(() => {
        onVariantsChange?.(localVariants);
    }, [localVariants]);

    // Add a new option (e.g., Color, Size)
    const addOption = () => {
        if (!newOptionName.trim()) {
            toast.error("Please enter an option name");
            return;
        }
        if (!newOptionValues.trim()) {
            toast.error("Please enter at least one value");
            return;
        }

        const values = newOptionValues
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);

        if (values.length === 0) {
            toast.error("Please enter valid values");
            return;
        }

        // Check for duplicate option names
        if (localOptions.some((o) => o.name.toLowerCase() === newOptionName.trim().toLowerCase())) {
            toast.error("This option already exists");
            return;
        }

        setLocalOptions([...localOptions, { name: newOptionName.trim(), values }]);
        setNewOptionName("");
        setNewOptionValues("");

        // Generate variants if we have options
        generateVariants([...localOptions, { name: newOptionName.trim(), values }]);
    };

    // Remove an option
    const removeOption = (index) => {
        const newOptions = localOptions.filter((_, i) => i !== index);
        setLocalOptions(newOptions);

        if (newOptions.length === 0) {
            setLocalVariants([]);
        } else {
            generateVariants(newOptions);
        }
    };

    // Add a value to an existing option
    const addValueToOption = (optionIndex, newValue) => {
        if (!newValue.trim()) return;

        const updated = localOptions.map((opt, i) => {
            if (i === optionIndex) {
                if (opt.values.includes(newValue.trim())) {
                    toast.error("Value already exists");
                    return opt;
                }
                return { ...opt, values: [...opt.values, newValue.trim()] };
            }
            return opt;
        });

        setLocalOptions(updated);
        generateVariants(updated);
    };

    // Remove a value from an option
    const removeValueFromOption = (optionIndex, valueIndex) => {
        const updated = localOptions.map((opt, i) => {
            if (i === optionIndex) {
                const newValues = opt.values.filter((_, vi) => vi !== valueIndex);
                return { ...opt, values: newValues };
            }
            return opt;
        });

        // Remove empty options
        const filtered = updated.filter((opt) => opt.values.length > 0);
        setLocalOptions(filtered);

        if (filtered.length === 0) {
            setLocalVariants([]);
        } else {
            generateVariants(filtered);
        }
    };

    // Generate all variant combinations from options
    const generateVariants = (opts) => {
        if (!opts || opts.length === 0) {
            setLocalVariants([]);
            return;
        }

        // Generate cartesian product of all option values
        const combinations = opts.reduce((acc, option) => {
            if (acc.length === 0) {
                return option.values.map((value) => ({ [option.name]: value }));
            }
            return acc.flatMap((combo) =>
                option.values.map((value) => ({ ...combo, [option.name]: value }))
            );
        }, []);

        // Create variants from combinations, preserving existing data if matching
        const newVariants = combinations.map((attributes, index) => {
            const attrKey = JSON.stringify(attributes);
            const existingVariant = localVariants.find(
                (v) => JSON.stringify(Object.fromEntries(v.attributes || new Map())) === attrKey
            );

            if (existingVariant) {
                return existingVariant;
            }

            return {
                sku: "",
                attributes: new Map(Object.entries(attributes)),
                price: null,
                salePrice: null,
                stockQuantity: 0,
                isActive: true,
            };
        });

        setLocalVariants(newVariants);
        setShowVariants(true);
    };

    // Update a variant field
    const updateVariant = (index, field, value) => {
        const updated = localVariants.map((v, i) => {
            if (i === index) {
                return { ...v, [field]: value };
            }
            return v;
        });
        setLocalVariants(updated);
    };

    // Get variant display name from attributes
    const getVariantName = (variant) => {
        const attrs =
            variant.attributes instanceof Map
                ? Object.fromEntries(variant.attributes)
                : variant.attributes || {};
        return Object.values(attrs).join(" / ");
    };

    return (
        <div className="space-y-6">
            {/* Add New Option */}
            <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]">
                <h4 className="font-medium mb-3">Add Option</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                            Option Name
                        </label>
                        <input
                            type="text"
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            placeholder="e.g. Color, Size"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-elevated)] text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                            Values (comma separated)
                        </label>
                        <input
                            type="text"
                            value={newOptionValues}
                            onChange={(e) => setNewOptionValues(e.target.value)}
                            placeholder="e.g. Red, Blue, Green"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-elevated)] text-sm"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button type="button" onClick={addOption} icon={<Plus size={16} />}>
                            Add Option
                        </Button>
                    </div>
                </div>
            </div>

            {/* Current Options */}
            {localOptions.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium">Product Options</h4>
                    {localOptions.map((option, optIndex) => (
                        <div
                            key={optIndex}
                            className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-elevated)]"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium">{option.name}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(optIndex)}
                                    className="text-red-500"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {option.values.map((value, valIndex) => (
                                    <Badge
                                        key={valIndex}
                                        variant="neutral"
                                        className="flex items-center gap-1"
                                    >
                                        {value}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeValueFromOption(optIndex, valIndex)
                                            }
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X size={12} />
                                        </button>
                                    </Badge>
                                ))}
                                <AddValueInput onAdd={(val) => addValueToOption(optIndex, val)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Variants Table */}
            {localVariants.length > 0 && (
                <div>
                    <button
                        type="button"
                        onClick={() => setShowVariants(!showVariants)}
                        className="flex items-center gap-2 font-medium mb-3 hover:text-[var(--color-primary)]"
                    >
                        {showVariants ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        Variants ({localVariants.length})
                    </button>

                    {showVariants && (
                        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-[var(--color-background-elevated)]">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Variant</th>
                                        <th className="px-4 py-2 text-left font-medium">SKU</th>
                                        <th className="px-4 py-2 text-left font-medium">
                                            Price Override
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium">Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {localVariants.map((variant, index) => (
                                        <tr
                                            key={index}
                                            className="border-t border-[var(--color-border)]"
                                        >
                                            <td className="px-4 py-2 font-medium">
                                                {getVariantName(variant)}
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={variant.sku || ""}
                                                    onChange={(e) =>
                                                        updateVariant(index, "sku", e.target.value)
                                                    }
                                                    placeholder="Variant SKU"
                                                    className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-background)] text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={variant.price ?? ""}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            "price",
                                                            e.target.value
                                                                ? Number(e.target.value)
                                                                : null
                                                        )
                                                    }
                                                    placeholder="Use base price"
                                                    className="w-24 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-background)] text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={variant.stockQuantity || 0}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            "stockQuantity",
                                                            Number(e.target.value) || 0
                                                        )
                                                    }
                                                    className="w-20 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-background)] text-sm"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {localOptions.length === 0 && (
                <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">
                    No options added. Add options like "Color" or "Size" to create product variants.
                </p>
            )}
        </div>
    );
}

// Small inline component to add values
function AddValueInput({ onAdd }) {
    const [value, setValue] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (value.trim()) {
            onAdd(value.trim());
            setValue("");
            setIsAdding(false);
        }
    };

    if (!isAdding) {
        return (
            <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-xs text-[var(--color-primary)] hover:underline"
            >
                + Add value
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                placeholder="New value"
                className="w-24 px-2 py-0.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-background)]"
                autoFocus
            />
            <button type="button" onClick={handleAdd} className="text-[var(--color-primary)]">
                <Plus size={14} />
            </button>
            <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[var(--color-text-secondary)]"
            >
                <X size={14} />
            </button>
        </div>
    );
}
