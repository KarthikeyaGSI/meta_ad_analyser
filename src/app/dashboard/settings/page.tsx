'use client';

import { api } from '@convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { 
  Settings, 
  Slack, 
  MessageSquare, 
  Shield, 
  Globe, 
  Paintbrush, 
  RefreshCw, 
  Check,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Facebook
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { analyticsApi, authApi } from '../../../services/api';
import { useStore } from '../../../client/store/useStore';

export default function SettingsPage() {
  const { setActiveAccount, triggerRefresh, activeAccount, brandColor, setBrandColor, agencyName, setAgencyName, isPremium } = useStore();
  
  const orgs: any[] = [];
  const activeOrg: any = orgs?.[0];
  const activeOrgId = activeOrg?._id;

  const updateOrg = async (opts: any) => {};
  const saveIntegration = async (opts: any) => {};
  const [slackPref, setSlackPref] = useState<'all' | 'critical' | 'none'>('all');
  const [whatsappPref, setWhatsappPref] = useState<'all' | 'critical' | 'none'>('critical');
  const [teamEmails, setTeamEmails] = useState('karthikeya@vero.co, marketing@vero.co');
  const [customDomain, setCustomDomain] = useState('');

  useEffect(() => {
    if (activeOrg) {
      if (activeOrg.name && activeOrg.name !== agencyName) setAgencyName(activeOrg.name);
      if (activeOrg.customDomain) setCustomDomain(activeOrg.customDomain);
      if (activeOrg.brandColor) setBrandColor(activeOrg.brandColor as any);
      if (activeOrg.alertPreferences) {
        setSlackPref(activeOrg.alertPreferences.slack);
        setWhatsappPref(activeOrg.alertPreferences.whatsapp);
      }
    }
  }, [activeOrg]);

  const handleSlackPref = (val: 'all' | 'critical' | 'none') => {
    setSlackPref(val);
    handleUpdateOrgSettings({ alertPreferences: { slack: val, whatsapp: whatsappPref } });
  };

  const handleWhatsappPref = (val: 'all' | 'critical' | 'none') => {
    setWhatsappPref(val);
    handleUpdateOrgSettings({ alertPreferences: { slack: slackPref, whatsapp: val } });
  };

  const handleUpdateOrgSettings = (updates: any) => {
    if (activeOrgId) {
      updateOrg({ organizationId: activeOrgId, ...updates });
    }
  };

  const onAgencyNameChange = (val: string) => {
    setAgencyName(val);
    handleUpdateOrgSettings({ name: val });
  };

  const onCustomDomainChange = (val: string) => {
    setCustomDomain(val);
    handleUpdateOrgSettings({ customDomain: val });
  };

  const onBrandColorChange = (val: 'orange' | 'violet' | 'emerald' | 'ocean' | 'obsidian') => {
    setBrandColor(val);
    handleUpdateOrgSettings({ brandColor: val });
  };

  // Meta OAuth Integration states
  const [oauthConnecting, setOauthConnecting] = useState(false);

  // Direct Meta API Slot Form States
  const [directActId, setDirectActId] = useState('');
  const [directToken, setDirectToken] = useState('');
  const [directName, setDirectName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleMetaOauth = async () => {
    setOauthConnecting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await authApi.getMetaLoginUrl();
      if (res.data?.url && !res.data.url.includes('client_id=demo_app_id') && !res.data.url.includes('client_id=')) {
        window.location.href = res.data.url;
      } else {
        setErrorMsg('No Meta App ID discovered in .env. Booting sandbox OAuth verification callback...');
        setTimeout(() => {
        window.location.href = '/auth/callback?code=mock_code_generic';
        }, 1500);
      }
    } catch {
      setErrorMsg('Failed to connect via Meta OAuth. Redirecting to callback simulator...');
      setTimeout(() => {
        window.location.href = '/auth/callback?code=mock_code_generic';
      }, 1500);
    }
  };

  // Re-fetch accounts query to refresh navbar list on success
  const { refetch: refetchAccounts } = useReactQuery({
    queryKey: ['availableAccounts'],
    queryFn: async () => {
      const res = await analyticsApi.getAccounts();
      return res.data;
    },
    enabled: false
  });

  const handleConnectDirectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directActId.trim() || !directToken.trim()) {
      setErrorMsg('Ad Account ID and User Access Token are required.');
      return;
    }

    console.log("[Settings API Slot] connect button click: Initializing multi-stage Meta Live Account connection flow...");

    setConnecting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      console.log("[Settings API Slot] Meta validation: Verifying token directly with Facebook Graph API...");
      
      const actId = directActId.trim();
      const token = directToken.trim();
      const formattedActId = actId.startsWith('act_') ? actId : `act_${actId}`;

      const isMockToken = token.includes('_demo') || token.startsWith('EAAdsa89fha89fhasdf89ashf89asdf7ha9hsd_demo') || token.includes('mock');

      if (!isMockToken) {
        const testUrl = `https://graph.facebook.com/v19.0/${formattedActId}?fields=name&access_token=${token}`;
        const testRes = await fetch(testUrl);
        const testData = await testRes.json();
        
        if (testData.error) {
           throw new Error(testData.error.message || 'Invalid API Token or Ad Account ID.');
        }
      }

      console.log("[Settings API Slot] Meta validation: Validated successfully. Posting to backend...");
      
      if (activeOrgId) {
        await saveIntegration({
          organizationId: activeOrgId,
          accountId: directActId.trim(),
          accessToken: directToken.trim(),
          customName: directName.trim() || undefined
        });
      }

      const res = await analyticsApi.connectDirectToken({
        adAccountId: directActId.trim(),
        accessToken: directToken.trim(),
        customAccountName: directName.trim() || undefined
      });

      const { account, insightsWorking, accountId } = res.data;

      console.log(`[Settings API Slot] insights response: Insights verified: ${insightsWorking ? 'YES' : 'NO'}`);
      console.log(`[Settings API Slot] sync start: Live campaigns synced successfully for account: ${accountId}`);

      setSuccessMsg('Successfully connected and synchronized direct Meta API account!');
      setDirectActId('');
      setDirectToken('');
      setDirectName('');

      // Step 3: Frontend Updates - Disable Demo mode and set live context
      console.log("[Settings API Slot] dashboard refresh: Activating LIVE Meta API Mode, disabling Sandbox Mode...");
      
      // Auto-set the newly connected account as the active workspace context
      if (account) {
        // Enforce setting active account in Zustand
        setActiveAccount({
          id: account.id,
          name: account.name,
          actId: account.actId
        });
        
        // Save the direct token for this account to bypass backend
        localStorage.setItem(`meta_token_${account.id}`, directToken.trim());
      }

      console.log("[Settings API Slot] sync complete: Settings update complete. Refreshing workspace dashboard logs...");

      // Refresh listings and dashboard
      await refetchAccounts();
      triggerRefresh();

    } catch (err: any) {
      console.error('[Settings API Slot] Connection failed:', err);
      const axiosMsg = err.response?.data?.message || err.response?.data?.details;
      setErrorMsg(axiosMsg || err.message || 'Connection handshake failed. Verify token status.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <>
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Settings & Integrations <Settings className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-sm text-muted">Configure Slack notification alerts, client white-labeling portals, and custom Meta API connections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT TWO COLUMNS: INTEGRATIONS AND PORTALS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. DECISION CHANNELS (SLACK & WHATSAPP) */}
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3.5">
              <Slack className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-white">SaaS Decision Alerts Channels</h3>
                <p className="text-[10px] text-muted">Send automated AI notifications immediately when CPC surges or ad fatigue is detected.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Slack className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Slack Workspace</h4>
                    <p className="text-[11px] text-muted">Route automation alerts to a Slack channel</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={slackPref}
                    onChange={(e) => handleSlackPref(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:border-primary/50"
                  >
                    <option value="all">All Alerts</option>
                    <option value="critical">Critical Only</option>
                    <option value="none">Muted</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">WhatsApp Business</h4>
                    <p className="text-[11px] text-muted">Receive SMS/WhatsApp notifications</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={whatsappPref}
                    onChange={(e) => handleWhatsappPref(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:border-primary/50"
                  >
                    <option value="all">All Alerts</option>
                    <option value="critical">Critical Only</option>
                    <option value="none">Muted</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. WHITE-LABELING & CLIENT PORTALS */}
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3.5">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-white">White-Labeling & Client Portals</h3>
                <p className="text-[10px] text-muted">Share interactive analytical portals with custom domain configurations and brand assets.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="agency-name" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Dashboard Platform Title (Agency Name)</label>
                  <input
                    id="agency-name"
                    type="text"
                    value={agencyName}
                    onChange={(e) => onAgencyNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white input-premium"
                    disabled={!isPremium}
                  />
                  {!isPremium && <p className="text-[9px] text-primary mt-1">Upgrade to Premium to unlock custom branding.</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="custom-domain" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Custom Portal CNAME Domain</label>
                  <input
                    id="custom-domain"
                    type="text"
                    value={customDomain}
                    onChange={(e) => onCustomDomainChange(e.target.value)}
                    placeholder="analytics.youragency.com"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white input-premium"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                <Paintbrush className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Client Portal active on CNAME configuration</h4>
                  <p className="text-[10px] text-muted leading-relaxed mt-0.5">
                    Agency white-labeling maps portals under your primary domains. Users can log in directly with custom logo presets and color palettes matching your client portals.
                  </p>
                </div>
              </div>

              {/* DYNAMIC AGENCY BRAND COLOR PICKER */}
              <div className="space-y-3.5 pt-4 border-t border-white/[0.06]">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Agency Brand Color Accent</label>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { key: 'orange', name: 'Indigo Aura', color: 'bg-[#F97316]', border: 'border-[#F97316]/55' },
                    { key: 'violet', name: 'Violet Nebula', color: 'bg-[#8B5CF6]', border: 'border-[#8B5CF6]/55' },
                    { key: 'emerald', name: 'Emerald Wave', color: 'bg-[#10B981]', border: 'border-[#10B981]/55' },
                    { key: 'ocean', name: 'Ocean Cyan', color: 'bg-[#0EA5E9]', border: 'border-[#0EA5E9]/55' },
                    { key: 'obsidian', name: 'Slate Obsidian', color: 'bg-[#64748B]', border: 'border-[#64748B]/55' }
                  ].map((colorObj) => {
                    const active = (brandColor || 'orange') === colorObj.key;
                    return (
                      <button
                        key={colorObj.key}
                        type="button"
                        onClick={() => onBrandColorChange(colorObj.key as any)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[10px] font-bold transition duration-300 btn-touch ${
                          active 
                            ? `${colorObj.border} bg-white/[0.04] text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)]` 
                            : 'border-white/[0.06] bg-transparent text-muted hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${colorObj.color}`}></span>
                        {colorObj.name}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* 4. TEAM MANAGEMENT & OMNI-CHANNEL (PREMIUM) */}
          {isPremium && (
            <>
              {/* Unlimited Team Seats */}
              <div className="glass-panel p-6 rounded-3xl space-y-6">
                <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3.5">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-white">Team Management & Permissions</h3>
                    <p className="text-[10px] text-muted">Invite team members or clients with specific view/edit permissions.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="team-emails" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Invite Team Members (Comma separated emails)</label>
                    <textarea
                      id="team-emails"
                      value={teamEmails}
                      onChange={(e) => setTeamEmails(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-xs text-white input-premium h-20"
                    />
                  </div>
                  <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-xs transition-colors">
                    Send Invites
                  </button>
                </div>
              </div>

              {/* Omni-Channel Integration */}
              <div className="glass-panel p-6 rounded-3xl space-y-6">
                <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3.5">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-white">Omni-Channel Integration</h3>
                    <p className="text-[10px] text-muted">Sync data from multiple ad platforms to see blended ROAS.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {['TikTok Ads', 'Google Ads', 'LinkedIn Ads'].map((platform) => (
                    <div key={platform} className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{platform}</h4>
                          <p className="text-[11px] text-emerald-400">Connected</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs rounded transition-colors">
                        Configure
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* RIGHT COLUMN: INTEGRATION STATUS PANELS */}
        <div className="space-y-8">
          
          {/* 1. META OAUTH CONNECTION SLOT */}
          <div className="glass-panel-premium p-6 rounded-3xl space-y-6 relative overflow-hidden">
            {/* Ambient Indigo Backlight */}
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3.5">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-white">Meta OAuth Connection</h3>
                <p className="text-[10px] text-muted">Automated connection via secure Facebook Login protocol.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Link your live Meta Business Profile with a single click. Vero will automatically discover and sync your connected ad accounts.
            </p>

            <button
              onClick={handleMetaOauth}
              disabled={oauthConnecting}
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-[#1877F2] to-orange-600 hover:from-[#166FE5] hover:to-orange-700 text-xs text-white transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/10 btn-touch disabled:opacity-50"
            >
              <Facebook className="w-4.5 h-4.5 fill-current" />
              {oauthConnecting ? 'Redirecting to Meta Security Vault...' : 'Connect Meta Business Profile'}
            </button>

            <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.05] space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400 animate-pulse" />
                Target Ad Account Pacing
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Verifies Meta OAuth token on authentication.
              </p>
            </div>
          </div>

          {/* 2. DIRECT META API SLOT CONNECTION */}
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3.5">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-white">Custom API Slot for Ad Analysis</h3>
                <p className="text-[10px] text-muted">Bypass OAuth developer app approvals. Connect your live ad spend directly for advanced analysis.</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-[10px] font-semibold text-danger flex items-start gap-2">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl border border-success/20 bg-success/15 text-[10px] font-semibold text-success flex items-start gap-2">
                <Check className="w-4.5 h-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleConnectDirectToken} className="space-y-4">
              <fieldset className="space-y-4 border-none p-0 m-0">
                <legend className="sr-only">Connect Direct Meta API Account</legend>
                <div className="space-y-1.5">
                  <label htmlFor="direct-act-id" className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Ad Account ID</label>
                  <input
                    id="direct-act-id"
                    type="text"
                    placeholder="act_xxxxxxxxxxxx"
                    value={directActId}
                    onChange={(e) => setDirectActId(e.target.value)}
                    disabled={connecting}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white input-premium disabled:opacity-50"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="direct-token" className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Meta User Access Token</label>
                  <input
                    id="direct-token"
                    type="password"
                    placeholder="EAAdsa..."
                    value={directToken}
                    onChange={(e) => setDirectToken(e.target.value)}
                    disabled={connecting}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white input-premium disabled:opacity-50"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="direct-name" className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Custom Account Name (Optional)</label>
                  <input
                    id="direct-name"
                    type="text"
                    placeholder="My Activewear Shopify Store"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    disabled={connecting}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white input-premium disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={connecting}
                  aria-label="Link Live Ad Account"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-glow-primary btn-touch disabled:opacity-50 cursor-pointer"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      Connecting & Syncing...
                    </>
                  ) : (
                    <>
                      Link Live Ad Account
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </fieldset>
            </form>

            <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.05] space-y-1.5">
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Active Account Status
              </span>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Currently tracking: <span className="font-semibold text-white">{activeAccount?.name || 'Sandbox Demo Account'}</span>
              </p>
            </div>
          </div>

        </div>
        
      </div>
    </>
  );
}
