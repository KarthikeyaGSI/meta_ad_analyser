export async function exchangeCodeForToken(code: string): Promise<string | null> {
  // In a real implementation, this exchanges the OAuth code for a short-lived token
  // and then exchanges that for a long-lived token.
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.warn('Meta OAuth environment variables missing. Returning mock token.');
    return 'mock-long-lived-token-12345';
  }

  try {
    const url = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.access_token) {
      return data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Meta token exchange failed', error);
    return null;
  }
}

export async function refreshMetaToken(currentToken: string, attempt = 1): Promise<string | null> {
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;

  if (!clientId || !clientSecret) return 'mock-refreshed-token-12345';

  try {
    const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${currentToken}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.access_token) {
      return data.access_token;
    }
    
    throw new Error('No token in response');
  } catch (error) {
    console.error(`Meta token refresh failed (attempt ${attempt}):`, error);
    if (attempt < 3) {
      // Exponential backoff
      await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
      return refreshMetaToken(currentToken, attempt + 1);
    }
    return null;
  }
}
