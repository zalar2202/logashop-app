"use client";

import { useState, useCallback } from "react";
import { Formik, Form, FieldArray } from "formik";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { CheckboxField } from "@/components/forms/CheckboxField";
import { VariantsManager } from "@/components/products/VariantsManager";
import { productSchema, productInitialValues } from "@/schemas/product.schema";
import { slugify } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import {
    Upload,
    X,
    Image as ImageIcon,
    Star,
    GripVertical,
    Plus,
    Trash2,
    CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

/**
 * ProductForm Component
 * Comprehensive form for creating and editing products
 *
 * @param {Object} props
 * @param {Object} props.initialValues - Initial form values (for edit mode)
 * @param {Array} props.categories - List of categories for selection
 * @param {Function} props.onSubmit - Form submission handler
 * @param {boolean} props.isEdit - Whether this is edit mode
 */
export function ProductForm({
    initialValues = productInitialValues,
    categories = [],
    onSubmit,
    isEdit = false,
}) {
    const [images, setImages] = useState(initialValues.images || []);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [options, setOptions] = useState(initialValues.options || []);
    const [variants, setVariants] = useState([]);
    const [uploadingDigital, setUploadingDigital] = useState(false);

    // Digital file upload handler
    const handleDigitalUpload = async (e, setFieldValue) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingDigital(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const { data } = await axios.post("/api/admin/products/upload-digital", formData);
            if (data.success) {
                setFieldValue("digitalFile.url", data.filePath);
                setFieldValue("digitalFile.fileName", data.fileName);
                setFieldValue("digitalFile.fileSize", data.fileSize);
                toast.success("File uploaded successfully");
            }
        } catch (err) {
            toast.error("Upload failed");
            console.error(err);
        } finally {
            setUploadingDigital(false);
        }
    };

    // Image upload handler
    const onDrop = useCallback(
        async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;

            setUploadingImages(true);

            try {
                const uploadedImages = [];

                for (const file of acceptedFiles) {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("category", "products");

                    const { data } = await axios.post("/api/upload", formData);

                    if (data.success) {
                        uploadedImages.push({
                            url: data.data.url,
                            alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                            isPrimary: images.length === 0 && uploadedImages.length === 0,
                            sortOrder: images.length + uploadedImages.length,
                        });
                    }
                }

                setImages((prev) => [...prev, ...uploadedImages]);
                toast.success(`${uploadedImages.length} image(s) uploaded`);
            } catch (error) {
                toast.error("Failed to upload images");
                console.error("Upload error:", error);
            } finally {
                setUploadingImages(false);
            }
        },
        [images]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: true,
    });

    // Remove image
    const removeImage = (index) => {
        setImages((prev) => {
            const newImages = prev.filter((_, i) => i !== index);
            // If we removed the primary, make first image primary
            if (prev[index].isPrimary && newImages.length > 0) {
                newImages[0].isPrimary = true;
            }
            return newImages;
        });
    };

    // Set primary image
    const setPrimaryImage = (index) => {
        setImages((prev) =>
            prev.map((img, i) => ({
                ...img,
                isPrimary: i === index,
            }))
        );
    };

    // Handle form submission
    const handleSubmit = async (values, formikHelpers) => {
        // Process tags from string to array
        const formattedValues = {
            ...values,
            tags: values.tags
                ? values.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                : [],
            images: images,
            options: options,
            variants: variants,
        };

        await onSubmit(formattedValues, formikHelpers);
    };

    return (
        <Formik
            initialValues={{
                ...productInitialValues,
                ...initialValues,
                tags: Array.isArray(initialValues.tags)
                    ? initialValues.tags.join(", ")
                    : initialValues.tags || "",
                categoryId: initialValues.categoryId?._id || initialValues.categoryId || "",
            }}
            validationSchema={productSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ isSubmitting, setFieldValue, values }) => (
                <Form className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                <div className="space-y-4">
                                    <InputField
                                        name="name"
                                        label="Product Name"
                                        placeholder="e.g. Wireless Bluetooth Headphones"
                                        required
                                        onChange={(e) => {
                                            setFieldValue("name", e.target.value);
                                            if (!isEdit && !values.slug) {
                                                setFieldValue("slug", slugify(e.target.value));
                                            }
                                        }}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            name="slug"
                                            label="URL Slug"
                                            placeholder="wireless-bluetooth-headphones"
                                            required
                                        />
                                        <InputField
                                            name="sku"
                                            label="SKU"
                                            placeholder="WBH-001"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField
                                            name="categoryId"
                                            label="Category"
                                            options={categories}
                                            placeholder="Select Category"
                                            required
                                        />
                                        <SelectField
                                            name="productType"
                                            label="Product Type"
                                            options={[
                                                { label: "Physical", value: "physical" },
                                                { label: "Digital", value: "digital" },
                                                { label: "Bundle", value: "bundle" },
                                            ]}
                                        />
                                    </div>

                                    <InputField
                                        name="brand"
                                        label="Brand"
                                        placeholder="e.g. Sony, Apple, Samsung"
                                    />

                                    <InputField
                                        name="tags"
                                        label="Tags"
                                        placeholder="Comma separated: wireless, bluetooth, audio"
                                        helperText="Separate tags with commas"
                                    />
                                </div>
                            </Card>

                            {/* Description */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4">Description</h3>
                                <div className="space-y-4">
                                    <TextareaField
                                        name="shortDescription"
                                        label="Short Description"
                                        placeholder="Brief overview for product listings..."
                                        rows={2}
                                        helperText="Max 200 characters, shown in product cards"
                                    />
                                    <TextareaField
                                        name="description"
                                        label="Full Description"
                                        placeholder="Detailed product description..."
                                        rows={6}
                                        required
                                    />
                                </div>
                            </Card>

                            {/* Images */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4">Product Images</h3>

                                {/* Dropzone */}
                                <div
                                    {...getRootProps()}
                                    className={`
                                        relative rounded-lg border-2 border-dashed p-6 mb-4
                                        transition-all duration-200 cursor-pointer
                                        ${isDragActive ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border)]"}
                                        ${uploadingImages ? "opacity-50 pointer-events-none" : ""}
                                        hover:border-[var(--color-primary)]/50
                                    `}
                                >
                                    <input {...getInputProps()} />
                                    <div className="text-center">
                                        <Upload
                                            className={`w-10 h-10 mx-auto mb-2 ${isDragActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"}`}
                                        />
                                        <p className="text-sm text-[var(--color-text-primary)]">
                                            {isDragActive ? (
                                                "Drop images here..."
                                            ) : (
                                                <>
                                                    <span className="text-[var(--color-primary)] font-medium">
                                                        Click to upload
                                                    </span>
                                                    {" or drag and drop"}
                                                </>
                                            )}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                            PNG, JPG, WebP up to 5MB each
                                        </p>
                                    </div>
                                    {uploadingImages && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-background)]/80 rounded-lg">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Image Grid */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {images.map((image, index) => (
                                            <div
                                                key={index}
                                                className={`
                                                    relative group aspect-square rounded-lg overflow-hidden border-2
                                                    ${image.isPrimary ? "border-[var(--color-primary)]" : "border-[var(--color-border)]"}
                                                `}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={image.alt}
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPrimaryImage(index)}
                                                        className={`p-2 rounded-full ${image.isPrimary ? "bg-yellow-500" : "bg-white/80 hover:bg-white"}`}
                                                        title={
                                                            image.isPrimary
                                                                ? "Primary image"
                                                                : "Set as primary"
                                                        }
                                                    >
                                                        <Star
                                                            size={16}
                                                            className={
                                                                image.isPrimary
                                                                    ? "text-white fill-white"
                                                                    : "text-gray-700"
                                                            }
                                                        />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                                                        title="Remove image"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>

                                                {/* Primary Badge */}
                                                {image.isPrimary && (
                                                    <span className="absolute top-2 left-2 bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {images.length === 0 && (
                                    <p className="text-center text-[var(--color-text-secondary)] text-sm py-4">
                                        No images uploaded yet
                                    </p>
                                )}
                            </Card>

                            {/* Variants */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4">Product Variants</h3>
                                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                                    Add options like Color or Size to create product variants with
                                    different prices and stock.
                                </p>
                                <VariantsManager
                                    options={options}
                                    variants={variants}
                                    onOptionsChange={setOptions}
                                    onVariantsChange={setVariants}
                                />
                            </Card>

                            {/* SEO */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4">SEO</h3>
                                <div className="space-y-4">
                                    <InputField
                                        name="metaTitle"
                                        label="Meta Title"
                                        placeholder="SEO title (max 60 characters)"
                                        helperText="Leave blank to use product name"
                                    />
                                    <TextareaField
                                        name="metaDescription"
                                        label="Meta Description"
                                        placeholder="SEO description (max 160 characters)"
                                        rows={2}
                                        helperText="Leave blank to use short description"
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar - Right Column */}
                        <div className="space-y-6">
                            {/* Status */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4">Status</h3>
                                <div className="space-y-4">
                                    <SelectField
                                        name="status"
                                        label="Visibility"
                                        options={[
                                            { label: "Draft", value: "draft" },
                                            { label: "Active", value: "active" },
                                            { label: "Archived", value: "archived" },
                                        ]}
                                    />
                                    <CheckboxField
                                        name="isFeatured"
                                        label="Featured Product"
                                        description="Show on homepage and featured sections"
                                    />
                                </div>
                            </Card>

                            {/* Pricing */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                                <div className="space-y-4">
                                    <InputField
                                        name="basePrice"
                                        type="number"
                                        label="Base Price ($)"
                                        placeholder="0.00"
                                        required
                                    />
                                    <InputField
                                        name="salePrice"
                                        type="number"
                                        label="Sale Price ($)"
                                        placeholder="Optional"
                                        helperText="Leave empty if not on sale"
                                    />
                                </div>
                            </Card>

                            {/* Inventory */}
                            <Card>
                                <h3 className="text-lg font-semibold mb-4">Inventory</h3>
                                <div className="space-y-4">
                                    <CheckboxField
                                        name="trackInventory"
                                        label="Track Inventory"
                                        description="Enable stock management"
                                    />
                                    <InputField
                                        name="stockQuantity"
                                        type="number"
                                        label="Stock Quantity"
                                        placeholder="0"
                                    />
                                    <InputField
                                        name="lowStockThreshold"
                                        type="number"
                                        label="Low Stock Alert"
                                        placeholder="5"
                                        helperText="Get notified when stock falls below"
                                    />
                                    <CheckboxField
                                        name="allowBackorder"
                                        label="Allow Backorders"
                                        description="Accept orders when out of stock"
                                    />
                                </div>
                            </Card>

                            {/* Physical Specs (only for physical products) */}
                            {values.productType === "physical" && (
                                <Card>
                                    <h3 className="text-lg font-semibold mb-4">Shipping</h3>
                                    <div className="space-y-4">
                                        <InputField
                                            name="weight"
                                            type="number"
                                            label="Weight (grams)"
                                            placeholder="0"
                                        />
                                    </div>
                                </Card>
                            )}

                            {/* Digital Product Settings */}
                            {values.productType === "digital" && (
                                <Card>
                                    <h3 className="text-lg font-semibold mb-4">Digital Identity</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                                            <p className="block text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                                                Product File
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="file"
                                                    onChange={(e) =>
                                                        handleDigitalUpload(e, setFieldValue)
                                                    }
                                                    className="block w-full text-sm text-[var(--color-text-secondary)]
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-[var(--color-primary)] file:text-white
                                                    hover:file:bg-opacity-90"
                                                />
                                                {uploadingDigital && (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)]"></div>
                                                )}
                                            </div>
                                            {values.digitalFile?.url && (
                                                <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                                                    <CheckCircle size={16} />
                                                    <span className="truncate max-w-xs">
                                                        {values.digitalFile.fileName}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFieldValue("digitalFile.url", "");
                                                            setFieldValue(
                                                                "digitalFile.fileName",
                                                                ""
                                                            );
                                                        }}
                                                        className="ml-auto text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                name="digitalFile.downloadLimit"
                                                type="number"
                                                label="Download Limit"
                                                placeholder="Unlimited"
                                                helperText="Max times a user can download"
                                            />
                                            <InputField
                                                name="digitalFile.expiryDays"
                                                type="number"
                                                label="Expiry (Days)"
                                                placeholder="Lifetime"
                                                helperText="Days until link expires"
                                            />
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-[var(--color-border)]">
                        <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {isEdit ? "Update Product" : "Create Product"}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
