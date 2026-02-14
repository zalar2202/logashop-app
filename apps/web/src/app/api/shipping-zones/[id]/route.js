import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ShippingZone from "@/models/ShippingZone";

/**
 * GET /api/shipping-zones/[id] — Get single zone (admin)
 */
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const user = await verifyAuth(req);

        if (user.role !== "admin") {
            return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
        }

        const { id } = await params;
        const zone = await ShippingZone.findById(id);

        if (!zone) {
            return NextResponse.json(
                { success: false, error: "Shipping zone not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: zone });
    } catch (error) {
        console.error("GET /api/shipping-zones/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/shipping-zones/[id] — Update a shipping zone (admin)
 */
export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const user = await verifyAuth(req);

        if (user.role !== "admin") {
            return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, countries, states, methods, isDefault, isActive, sortOrder } = body;

        const zone = await ShippingZone.findById(id);
        if (!zone) {
            return NextResponse.json(
                { success: false, error: "Shipping zone not found" },
                { status: 404 }
            );
        }

        if (name !== undefined) zone.name = name.trim();
        if (countries !== undefined) zone.countries = countries;
        if (states !== undefined) zone.states = states;
        if (methods !== undefined) zone.methods = methods;
        if (isDefault !== undefined) zone.isDefault = isDefault;
        if (isActive !== undefined) zone.isActive = isActive;
        if (sortOrder !== undefined) zone.sortOrder = sortOrder;

        await zone.save();

        return NextResponse.json({ success: true, data: zone });
    } catch (error) {
        console.error("PUT /api/shipping-zones/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/shipping-zones/[id] — Delete a shipping zone (admin)
 */
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const user = await verifyAuth(req);

        if (user.role !== "admin") {
            return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
        }

        const { id } = await params;
        const zone = await ShippingZone.findById(id);

        if (!zone) {
            return NextResponse.json(
                { success: false, error: "Shipping zone not found" },
                { status: 404 }
            );
        }

        if (zone.isDefault) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Cannot delete the default shipping zone. Set another zone as default first.",
                },
                { status: 400 }
            );
        }

        await ShippingZone.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: "Shipping zone deleted" });
    } catch (error) {
        console.error("DELETE /api/shipping-zones/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
