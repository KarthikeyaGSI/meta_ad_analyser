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

    const result = await LicenseService.syncLicense(session.user.id);
    
    if (!result) {
      return NextResponse.json({ success: false, error: 'No active license found' });
    }
    
    const response = NextResponse.json({ success: true, activation: result.activation });
    response.cookies.set('vero.license_jwt', result.jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
