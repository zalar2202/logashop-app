import { NextResponse } from "next/server";

const API_BASE = "https://api.countrystatecity.in/v1";

export async function GET() {
    // Prefer CSC_API_KEY (official docs); fallback to COUNTRY_API_KEY for legacy
    const apiKey = process.env.CSC_API_KEY || process.env.COUNTRY_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { success: false, error: "Country API key not configured" },
            { status: 500 }
        );
    }

    try {
        const res = await fetch(`${API_BASE}/countries`, {
            headers: { "X-CSCAPI-KEY": apiKey },
            next: { revalidate: 86400 }, // Cache 24 hours
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(
                { success: false, error: err.error || "Failed to fetch countries" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Geo countries API error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch countries" },
            { status: 500 }
        );
    }
}
