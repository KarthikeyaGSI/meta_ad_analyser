import { NextResponse } from 'next/server';
import { LicenseService } from '@/server/services/license.service';
import { auth } from '@/server/auth';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, deviceFingerprint, organizationId } = await request.json();
    
    if (!key || !deviceFingerprint) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const activation = await LicenseService.validateActivation(key, deviceFingerprint, session.user.id, organizationId || '');
    
    return NextResponse.json({ success: true, activation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
