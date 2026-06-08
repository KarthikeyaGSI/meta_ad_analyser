import { NextResponse } from 'next/server';
import { LicenseService } from '@/server/services/license.service';
import { auth } from '@/server/auth';

export async function GET(request: Request) {
  try {
    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activations = await LicenseService.getTeamActivations(organizationId);
    return NextResponse.json({ success: true, activations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const organizationId = request.headers.get('x-organization-id');
    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { activationId } = body;

    if (!activationId) {
      return NextResponse.json({ error: 'Activation ID is required' }, { status: 400 });
    }

    await LicenseService.revokeActivation(activationId, organizationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
