import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";

/**
 * PUT /api/reviews/[id] — Update review (Admin moderation)
 */
export async function PUT(req, { params }) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        if (user.role !== "admin" && user.role !== "manager") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();

        // Admins primarily update status or comment
        const review = await Review.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!review) {
            return NextResponse.json(
                { success: false, error: "Review not found" },
                { status: 404 }
            );
        }

        // Stats are updated via model hooks in Review.js

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(review)),
        });
    } catch (error) {
        console.error("PUT /api/reviews/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/reviews/[id] — Delete review
 */
export async function DELETE(req, { params }) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        if (user.role !== "admin" && user.role !== "manager") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return NextResponse.json(
                { success: false, error: "Review not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        console.error("DELETE /api/reviews/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
