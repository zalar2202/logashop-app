import mongoose from "mongoose";

/**
 * Shipping Method Schema (embedded in ShippingZone)
 *
 * Each zone can offer multiple shipping methods with independent pricing.
 */
const ShippingMethodSchema = new mongoose.Schema(
    {
        // Method identifier
        methodId: {
            type: String,
            required: true,
            enum: ["standard", "express", "overnight", "pickup"],
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        // Price in cents
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        // Subtotal threshold for free shipping (in cents), null = never free
        freeThreshold: {
            type: Number,
            default: null,
        },
        // Estimated delivery time (display string)
        estimatedDays: {
            type: String,
            trim: true,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

/**
 * Shipping Zone Schema
 *
 * Defines a geographic zone with specific shipping methods and rates.
 * Zones are matched by country code and optionally by state/province.
 *
 * Matching priority:
 *   1. Zone with matching country + state
 *   2. Zone with matching country (no states = whole country)
 *   3. Default zone (isDefault: true) as fallback
 */
const ShippingZoneSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Zone name is required"],
            trim: true,
        },
        // Countries included in this zone (ISO 3166-1 alpha-2 codes, e.g. "US", "CA", "GB")
        countries: [
            {
                type: String,
                uppercase: true,
                trim: true,
            },
        ],
        // Optional: specific states/provinces within the countries
        // If empty, the zone applies to all states in the listed countries
        states: [
            {
                type: String,
                uppercase: true,
                trim: true,
            },
        ],
        // Shipping methods available in this zone
        methods: [ShippingMethodSchema],

        // If true, this zone is the fallback for unmatched addresses
        isDefault: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Sort priority — lower = higher priority when matching
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Ensure only one default zone
ShippingZoneSchema.pre("save", async function () {
    if (this.isDefault) {
        await mongoose.models.ShippingZone.updateMany(
            { _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
});

// Index for efficient zone lookups
// Note: MongoDB cannot index two array fields in one compound index ("parallel arrays" error).
// Use countries + isActive only; state filtering is done in-memory.
ShippingZoneSchema.index({ countries: 1, isActive: 1 });
ShippingZoneSchema.index({ isDefault: 1 });

/**
 * Static: Find the best matching zone for a given address
 * @param {string} country - ISO country code (e.g. "US")
 * @param {string} state - State/province code (e.g. "CA")
 * @returns {Object|null} The matching zone
 */
ShippingZoneSchema.statics.findZoneForAddress = async function (country, state) {
    // Priority 1: Zone matching both country AND state
    if (state) {
        const stateZone = await this.findOne({
            isActive: true,
            countries: country,
            states: state,
        }).sort({ sortOrder: 1 });

        if (stateZone) return stateZone;
    }

    // Priority 2: Zone matching country with no states specified (whole country)
    const countryZone = await this.findOne({
        isActive: true,
        countries: country,
        $or: [{ states: { $size: 0 } }, { states: { $exists: false } }],
    }).sort({ sortOrder: 1 });

    if (countryZone) return countryZone;

    // Priority 3: Default fallback zone
    const defaultZone = await this.findOne({
        isActive: true,
        isDefault: true,
    });

    return defaultZone;
};

export default mongoose.models.ShippingZone || mongoose.model("ShippingZone", ShippingZoneSchema);
