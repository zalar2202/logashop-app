import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import DigitalDelivery from "@/models/DigitalDelivery";
import Product from "@/models/Product"; // Populate ref

export async function GET(req) {
    try {
        await dbConnect();
        const user = await verifyAuth(req).catch(() => null);

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const downloads = await DigitalDelivery.find({ userId: user._id })
            .populate("productId", "name images digitalFile") // Only need name, images
            .populate("orderId", "orderNumber") // Provide order number reference
            .sort({ createdAt: -1 })
            .lean();

        // Check active status
        const processedDownloads = downloads.map((item) => ({
            ...item,
            isValid:
                item.status === "active" &&
                (!item.expiresAt || new Date() < new Date(item.expiresAt)) &&
                (item.maxDownloads === null || item.downloadCount < item.maxDownloads),
            // We can also override status if logic says expired but DB status is stuck at 'active'
            // In DB we usually store status 'revoked', 'expired'. But expiry is dynamic.
            // Let's pass full item and let frontend decide or backend compute 'statusDisplay'.
            status:
                item.expiresAt && new Date() > new Date(item.expiresAt) ? "expired" : item.status,
        }));

        return NextResponse.json({
            success: true,
            downloads: processedDownloads,
        });
    } catch (error) {
        console.error("GET /api/account/downloads error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
