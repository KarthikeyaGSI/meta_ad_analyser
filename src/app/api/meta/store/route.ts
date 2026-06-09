// src/app/api/meta/store/route.ts
import { NextResponse } from 'next/server';

/**
 * API route to store Meta integration credentials for an organization.
 * Validates required fields and returns appropriate status codes.
 */
export async function POST(request: Request) {
  try {
    const { organizationId, metaAccessToken, metaAccountId } = await request.json();
    // Validate required fields
    if (!organizationId || !metaAccessToken || !metaAccountId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    // TODO: Verify token with Meta API and persist to DB.
    return NextResponse.json({
      success: true,
      organizationId,
      metaAccessToken,
      metaAccountId,
    });
  } catch (error) {
    console.error('Meta store API error:', error);
    return NextResponse.json({ success: false, error: 'Invalid request payload' }, { status: 400 });
  }
}
