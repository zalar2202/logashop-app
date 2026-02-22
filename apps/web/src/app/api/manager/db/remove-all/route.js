/**
 * POST /api/manager/db/remove-all
 * Remove all data from DB except users collection (manager only).
 * Keeps User and RefreshToken so the logged-in user stays.
 */

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";

const SKIP_COLLECTIONS = ["users", "refreshtokens"];

export async function POST(req) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "manager") {
            return NextResponse.json({ success: false, error: "Manager access required" }, { status: 403 });
        }

        await dbConnect();

        const conn = mongoose.connection;
        const db = conn.db;
        const collections = await db.listCollections().toArray();
        const toSkip = new Set(SKIP_COLLECTIONS.map((c) => c.toLowerCase()));

        const results = [];
        for (const { name } of collections) {
            const nameLower = name.toLowerCase();
            if (toSkip.has(nameLower)) {
                results.push({ collection: name, deleted: 0, skipped: true });
                continue;
            }

            const result = await db.collection(name).deleteMany({});
            results.push({ collection: name, deleted: result.deletedCount, skipped: false });
        }

        const totalDeleted = results.reduce((sum, r) => sum + (r.deleted || 0), 0);

        return NextResponse.json({
            success: true,
            message: `Removed all data except users (${totalDeleted} documents deleted)`,
            results: results.filter((r) => !r.skipped && r.deleted > 0),
        });
    } catch (error) {
        console.error("[remove-all API]", error);
        return NextResponse.json(
            { success: false, error: error.message || "Remove all failed" },
            { status: 500 }
        );
    }
}
