import * as Yup from "yup";

/**
 * Product Validation Schema
 * Used for form validation in product create/edit pages
 */
export const productSchema = Yup.object().shape({
    name: Yup.string()
        .required("Product name is required")
        .max(100, "Name cannot exceed 100 characters"),
    slug: Yup.string()
        .required("Slug is required")
        .matches(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    sku: Yup.string().required("SKU is required").max(50, "SKU cannot exceed 50 characters"),
    description: Yup.string()
        .required("Description is required")
        .test("not-empty-html", "Description is required", (val) => {
            if (!val || typeof val !== "string") return false;
            const stripped = val.replace(/<[^>]*>/g, "").trim();
            return stripped.length > 0;
        }),
    shortDescription: Yup.string().max(200, "Short description cannot exceed 200 characters"),
    productType: Yup.string()
        .oneOf(["physical", "digital", "bundle"], "Invalid product type")
        .default("physical"),
    categoryId: Yup.string().required("Category is required"),
    tags: Yup.array().of(Yup.string()).default([]),
    brand: Yup.string(),
    basePrice: Yup.number().required("Base price is required").min(0, "Price must be positive"),
    salePrice: Yup.number()
        .nullable()
        .min(0, "Sale price must be positive")
        .test("less-than-base", "Sale price must be less than base price", function (value) {
            if (!value) return true;
            return value < this.parent.basePrice;
        }),
    status: Yup.string().oneOf(["draft", "active", "archived"], "Invalid status").default("draft"),
    isFeatured: Yup.boolean().default(false),
    trackInventory: Yup.boolean().default(true),
    stockQuantity: Yup.number().min(0, "Stock cannot be negative").default(0),
    lowStockThreshold: Yup.number().min(0, "Threshold cannot be negative").default(5),
    allowBackorder: Yup.boolean().default(false),
    weight: Yup.number().min(0, "Weight cannot be negative").default(0),
    metaTitle: Yup.string().max(60, "Meta title should be under 60 characters"),
    metaDescription: Yup.string().max(160, "Meta description should be under 160 characters"),
    digitalFile: Yup.object().shape({
        url: Yup.string().when("$productType", {
            is: "digital",
            then: () => Yup.string().required("File is required for digital products"),
            otherwise: () => Yup.string(),
        }),
        fileName: Yup.string(),
        downloadLimit: Yup.number().nullable().min(0),
        expiryDays: Yup.number().nullable().min(0),
    }),
});

/**
 * Initial values for product form
 */
export const productInitialValues = {
    name: "",
    slug: "",
    sku: "",
    description: "",
    shortDescription: "",
    productType: "physical",
    categoryId: "",
    tags: [],
    brand: "",
    basePrice: 0,
    salePrice: null,
    status: "draft",
    isFeatured: false,
    trackInventory: true,
    stockQuantity: 0,
    lowStockThreshold: 5,
    allowBackorder: false,
    weight: 0,
    images: [],
    metaTitle: "",
    metaDescription: "",
    digitalFile: {
        url: "",
        fileName: "",
        downloadLimit: null,
        expiryDays: null,
    },
};
