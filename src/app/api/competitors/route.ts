import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { competitors } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const organizationId = request.headers.get('x-organization-id');
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized: No organization context' }, { status: 401 });
    }

    const orgCompetitors = await db.select().from(competitors).where(eq(competitors.organizationId, organizationId));
    
    return NextResponse.json(orgCompetitors);
  } catch (error: any) {
    console.error("GET /api/competitors error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch competitors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const organizationId = request.headers.get('x-organization-id');
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized: No organization context' }, { status: 401 });
    }

    const body = await request.json();
    const { competitors: newCompetitors } = body;

    if (!newCompetitors || !Array.isArray(newCompetitors)) {
      return NextResponse.json({ error: "Missing or invalid competitors array" }, { status: 400 });
    }

    // Insert all new competitors
    const inserted = await Promise.all(
      newCompetitors.map(async (domain: string) => {
        // basic domain to name conversion (e.g. gymshark.com -> Gymshark)
        let name = domain;
        if (domain.includes('.')) {
          const parts = domain.split('.');
          if (parts[0] === 'www') {
            name = parts[1];
          } else {
            name = parts[0];
          }
          name = name.charAt(0).toUpperCase() + name.slice(1);
        }

        const res = await db.insert(competitors).values({
          organizationId,
          domain,
          name,
        }).returning();
        return res[0];
      })
    );

    return NextResponse.json({ success: true, competitors: inserted });
  } catch (error: any) {
    console.error("POST /api/competitors error:", error);
    return NextResponse.json({ error: error.message || "Failed to save competitors" }, { status: 500 });
  }
}
