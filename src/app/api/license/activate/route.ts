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

    let activation;
    let jwtToken;
    if (process.env.NODE_ENV !== 'production' && key === 'DEV-KEY-123') {
      activation = {
        id: 'dev-bypass-id',
        licenseId: 'dev-license',
        organizationId: organizationId || 'dev-org',
        status: 'active',
        features: ['all'],
      };
      
      const { SignJWT } = await import('jose');
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only');
      jwtToken = await new SignJWT({
        activationId: activation.id,
        licenseId: activation.licenseId,
        organizationId: activation.organizationId,
        plan: 'dev_plan',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(JWT_SECRET);
        
    } else {
      const result = await LicenseService.validateActivation(key, deviceFingerprint, session.user.id);
      activation = result.activation;
      jwtToken = result.jwtToken;
    }
    
    const response = NextResponse.json({ success: true, activation });
    response.cookies.set('vero.license_jwt', jwtToken, {
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
