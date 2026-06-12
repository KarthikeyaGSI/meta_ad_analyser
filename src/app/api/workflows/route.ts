import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { workflows } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const organizationId = request.headers.get('x-organization-id');
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized: No organization context' }, { status: 401 });
    }

    const orgWorkflows = await db.select().from(workflows).where(eq(workflows.organizationId, organizationId));
    
    return NextResponse.json(orgWorkflows);
  } catch (error: any) {
    console.error("GET /api/workflows error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch workflows" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const organizationId = request.headers.get('x-organization-id');
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized: No organization context' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, status, nodes, edges } = body;

    if (!name || !nodes || !edges) {
      return NextResponse.json({ error: "Missing required fields: name, nodes, edges" }, { status: 400 });
    }

    let workflow;

    if (id) {
      // Update existing workflow
      const updated = await db.update(workflows)
        .set({
          name,
          status,
          nodes,
          edges,
          updatedAt: new Date()
        })
        .where(and(eq(workflows.id, id), eq(workflows.organizationId, organizationId)))
        .returning();
        
      if (updated.length === 0) {
        return NextResponse.json({ error: "Workflow not found or not authorized" }, { status: 404 });
      }
      workflow = updated[0];
    } else {
      // Create new workflow
      const inserted = await db.insert(workflows)
        .values({
          organizationId,
          name,
          status: status || 'draft',
          nodes,
          edges,
        })
        .returning();
      workflow = inserted[0];
    }

    return NextResponse.json(workflow);
  } catch (error: any) {
    console.error("POST /api/workflows error:", error);
    return NextResponse.json({ error: error.message || "Failed to save workflow" }, { status: 500 });
  }
}
