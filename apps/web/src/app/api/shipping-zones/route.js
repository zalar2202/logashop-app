import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ShippingZone from "@/models/ShippingZone";

/**
 * GET /api/shipping-zones
 *
 * Public:  ?country=US&state=CA  → returns matching zone with active methods
 * Admin:   (no query params)     → returns all zones for management
 */
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const country = searchParams.get("country");
        const state = searchParams.get("state");

        // Public lookup — find zone for specific address
        if (country) {
            const zone = await ShippingZone.findZoneForAddress(
                country.toUpperCase(),
                state?.toUpperCase() || null
            );

            if (!zone) {
                return NextResponse.json({
                    success: true,
                    data: null,
                    message: "No shipping zone found for this location",
                });
            }

            // Return only active methods
            const activeMethods = zone.methods.filter((m) => m.isActive);

            return NextResponse.json({
                success: true,
                data: {
                    zoneId: zone._id,
                    zoneName: zone.name,
                    methods: activeMethods.map((m) => ({
                        methodId: m.methodId,
                        label: m.label,
                        description: m.description,
                        price: m.price,
                        freeThreshold: m.freeThreshold,
                        estimatedDays: m.estimatedDays,
                    })),
                },
            });
        }

        // Admin/manager — return all zones
        const user = await verifyAuth(req);
        if (user.role !== "admin" && user.role !== "manager") {
            return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
        }

        const zones = await ShippingZone.find().sort({ sortOrder: 1, createdAt: -1 });

        return NextResponse.json({ success: true, data: zones });
    } catch (error) {
        console.error("GET /api/shipping-zones error:", error);
        if (error.message === "Not authenticated") {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/shipping-zones — Create a new shipping zone (admin only)
 */
export async function POST(req) {
    try {
        await dbConnect();
        const user = await verifyAuth(req);

        if (user.role !== "admin" && user.role !== "manager") {
            return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
        }

        const body = await req.json();
        const { name, countries, states, methods, isDefault, isActive, sortOrder } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { success: false, error: "Zone name is required" },
                { status: 400 }
            );
        }

        if (!methods || methods.length === 0) {
            return NextResponse.json(
                { success: false, error: "At least one shipping method is required" },
                { status: 400 }
            );
        }

        // Sync indexes to drop the old parallel-array index if it exists
        await ShippingZone.syncIndexes();

        const zone = await ShippingZone.create({
            name: name.trim(),
            countries: countries || [],
            states: states || [],
            methods,
            isDefault: isDefault || false,
            isActive: isActive !== false,
            sortOrder: sortOrder || 0,
        });

        return NextResponse.json({ success: true, data: zone }, { status: 201 });
    } catch (error) {
        console.error("POST /api/shipping-zones error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
