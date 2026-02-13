import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";

/**
 * GET /api/addresses — Get saved addresses for logged-in user
 */
export async function GET(req) {
    try {
        await dbConnect();
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const addresses = await Address.find({ userId: user._id })
            .sort({ isDefault: -1, updatedAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(addresses)),
        });
    } catch (error) {
        console.error("GET /api/addresses error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/addresses — Save a new address
 */
export async function POST(req) {
    try {
        await dbConnect();
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const address = new Address({
            userId: user._id,
            ...body,
        });
        await address.save();

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(address)),
        });
    } catch (error) {
        console.error("POST /api/addresses error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/addresses?id=xxx — Delete an address
 */
export async function DELETE(req) {
    try {
        await dbConnect();
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Address ID required" },
                { status: 400 }
            );
        }

        const address = await Address.findOneAndDelete({
            _id: id,
            userId: user._id,
        });

        if (!address) {
            return NextResponse.json(
                { success: false, error: "Address not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/addresses error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
