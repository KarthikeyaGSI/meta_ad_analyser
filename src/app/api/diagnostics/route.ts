import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";
import { auth } from "@/server/auth";

export async function GET() {
    const status = {
        database: { status: "unknown", message: "" },
        auth: { status: "unknown", message: "" },
        environment: { status: "unknown", message: "" },
    };

    // 1. Check Database
    try {
        await db.execute(sql`SELECT 1`);
        status.database.status = "ok";
        status.database.message = "Connected to Neon successfully.";
    } catch (err: any) {
        status.database.status = "error";
        status.database.message = err.message || "Failed to connect to the database.";
    }

    // 2. Check Auth
    try {
        if (!auth) {
            throw new Error("Better Auth instance is null or undefined.");
        }
        status.auth.status = "ok";
        status.auth.message = "Better Auth is configured and mounted.";
    } catch (err: any) {
        status.auth.status = "error";
        status.auth.message = err.message || "Better Auth failed to initialize.";
    }

    // 3. Check Environment
    const missingVars = [];
    if (!process.env.DATABASE_URL) missingVars.push("DATABASE_URL");
    if (!process.env.BETTER_AUTH_SECRET) missingVars.push("BETTER_AUTH_SECRET");
    if (!process.env.BETTER_AUTH_URL) missingVars.push("BETTER_AUTH_URL");

    if (missingVars.length > 0) {
        status.environment.status = "error";
        status.environment.message = `Missing environment variables: ${missingVars.join(", ")}`;
    } else {
        if (process.env.DATABASE_URL?.includes("mock")) {
            status.environment.status = "warning";
            status.environment.message = "Using mock DATABASE_URL. Real database connection will fail.";
        } else {
            status.environment.status = "ok";
            status.environment.message = "All required environment variables are present.";
        }
    }

    const overallStatus = 
        Object.values(status).every(s => s.status === "ok") ? "healthy" :
        Object.values(status).some(s => s.status === "error") ? "unhealthy" : "degraded";

    return NextResponse.json({
        system: overallStatus,
        details: status
    }, { status: overallStatus === "healthy" || overallStatus === "degraded" ? 200 : 500 });
}
