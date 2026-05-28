import { NextResponse } from 'next/server';
import { enqueueSyncJob } from '../../../server/worker/queue';
import { runSyncWorker } from '../../../server/worker/syncWorker';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accountId, token } = body;
    
    if (!accountId || !token) {
      return NextResponse.json({ error: 'Missing accountId or token' }, { status: 400 });
    }

    // 1. Enqueue the sync job in Redis
    const jobId = await enqueueSyncJob(accountId, token);
    
    // 2. Trigger the worker in the background (fire and forget)
    // In Vercel, this might get suspended, so a cron job should also poll `GET /api/sync`.
    runSyncWorker().catch(err => console.error('Background worker error:', err));
    
    return NextResponse.json({ message: 'Sync job enqueued', jobId }, { status: 202 });
  } catch (error) {
    console.error('API Sync POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Cron fallback for Vercel
export async function GET(req: Request) {
  try {
    // Authenticate the cron request
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await runSyncWorker();
    return NextResponse.json({ message: 'Cron worker executed' }, { status: 200 });
  } catch (error) {
    console.error('API Sync GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
