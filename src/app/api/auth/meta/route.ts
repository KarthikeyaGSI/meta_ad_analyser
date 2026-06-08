import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
  const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  if (!FACEBOOK_CLIENT_ID) {
    return NextResponse.json({ error: 'FACEBOOK_CLIENT_ID is not configured' }, { status: 500 });
  }

  const redirectUri = `${NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`;
  const scopes = ['ads_read', 'ads_management', 'business_management'].join(',');
  
  // Create state to prevent CSRF
  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}`;
  
  return NextResponse.redirect(authUrl);
}
