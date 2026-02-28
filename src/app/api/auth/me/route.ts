import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";

export async function GET() {
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
