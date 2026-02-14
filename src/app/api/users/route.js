import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { uploadFile } from "@/lib/storage";

/**
 * GET /api/users — List users (admin/manager only).
 * Query: page, limit, search, status, role, sortBy, sortOrder
 */
export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return errorResponse("Not authenticated", 401);
        }
        if (user.role !== "admin" && user.role !== "manager") {
            return errorResponse("Forbidden", 403);
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit")) || 10));
        const search = (searchParams.get("search") || "").trim();
        const status = searchParams.get("status") || "all";
        const role = searchParams.get("role") || "all";
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const query = { accountDeletedAt: null };

        if (status !== "all") {
            query.status = status;
        }
        if (role !== "all") {
            query.role = role;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(query).select("-password -resetPasswordToken -resetPasswordExpires -fcmTokens").sort(sort).skip(skip).limit(limit).lean(),
            User.countDocuments(query),
        ]);

        const pages = Math.ceil(total / limit) || 1;
        const baseUrl = req.nextUrl?.origin || "";
        const path = "/api/users";
        const params = (p) => {
            const sp = new URLSearchParams(searchParams);
            sp.set("page", String(p));
            return `${path}?${sp.toString()}`;
        };

        const response = {
            data: JSON.parse(JSON.stringify(users)).map((u) => ({
                ...u,
                id: u._id?.toString(),
            })),
            meta: {
                current_page: page,
                last_page: pages,
                total,
            },
            links: {
                next: page < pages ? `${baseUrl}${params(page + 1)}` : null,
                prev: page > 1 ? `${baseUrl}${params(page - 1)}` : null,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("GET /api/users error:", error);
        return errorResponse(error.message, 500);
    }
}

/**
 * POST /api/users — Create user (admin/manager only).
 * Body: JSON or FormData (name, email, password, role, status, phone, technicalDetails, avatar file).
 */
export async function POST(req) {
    try {
        const authUser = await verifyAuth(req);
        if (!authUser) return errorResponse("Not authenticated", 401);
        if (authUser.role !== "admin" && authUser.role !== "manager") {
            return errorResponse("Forbidden", 403);
        }

        await dbConnect();

        const contentType = req.headers.get("content-type") || "";
        let body = {};

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            body.name = formData.get("name");
            body.email = formData.get("email");
            body.password = formData.get("password");
            body.role = formData.get("role");
            body.status = formData.get("status");
            body.phone = formData.get("phone") || "";
            const tech = formData.get("technicalDetails");
            if (tech && typeof tech === "string") {
                try {
                    body.technicalDetails = JSON.parse(tech);
                } catch {
                    body.technicalDetails = null;
                }
            }
            const avatarFile = formData.get("avatar");
            if (avatarFile && avatarFile.size > 0) {
                const uploadResult = await uploadFile(avatarFile, "avatars", null);
                if (!uploadResult.success) return errorResponse(uploadResult.error || "Avatar upload failed", 400);
                body.avatar = uploadResult.filename;
            }
        } else {
            body = await req.json();
        }

        if (!body.name || body.name.trim().length < 2) return errorResponse("Name is required (min 2 characters)", 400);
        if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) return errorResponse("Valid email is required", 400);
        if (!body.password || body.password.length < 6) return errorResponse("Password is required (min 6 characters)", 400);
        const validRoles = ["admin", "manager", "user"];
        if (!body.role || !validRoles.includes(body.role)) return errorResponse("Valid role is required", 400);
        const validStatuses = ["active", "inactive", "suspended"];
        if (!body.status || !validStatuses.includes(body.status)) return errorResponse("Valid status is required", 400);

        const existing = await User.findOne({ email: body.email.trim().toLowerCase(), accountDeletedAt: null });
        if (existing) return errorResponse("Email already in use", 400);

        const user = new User({
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            password: body.password,
            role: body.role,
            status: body.status,
            phone: body.phone ? String(body.phone).trim() : "",
            technicalDetails: body.technicalDetails || {},
        });
        if (body.avatar) user.avatar = body.avatar;
        await user.save();

        const created = await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpires -fcmTokens").lean();
        const out = JSON.parse(JSON.stringify(created));
        out.id = out._id?.toString();

        return NextResponse.json({ user: out });
    } catch (error) {
        console.error("POST /api/users error:", error);
        return errorResponse(error.message, 500);
    }
}
