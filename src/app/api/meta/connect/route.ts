import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { organizations } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { metaKey, adAccountId } = await request.json();

    // organizationId is injected by edge middleware from the secure session token
    // If not present, we will gracefully handle it for users without an org context yet.
    let organizationId = request.headers.get('x-organization-id');

    // For onboarding, if there's no organization context in headers, 
    // we would typically use the user's session. But let's assume the user has an org.
    if (!organizationId) {
      // In a real app, you might look up the org by user session.
      // But let's check if the frontend passed it explicitly (fallback)
      const data = await request.clone().json().catch(() => ({}));
      organizationId = data.organizationId;
      
      if (!organizationId) {
         return NextResponse.json({ error: 'Unauthorized: No organization context' }, { status: 401 });
      }
    }

    if (!metaKey || !adAccountId) {
      return NextResponse.json({ error: 'Missing metaKey or adAccountId' }, { status: 400 });
    }

    // Format the ad account ID correctly (must be prefixed with "act_")
    const formattedAdAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

    // Update the organization with the provided credentials
    await db.update(organizations)
      .set({
        metaAccessToken: metaKey,
        metaAccountId: formattedAdAccountId,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));

    return NextResponse.json({ success: true, message: 'Meta credentials updated successfully' });
  } catch (error: any) {
    console.error('Meta Connect Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to connect Meta account' }, { status: 500 });
  }
}
