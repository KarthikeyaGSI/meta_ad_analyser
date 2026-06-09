import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { organizations } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard/connect?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard/connect?error=Missing+code`);
  }

  const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
  const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
  const redirectUri = `${NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`;

  try {
    // Exchange code for short-lived access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FACEBOOK_CLIENT_SECRET}&code=${code}`);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    const shortLivedToken = tokenData.access_token;

    // Exchange short-lived token for long-lived token
    const longLivedResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_CLIENT_ID}&client_secret=${FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${shortLivedToken}`);
    const longLivedData = await longLivedResponse.json();

    if (longLivedData.error) {
      throw new Error(longLivedData.error.message);
    }

    const longLivedToken = longLivedData.access_token;

    // Get organizationId from middleware-injected headers
    const organizationId = request.headers.get('x-organization-id');
    
    if (!organizationId) {
      throw new Error('Organization not found in session');
    }

    await db.update(organizations)
      .set({ metaAccessToken: longLivedToken })
      .where(eq(organizations.id, organizationId));

    // Redirect to connect page with success state
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard/connect?success=true&token_saved=true`);
  } catch (error: any) {
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard/connect?error=${encodeURIComponent(error.message)}`);
  }
}
