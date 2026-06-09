import { NextResponse } from 'next/server';
import { POST as metaPost } from '@/app/api/meta/store/route';

/**
 * Test the /api/meta/store POST route.
 */
describe('Meta Store API', () => {
  it('should accept valid credentials and respond with success', async () => {
    const request = new Request('http://localhost/api/meta/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: 'org_test',
        metaAccessToken: 'test_token',
        metaAccountId: 'act_123456',
      }),
    });
    const response = await metaPost(request);
    expect(response).toBeInstanceOf(NextResponse);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.organizationId).toBe('org_test');
  });

  it('should return 400 for missing fields', async () => {
    const request = new Request('http://localhost/api/meta/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: 'org_test' }),
    });
    const response = await metaPost(request);
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
