import { NextResponse } from 'next/server';
import { MetaService } from '@/server/services/meta.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const accountId = searchParams.get('accountId');
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    // organizationId is injected by edge middleware from the secure session token
    const organizationId = request.headers.get('x-organization-id');

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized: No organization context' }, { status: 401 });
    }

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    let data;

    switch (action) {
      case 'overview':
        data = await MetaService.getOverview(organizationId, accountId, startDate, endDate);
        break;
      case 'campaigns':
        data = await MetaService.getCampaigns(organizationId, accountId, startDate, endDate);
        break;
      case 'adsets':
        data = await MetaService.getAdsets(organizationId, accountId, startDate, endDate);
        break;
      case 'charts':
        data = await MetaService.getCharts(organizationId, accountId, startDate, endDate);
        break;
      case 'creatives':
        data = await MetaService.getCreatives(organizationId, accountId, startDate, endDate);
        break;
      case 'breakdowns':
        data = await MetaService.getBreakdowns(organizationId, accountId, startDate, endDate);
        break;
      case 'recommendations':
        data = await MetaService.getRecommendations(organizationId, accountId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Meta API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch meta data' }, { status: 500 });
  }
}
