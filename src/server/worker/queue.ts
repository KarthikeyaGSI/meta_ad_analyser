import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

export interface SyncJob {
  id: string;
  accountId: string;
  token: string;
  retryCount: number;
  lastError?: string;
  createdAt: number;
}

const QUEUE_KEY = 'meta:sync:queue';
const MAX_RETRIES = 3;

export async function enqueueSyncJob(accountId: string, token: string): Promise<string> {
  const job: SyncJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    accountId,
    token,
    retryCount: 0,
    createdAt: Date.now()
  };

  await redis.lpush(QUEUE_KEY, JSON.stringify(job));
  return job.id;
}

export async function processSyncQueue(batchSize = 10) {
  for (let i = 0; i < batchSize; i++) {
    const jobStr = await redis.rpop(QUEUE_KEY);
    if (!jobStr) break;
    
    const job = typeof jobStr === 'string' ? JSON.parse(jobStr) : jobStr;
    try {
      await executeSync(job);
    } catch (err: any) {
      console.error(`Job ${job.id} failed:`, err);
      if (job.retryCount < MAX_RETRIES) {
        job.retryCount++;
        job.lastError = err.message || 'Unknown error';
        await redis.lpush(QUEUE_KEY, JSON.stringify(job)); // Re-queue
      } else {
        await redis.lpush('meta:sync:deadletter', JSON.stringify(job));
      }
    }
  }
}

async function executeSync(job: SyncJob) {
  // Logic to call Meta Insights API
  console.log(`Executing sync for account ${job.accountId}`);
  // If it fails due to rate limits or transient errors, we throw so it retries
  if (Math.random() < 0.2) throw new Error('Simulated transient Meta API error');
}
