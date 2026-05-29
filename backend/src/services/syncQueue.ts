import { db } from '../database/dbClient';
import { decrypt } from '../utils/crypto';
import { MetaApiService } from './metaService';

interface QueueJob {
  accountId: string;
  retries: number;
  addedAt: string;
}

class HybridSyncQueue {
  private queue: QueueJob[] = [];
  private activeWorkers = 0;
  private maxConcurrency = 2;
  private maxRetries = 3;
  private baseDelayMs = 2000;

  /**
   * Enqueues an account sync job into the background processor
   */
  async enqueue(accountId: string): Promise<void> {
    const alreadyQueued = this.queue.some(job => job.accountId === accountId);
    if (alreadyQueued) {
      console.log(`[Sync Queue] Account ${accountId} is already enqueued in the background.`);
      return;
    }

    console.log(`[Sync Queue] Enqueuing account for background sync: ${accountId}`);
    this.queue.push({
      accountId,
      retries: 0,
      addedAt: new Date().toISOString()
    });

    // Start execution asynchronously
    this.processNext();
  }

  /**
   * Process next enqueued job under concurrency limits
   */
  private async processNext(): Promise<void> {
    if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeWorkers++;
    console.log(`[Sync Queue] Processing job for: ${job.accountId}. Active workers: ${this.activeWorkers}/${this.maxConcurrency}`);

    // Execute the worker asynchronous routine
    (async () => {
      try {
        const metaAcc = await db.getAccountById(job.accountId);
        if (!metaAcc) {
          throw new Error(`Meta Ad Account ${job.accountId} was not discovered in the store.`);
        }

        const decryptedToken = decrypt(metaAcc.accessToken);
        
        // Triggers the main API/Sandbox syncer
        await MetaApiService.syncAdAccount(job.accountId, decryptedToken);

        // Update timestamps
        metaAcc.lastSyncedAt = new Date().toISOString();
        await db.upsertMetaAccount(metaAcc);

        console.log(`[Sync Queue] Background sync finished successfully for: ${job.accountId}`);
      } catch (err: any) {
        console.error(`[Sync Queue] Job failed for account ${job.accountId}:`, err.message);

        // Exponential backoff retrier
        if (job.retries < this.maxRetries) {
          job.retries++;
          const delay = this.baseDelayMs * Math.pow(2, job.retries);
          console.warn(`[Sync Queue] Retry #${job.retries} scheduled in ${delay}ms for account: ${job.accountId}`);
          
          setTimeout(() => {
            this.queue.push(job);
            this.processNext();
          }, delay);
        } else {
          console.error(`[Sync Queue] Job failed permanently for account ${job.accountId} after ${job.retries} attempts.`);
        }
      } finally {
        this.activeWorkers--;
        this.processNext();
      }
    })();
  }

  /**
   * Helper to retrieve currently active queues status
   */
  getQueueStatus() {
    return {
      activeWorkers: this.activeWorkers,
      waitingJobs: this.queue.map(j => j.accountId),
      concurrencyLimit: this.maxConcurrency
    };
  }
}

export const syncQueue = new HybridSyncQueue();
