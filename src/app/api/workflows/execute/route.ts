import { NextResponse } from 'next/server';
import { runWorkflowWorker } from '../../../../server/worker/workflowWorker';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accountId } = body;
    
    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    const organizationId = req.headers.get('x-organization-id');

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized: No organization context' }, { status: 401 });
    }

    // Trigger the automation worker
    const result = await runWorkflowWorker(accountId, organizationId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Workflows executed successfully', logs: result.logs }, { status: 200 });
  } catch (error: any) {
    console.error('API Workflows POST error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
