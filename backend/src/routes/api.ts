import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as analytics from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/guest', auth.guestLogin); // Guest demo bypass login
router.get('/auth/meta/login', auth.getMetaLoginUrl); // Meta OAuth URL
router.post('/auth/meta/callback', auth.metaCallback); // Meta OAuth Callback receiver

// ----------------------------------------------------
// ANALYTICS & INSIGHTS ROUTES (Secured via JWT tokens)
// ----------------------------------------------------
router.use('/accounts', authenticateToken);

router.get('/accounts', analytics.getAccounts);
router.post('/accounts/connect', analytics.connectDirectToken); // Multi-stage Meta direct connection
router.post('/accounts/direct-token', analytics.connectDirectToken); // Legacy fallback connection slot
router.get('/accounts/:id/overview', analytics.getAccountOverview);
router.get('/accounts/:id/charts', analytics.getAccountCharts);
router.get('/accounts/:id/campaigns', analytics.getCampaignsTable);
router.get('/accounts/:id/adsets', analytics.getAdsetsExplorer);
router.get('/accounts/:id/creatives', analytics.getCreativesPerformance);
router.get('/accounts/:id/breakdowns', analytics.getBreakdowns);
router.get('/accounts/:id/recommendations', analytics.getRecommendations);
router.post('/accounts/:id/sync', analytics.syncAccountManual);
router.get('/accounts/:id/export', analytics.exportCampaignsCsv);

export default router;
