import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, User } from '../database/dbClient';
import { SandboxEngine } from '../services/sandboxEngine';
import { MetaApiService } from '../services/metaService';

// Runtime guard for Meta credentials – ensures backend routes fail gracefully when secrets are missing.
export const hasMetaCreds = Boolean(
  process.env.META_ACCESS_TOKEN &&
  process.env.META_AD_ACCOUNT_ID &&
  process.env.META_APP_ID &&
  process.env.META_APP_SECRET
);

const JWT_SECRET = process.env.JWT_SECRET || 'aetheris_super_secret_analytics_passphrase_2026';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newUser: User = {
      id,
      email,
      passwordHash,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.createUser(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server registration error.', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server login error.', error: error.message });
  }
};

/**
 * Guest Login Bypass - instantly registers/logs-in a demo guest account
 * and pre-seeds it with beautiful dynamic 30-day dashboard stories.
 */
export const guestLogin = async (req: Request, res: Response) => {
  const email = 'demo@aetheris.co';
  const name = 'Aetheris Demo Partner';
  
  try {
    let user = await db.getUserByEmail(email);
    if (!user) {
      const passwordHash = await bcrypt.hash('demo_password_123', 10);
      user = {
        id: 'demo-user-id',
        email,
        passwordHash,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.createUser(user);
    }

    // Instantly seed/refresh 30-day high-fidelity simulated campaign dashboards
    await SandboxEngine.seedDemoData(user.id);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Demo sandbox activation failed.', error: error.message });
  }
};

/**
 * Meta OAuth Login URL redirect generator
 */
export const getMetaLoginUrl = (req: Request, res: Response) => {
  const appId = process.env.META_APP_ID || 'demo_app_id';
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/auth/callback';
  const scope = 'ads_read,ads_management,business_management';
  
  // Developer Direct Mode: Check if we have manually configured developer tokens in .env
  const isDirectDevMode = !!(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
  
  if (isDirectDevMode) {
    console.log('[Meta OAuth] Developer Direct Mode detected in .env. Emitting callback simulator redirect...');
    // Direct routing to the callback landing with a developer bypass code
    res.json({ url: `${redirectUri}?code=dev_direct_code_mode` });
    return;
  }
  
  const metaUrl = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
  
  res.json({ url: metaUrl });
};

/**
 * Meta OAuth Code Callback Handler
 */
export const metaCallback = async (req: Request, res: Response) => {
  const { code, userId } = req.body;

  if (!code || !userId) {
    return res.status(400).json({ message: 'Authorization code and User ID are required.' });
  }

  const TARGET_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || '1077709497594167';
  const TARGET_ACT_ID = TARGET_ACCOUNT_ID.trim().startsWith('act_') ? TARGET_ACCOUNT_ID.trim() : `act_${TARGET_ACCOUNT_ID.trim()}`;

  try {
    let accessToken = '';
    let isMockMode = false;

    // 1. Resolve Access Token (Developer Direct Mode vs OAuth code exchange)
    if (code === 'dev_direct_code_mode' && process.env.META_ACCESS_TOKEN) {
      console.log('[Meta API Callback] Developer Direct Mode activated via .env credentials.');
      accessToken = process.env.META_ACCESS_TOKEN.trim();
    } else {
      const tokenData = await MetaApiService.exchangeCodeForToken(code);
      accessToken = tokenData.accessToken;
    }
    console.log("META TOKEN:", accessToken);

    let accounts: any[] = [];
    isMockMode = accessToken.includes('_demo') || accessToken.startsWith('EAAdsa89fha89fhasdf89ashf89asdf7ha9hsd_demo');

    // 2. Fetch Ad Accounts (Live vs Mock)
    if (isMockMode) {
      accounts = [
        { account_id: '77491038201', name: 'Demo Prospecting Inc.' },
        { account_id: TARGET_ACCOUNT_ID.replace('act_', ''), name: 'Aetheris Agency Partner (Live Test Sandbox)', currency: 'USD', timezone_name: 'America/New_York' }
      ];
    } else {
      try {
        const fetchUrl = `https://graph.facebook.com/v25.0/me/adaccounts?fields=name,account_id,currency,timezone_name&access_token=${accessToken}`;
        const response = await fetch(fetchUrl);
        const resJson = await response.json();
        
        if (resJson.error) {
          throw new Error(resJson.error.message || 'Failed to retrieve accounts.');
        }
        
        accounts = resJson.data || [];
      } catch (err: any) {
        console.error('[Meta API Callback] Failed to fetch live accounts:', err);
        return res.status(400).json({ 
          success: false, 
          reason: "Ad account not accessible", 
          details: err.message 
        });
      }
    }
    console.log("META ACCOUNTS:", accounts);

    // 3. Verify whether target ad account exists in the returned list
    const targetAccount = accounts.find(acc => 
      acc.account_id === TARGET_ACCOUNT_ID.replace('act_', '') || 
      `act_${acc.account_id}` === TARGET_ACT_ID ||
      acc.id === TARGET_ACT_ID
    );
    console.log("TARGET ACCOUNT FOUND:", targetAccount ? "YES" : "NO");

    if (!targetAccount) {
      console.warn(`[Meta API Callback] Target account ${TARGET_ACT_ID} not found in user ad accounts list.`);
      return res.status(400).json({
        success: false,
        reason: "Ad account not accessible",
        details: `Account ${TARGET_ACT_ID} was not found. Please verify:
- You granted 'ads_read' and 'ads_management' during OAuth permissions.
- Your Facebook Profile is an Admin/Developer inside the Meta App roles.
- Your Business Manager has granted assets sharing permissions for this ad account.`
      });
    }

    // 4. Save Connected Ad Account Details
    const metaAccountId = `ma-${TARGET_ACT_ID}`;
    const metaAcc = {
      id: metaAccountId,
      userId,
      actId: TARGET_ACT_ID,
      name: targetAccount.name || `Meta Ad Account ${TARGET_ACCOUNT_ID.replace('act_', '')}`,
      accessToken,
      status: 'ACTIVE',
      currency: targetAccount.currency || 'USD',
      timezone: targetAccount.timezone_name || 'America/New_York',
      lastSyncedAt: new Date().toISOString(),
    };
    await db.upsertMetaAccount(metaAcc);

    // 5. Test Insights API Node Immediately
    let insightsWorking = false;
    let hasSpendData = false;
    let campaignCount = 0;

    if (isMockMode) {
      insightsWorking = true;
      hasSpendData = true;
      campaignCount = 3;
      
      // Seed target database rows with coherent demo details
      await SandboxEngine.seedDemoData(userId);
      // Ensure the generated rows match the active target account ID
      const campaigns = await db.getCampaigns(metaAccountId);
      campaignCount = campaigns.length;
      
      console.log("INSIGHTS RESPONSE (MOCK):", { spend: 12450.50, impressions: 520480, clicks: 12045 });
    } else {
      try {
        const insightsUrl = `https://graph.facebook.com/v25.0/${TARGET_ACT_ID}/insights?fields=spend,impressions,clicks,ctr,cpc,cpm&date_preset=last_30d&access_token=${accessToken}`;
        const insightsRes = await fetch(insightsUrl);
        const insightsData = await insightsRes.json();
        console.log("INSIGHTS RESPONSE:", insightsData);

        if (!insightsData.error) {
          insightsWorking = true;
          const rows = insightsData.data || [];
          if (rows.length > 0) {
            hasSpendData = Number(rows[0].spend || 0) > 0;
          }
        }

        // Trigger comprehensive campaigns and metrics synchronization
        await MetaApiService.syncAdAccount(metaAccountId, accessToken);
        const campaigns = await db.getCampaigns(metaAccountId);
        campaignCount = campaigns.length;

      } catch (err) {
        console.error('[Meta API Callback] Live Insights test request failed:', err);
      }
    }

    // Generate valid JWT session
    const token = jwt.sign({ id: userId, email: `oauth-${userId}@aetheris.co` }, JWT_SECRET, { expiresIn: '7d' });
    const userSession = { id: userId, name: 'Meta Partner', email: `oauth-${userId}@aetheris.co` };

    res.json({
      success: true,
      liveMode: true,
      adAccountConnected: true,
      accountId: TARGET_ACCOUNT_ID.replace('act_', ''),
      insightsWorking,
      campaignCount,
      hasSpendData,
      accounts: [
        { id: metaAccountId, name: metaAcc.name, actId: metaAcc.actId }
      ],
      token,
      user: userSession
    });

  } catch (error: any) {
    console.error('[Meta API Callback] Fatal integration process failure:', error);
    res.status(500).json({ 
      success: false, 
      reason: "Meta integration synchronization failed.",
      details: error.message 
    });
  }
};
