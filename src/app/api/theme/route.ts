import { NextResponse } from 'next/server';

/**
 * API route to persist user theme preference.
 * The client already stores the theme in localStorage and sends a POST request.
 * Here we simply acknowledge receipt; in a real app you might set a cookie
 * or update a user profile via your backend.
 */
export async function POST(request: Request) {
  try {
    const { theme } = await request.json();
    if (!theme || typeof theme !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }
    const response = NextResponse.json({ success: true, theme });
    response.cookies.set('theme', theme, { httpOnly: false, path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch (error) {
    console.error('Theme API error:', error);
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
