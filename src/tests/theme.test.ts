import { NextResponse } from 'next/server';
import { POST as themePost } from '@/app/api/theme/route';

/**
 * Test the /api/theme POST route.
 */
describe('Theme API', () => {
  it('should accept a valid theme payload and set a cookie', async () => {
    const request = new Request('http://localhost/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'dark' }),
    });

    const response = await themePost(request);
    expect(response).toBeInstanceOf(NextResponse);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.theme).toBe('dark');
    // Verify cookie header exists
    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toMatch(/theme=dark/);
  });

  it('should return 400 for invalid payload', async () => {
    const request = new Request('http://localhost/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const response = await themePost(request);
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
