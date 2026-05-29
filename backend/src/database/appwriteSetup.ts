import path from 'path';
import dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';

// Load environmental variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '6a1542e40024cf4f2e4c';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '6a154386002ed0775f5e';
const API_KEY = process.env.APPWRITE_API_KEY;

export async function setupAppwriteSchema() {
  if (!API_KEY) {
    console.error('========================================================================');
    console.error('⚠️  [Appwrite Setup] APPWRITE_API_KEY is not defined in backend/.env!');
    console.error('⚠️  Please configure your Appwrite API Key inside the .env file to enable');
    console.error('⚠️  programmatic collections and attributes generation.');
    console.error('========================================================================');
    return false;
  }

  console.log('🚀 [Appwrite Setup] Initializing Appwrite Database Schema Builder...');
  console.log(`🚀 [Appwrite Setup] Endpoint: ${ENDPOINT}`);
  console.log(`🚀 [Appwrite Setup] Project ID: ${PROJECT_ID}`);
  console.log(`🚀 [Appwrite Setup] Database ID: ${DATABASE_ID}`);

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new Databases(client);

  // 1. Try to create the database if it doesn't already exist
  try {
    await databases.create(DATABASE_ID, 'Aetheris Ads Analytics Database');
    console.log(`✅ [Appwrite Setup] Database '${DATABASE_ID}' successfully created.`);
  } catch (err: any) {
    if (err.code === 409) {
      console.log(`ℹ️ [Appwrite Setup] Database '${DATABASE_ID}' already exists. Transitioning to collections check...`);
    } else {
      console.error(`❌ [Appwrite Setup] Failed to verify/create database:`, err.message);
      return false;
    }
  }

  // Definition of collections and their structures
  const collections = [
    {
      id: 'users',
      name: 'Users Profile Settings',
      attributes: [
        { key: 'email', type: 'string', size: 255, required: true },
        { key: 'passwordHash', type: 'string', size: 255, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'createdAt', type: 'string', size: 100, required: true },
        { key: 'updatedAt', type: 'string', size: 100, required: true }
      ]
    },
    {
      id: 'meta_accounts',
      name: 'Meta Accounts',
      attributes: [
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'actId', type: 'string', size: 100, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'accessToken', type: 'string', size: 2000, required: true },
        { key: 'status', type: 'string', size: 100, required: true },
        { key: 'currency', type: 'string', size: 20, required: true },
        { key: 'timezone', type: 'string', size: 150, required: true },
        { key: 'lastSyncedAt', type: 'string', size: 100, required: false }
      ]
    },
    {
      id: 'campaigns',
      name: 'Campaigns',
      attributes: [
        { key: 'metaAccountId', type: 'string', size: 255, required: true },
        { key: 'campaignId', type: 'string', size: 100, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'status', type: 'string', size: 100, required: true },
        { key: 'objective', type: 'string', size: 100, required: true },
        { key: 'buyingType', type: 'string', size: 100, required: true },
        { key: 'budget', type: 'float', required: true },
        { key: 'createdTime', type: 'string', size: 100, required: true }
      ]
    },
    {
      id: 'adsets',
      name: 'Ad Sets',
      attributes: [
        { key: 'campaignId', type: 'string', size: 255, required: true },
        { key: 'adsetId', type: 'string', size: 100, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'status', type: 'string', size: 100, required: true },
        { key: 'targeting', type: 'string', size: 10000, required: true }, // stringified json
        { key: 'budget', type: 'float', required: true }
      ]
    },
    {
      id: 'ads',
      name: 'Ads',
      attributes: [
        { key: 'adsetId', type: 'string', size: 255, required: true },
        { key: 'adId', type: 'string', size: 100, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'status', type: 'string', size: 100, required: true },
        { key: 'creativeId', type: 'string', size: 100, required: true }
      ]
    },
    {
      id: 'creatives',
      name: 'Ad Creatives',
      attributes: [
        { key: 'creativeId', type: 'string', size: 100, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'headline', type: 'string', size: 1000, required: false },
        { key: 'body', type: 'string', size: 5000, required: false },
        { key: 'imageUrl', type: 'string', size: 2000, required: true },
        { key: 'videoUrl', type: 'string', size: 2000, required: false },
        { key: 'thumbnailUrl', type: 'string', size: 2000, required: false },
        { key: 'callToActionType', type: 'string', size: 100, required: true }
      ]
    },
    {
      id: 'insights_daily',
      name: 'Daily Insights',
      attributes: [
        { key: 'entityType', type: 'string', size: 50, required: true },
        { key: 'entityId', type: 'string', size: 100, required: true },
        { key: 'date', type: 'string', size: 50, required: true },
        { key: 'spend', type: 'float', required: true },
        { key: 'impressions', type: 'integer', required: true },
        { key: 'clicks', type: 'integer', required: true },
        { key: 'purchases', type: 'integer', required: true },
        { key: 'revenue', type: 'float', required: true },
        { key: 'ctr', type: 'float', required: true },
        { key: 'cpc', type: 'float', required: true },
        { key: 'cpm', type: 'float', required: true },
        { key: 'roas', type: 'float', required: true },
        { key: 'cpa', type: 'float', required: true },
        { key: 'frequency', type: 'float', required: true },
        { key: 'deviceBreakdown', type: 'string', size: 5000, required: false },
        { key: 'placementBreakdown', type: 'string', size: 5000, required: false },
        { key: 'demographics', type: 'string', size: 5000, required: false }
      ]
    },
    {
      id: 'insights_hourly',
      name: 'Hourly Insights',
      attributes: [
        { key: 'entityType', type: 'string', size: 50, required: true },
        { key: 'entityId', type: 'string', size: 100, required: true },
        { key: 'timestamp', type: 'string', size: 100, required: true },
        { key: 'spend', type: 'float', required: true },
        { key: 'impressions', type: 'integer', required: true },
        { key: 'clicks', type: 'integer', required: true },
        { key: 'purchases', type: 'integer', required: true },
        { key: 'revenue', type: 'float', required: true },
        { key: 'ctr', type: 'float', required: true },
        { key: 'cpc', type: 'float', required: true },
        { key: 'cpm', type: 'float', required: true },
        { key: 'roas', type: 'float', required: true },
        { key: 'cpa', type: 'float', required: true }
      ]
    },
    {
      id: 'sync_logs',
      name: 'Synchronization Logs',
      attributes: [
        { key: 'metaAccountId', type: 'string', size: 255, required: true },
        { key: 'status', type: 'string', size: 50, required: true }, // pending, running, success, failed
        { key: 'rowsProcessed', type: 'integer', required: true },
        { key: 'durationMs', type: 'integer', required: true },
        { key: 'errorMessage', type: 'string', size: 5000, required: false },
        { key: 'createdAt', type: 'string', size: 100, required: true }
      ]
    }
  ];

  for (const col of collections) {
    console.log(`\n📦 [Appwrite Setup] Setting up collection: '${col.id}' (${col.name})...`);
    
    // Create collection
    try {
      await databases.createCollection(DATABASE_ID, col.id, col.name);
      console.log(`✅ [Appwrite Setup] Collection '${col.id}' created.`);
    } catch (err: any) {
      if (err.code === 409) {
        console.log(`ℹ️ [Appwrite Setup] Collection '${col.id}' already exists.`);
      } else {
        console.error(`❌ [Appwrite Setup] Failed to create collection '${col.id}':`, err.message);
        continue;
      }
    }

    // List existing attributes to prevent conflict duplicates
    let existingAttrs: string[] = [];
    try {
      const colInfo = await databases.getCollection(DATABASE_ID, col.id);
      existingAttrs = colInfo.attributes.map((a: any) => a.key);
    } catch (err: any) {
      console.error(`❌ [Appwrite Setup] Failed to load collection details for '${col.id}':`, err.message);
    }

    // Add attributes programmatically
    for (const attr of col.attributes) {
      if (existingAttrs.includes(attr.key)) {
        continue;
      }

      console.log(`  ➕ [Appwrite Setup] Adding attribute: '${attr.key}' (${attr.type})...`);
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(DATABASE_ID, col.id, attr.key, attr.size || 255, attr.required);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(DATABASE_ID, col.id, attr.key, attr.required);
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(DATABASE_ID, col.id, attr.key, attr.required);
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(DATABASE_ID, col.id, attr.key, attr.required);
        }
        
        // Brief sleep pause to accommodate Appwrite rate paced indexing limiters
        await new Promise(r => setTimeout(r, 600));
      } catch (err: any) {
        console.error(`  ❌ [Appwrite Setup] Failed to create attribute '${attr.key}' on '${col.id}':`, err.message);
      }
    }

    console.log(`✅ [Appwrite Setup] Collection structure set up for '${col.id}'`);
  }

  console.log('\n========================================================================');
  console.log('🎉 [Appwrite Setup] Appwrite database collection schemas completed successfully!');
  console.log('========================================================================');
  return true;
}

// Enable direct execution for migrations scripting
if (require.main === module) {
  setupAppwriteSchema().catch(console.error);
}
