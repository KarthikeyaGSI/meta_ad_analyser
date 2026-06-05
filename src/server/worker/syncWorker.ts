import { processSyncQueue } from './queue';

// This function acts as the entrypoint for our serverless worker.
// It processes the Upstash Redis queue for background tasks like syncing Meta API data.
export async function runSyncWorker() {
  console.log('[Worker] Starting background sync worker run...');
  try {
    // Process up to 5 jobs in this invocation
    await processSyncQueue(5);
    console.log('[Worker] Worker run completed successfully.');
  } catch (error) {
    console.error('[Worker] Error during worker run:', error);
  }
}
