import { auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest) {
    try {
        console.log(`[AUTH API] ${req.method} ${req.nextUrl.pathname}`);
        
        // Let better-auth handle the request
        const res = await auth.handler(req);
        
        console.log(`[AUTH API] Response status: ${res.status}`);
        return res;
    } catch (err: any) {
        console.error(`[AUTH API ERROR] \nStack:`, err.stack);
        
        let message = "Authentication service unavailable";
        let status = 500;
        
        if (err.message?.includes("connect") || err.message?.includes("neon")) {
            message = "Database unavailable. Please check your DATABASE_URL connection string.";
        }
        
        return NextResponse.json(
            { error: message, details: err.message || "Unknown error" },
            { status }
        );
    }
}

export const GET = handler;
export const POST = handler;
