import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { uploadFile } from "@/lib/storage";

/**
 * GET /api/users/[id] — Get one user (admin/manager only).
 */
export async function GET(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return errorResponse("Not authenticated", 401);
        if (user.role !== "admin" && user.role !== "manager") {
            return errorResponse("Forbidden", 403);
        }

        await dbConnect();

        const { id } = await params;
        if (!id) return errorResponse("User ID required", 400);

        const doc = await User.findById(id).select("-password -resetPasswordToken -resetPasswordExpires -fcmTokens").lean();
        if (!doc) return errorResponse("User not found", 404);

        const userObj = JSON.parse(JSON.stringify(doc));
        userObj.id = userObj._id?.toString();

        return NextResponse.json({ user: userObj });
    } catch (error) {
        console.error("GET /api/users/[id] error:", error);
        return errorResponse(error.message, 500);
    }
}

/**
 * PUT /api/users/[id] — Update user (admin/manager only).
 * Body: JSON or FormData (name, email, password optional, role, status, phone, technicalDetails, avatar file).
 */
export async function PUT(req, { params }) {
    try {
        const authUser = await verifyAuth(req);
        if (!authUser) return errorResponse("Not authenticated", 401);
        if (authUser.role !== "admin" && authUser.role !== "manager") {
            return errorResponse("Forbidden", 403);
        }

        await dbConnect();

        const { id } = await params;
        if (!id) return errorResponse("User ID required", 400);

        const fullUser = await User.findById(id).select("+password");
        if (!fullUser) return errorResponse("User not found", 404);
        if (fullUser.accountDeletedAt) return errorResponse("User not found", 404);

        const contentType = req.headers.get("content-type") || "";
        let body = {};

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            body.name = formData.get("name");
            body.email = formData.get("email");
            body.password = formData.get("password");
            body.role = formData.get("role");
            body.status = formData.get("status");
            body.phone = formData.get("phone");
            const tech = formData.get("technicalDetails");
            if (tech && typeof tech === "string") {
                try {
                    body.technicalDetails = JSON.parse(tech);
                } catch {
                    body.technicalDetails = undefined;
                }
            }
            const avatarFile = formData.get("avatar");
            if (avatarFile && avatarFile.size > 0) {
                const uploadResult = await uploadFile(avatarFile, "avatars", fullUser.avatar);
                if (!uploadResult.success) return errorResponse(uploadResult.error || "Avatar upload failed", 400);
                body.avatar = uploadResult.filename;
            }
        } else {
            body = await req.json();
        }

        if (body.name !== undefined) {
            if (!body.name || body.name.trim().length < 2) return errorResponse("Name must be at least 2 characters", 400);
            fullUser.name = body.name.trim();
        }
        if (body.email !== undefined) {
            const email = body.email?.trim()?.toLowerCase();
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) return errorResponse("Valid email is required", 400);
            const existing = await User.findOne({ email, accountDeletedAt: null, _id: { $ne: id } });
            if (existing) return errorResponse("Email already in use", 400);
            fullUser.email = email;
        }
        if (body.password !== undefined && body.password && String(body.password).trim().length >= 6) {
            fullUser.password = body.password;
        }
        const validRoles = ["admin", "manager", "user"];
        if (body.role !== undefined) {
            if (!validRoles.includes(body.role)) return errorResponse("Invalid role", 400);
            fullUser.role = body.role;
        }
        const validStatuses = ["active", "inactive", "suspended"];
        if (body.status !== undefined) {
            if (!validStatuses.includes(body.status)) return errorResponse("Invalid status", 400);
            fullUser.status = body.status;
        }
        if (body.phone !== undefined) fullUser.phone = body.phone ? String(body.phone).trim() : "";
        if (body.technicalDetails !== undefined) {
            fullUser.technicalDetails = { ...fullUser.technicalDetails, ...body.technicalDetails };
        }
        if (body.avatar !== undefined) fullUser.avatar = body.avatar;

        await fullUser.save();

        const updated = await User.findById(id).select("-password -resetPasswordToken -resetPasswordExpires -fcmTokens").lean();
        const out = JSON.parse(JSON.stringify(updated));
        out.id = out._id?.toString();

        return NextResponse.json(out);
    } catch (error) {
        console.error("PUT /api/users/[id] error:", error);
        return errorResponse(error.message, 500);
    }
}

/**
 * DELETE /api/users/[id] — Soft-delete user (admin/manager only).
 */
export async function DELETE(req, { params }) {
    try {
        const authUser = await verifyAuth(req);
        if (!authUser) return errorResponse("Not authenticated", 401);
        if (authUser.role !== "admin" && authUser.role !== "manager") {
            return errorResponse("Forbidden", 403);
        }

        await dbConnect();

        const { id } = await params;
        if (!id) return errorResponse("User ID required", 400);

        const user = await User.findById(id);
        if (!user) return errorResponse("User not found", 404);
        if (user.accountDeletedAt) return errorResponse("User not found", 404);

        user.accountDeletedAt = new Date();
        await user.save();

        return NextResponse.json({ success: true, message: "User deleted" });
    } catch (error) {
        console.error("DELETE /api/users/[id] error:", error);
        return errorResponse(error.message, 500);
    }
}
