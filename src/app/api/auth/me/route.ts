export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// _request param is required — without it Vercel's build tries to
// statically optimize this route and fails when it finds cookies() usage.
export async function GET(_request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        data: {
            id: session.id,
            email: session.email,
            name: session.name,
            createdAt: session.createdAt,
        },
    });
}
