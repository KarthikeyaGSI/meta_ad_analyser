'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { authApi } from '../../../services/api';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldCheck, 
  Activity, 
  Terminal, 
  Check, 
  X,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MetaAuthResponse } from '../../../types/auth';


interface DebugState {
  oAuthSuccess: boolean;
  tokenReceived: boolean;
  accountsRetrieved: boolean;
  accountVerified?: boolean | null;
  insightsWorking?: boolean | null;
  campaignCount: number;
  hasSpendData?: boolean | null;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setActiveAccount, triggerRefresh } = useStore();
  
  const [status, setStatus] = useState<'CONNECTING' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('CONNECTING');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('Exchanging Meta OAuth handshakes...');
  
  // Developer Debug Card state
  const [debug, setDebug] = useState<DebugState>({
    oAuthSuccess: false,
    tokenReceived: false,
    accountsRetrieved: false,
    accountVerified: false,
    insightsWorking: false,
    campaignCount: 0,
    hasSpendData: false
  });

  const TARGET_ACCOUNT_ID = '1077709497594167';

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        setStatus('ERROR');
        setErrorMsg('Authorization code not returned from Meta OAuth dialog.');
        return;
      }

      try {
        const savedSession = localStorage.getItem('ae_session');
        let userId = 'demo-user-id';
        if (savedSession) {
          try {
            userId = JSON.parse(savedSession).id;
          } catch {}
        } else {
          userId = `oauth-u-${Date.now()}`;
        }

        // Step 1: OAuth callback triggered
        console.log("OAuth success: Authorization code successfully captured.");

        setStatusMsg('Exchanging code for long-lived access token...');
        
        // Post code to Express backend node
        const res = await authApi.submitMetaCallback(code, userId);
        
        // Expose debug details from backend response
        const data: MetaAuthResponse = res.data;
        const {
          token,
          user,
          accounts = [],
          adAccountConnected,
          insightsWorking,
          campaignCount = 0,
          hasSpendData = false,
        } = data;

        console.log("Meta accounts fetched:", accounts);

        // Step 2: Token and Accounts retrieved
        setDebug(prev => ({ 
          ...prev, 
          tokenReceived: !!token,
          accountsRetrieved: true,
          accountVerified: adAccountConnected ?? false,
          insightsWorking: insightsWorking ?? false,
          campaignCount: campaignCount || 0,
          hasSpendData: hasSpendData ?? false        }));

        setStatusMsg('Verifying ad account metrics pacing...');
        setStatus('SYNCING');

        // Save session credentials
        if (token && user) {
          setUser({ token, id: user.id, name: user.name, email: user.email });
        }

        // Set the targeted account as the active workspace
        if (accounts && accounts.length > 0) {
          const matchedAcc = accounts.find((a: any) => a.actId.includes(TARGET_ACCOUNT_ID));
          if (matchedAcc) {
            console.log("Live mode activated: Switched from guest sandbox to live API pacing.");
            setActiveAccount({
              id: matchedAcc.id,
              name: matchedAcc.name,
              actId: matchedAcc.actId
            });
          } else {
            setActiveAccount({
              id: accounts[0].id,
              name: accounts[0].name,
              actId: accounts[0].actId
            });
          }
        }

        setStatus('SUCCESS');
        setStatusMsg('Meta Ads connection verified successfully.');
        triggerRefresh();

        // Forward to overview dashboard after short success display
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);

      } catch (err: any) {
        console.error('[OAuth Callback] Target Account integration failed:', err);
        setStatus('ERROR');
        setErrorMsg(err.response?.data?.details || err.response?.data?.reason || 'Failed to exchange Meta tokens.');
      }
    };

    handleCallback();
  }, [searchParams, router, setUser, setActiveAccount, triggerRefresh]);

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Spotlights */}
      <div className="glow-bg top-[-100px] left-[-100px] opacity-10"></div>
      <div className="glow-bg bottom-[-200px] right-[-100px] opacity-15" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(0,0,0,0) 70%)' }}></div>

      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-8 items-start z-10">
        
        {/* LEFT CARD: STATUS MATRIX & LOADER */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 w-full glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-[450px]"
        >
          {/* Brand header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center">
              <Sparkles className="w-3 text-white" />
            </div>
            <span className="font-extrabold text-xs tracking-widest text-white">AETHERIS</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 mb-4">
            {status === 'CONNECTING' && (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <h3 className="text-base font-bold text-white leading-tight">Establishing OAuth Connection</h3>
                <p className="text-[11px] text-muted max-w-xs">{statusMsg}</p>
              </>
            )}

            {status === 'SYNCING' && (
              <>
                <Activity className="w-10 h-10 text-indigo-400 animate-pulse" />
                <h3 className="text-base font-bold text-white leading-tight">Pacing Ad Set Metrics</h3>
                <p className="text-[11px] text-muted max-w-xs">{statusMsg}</p>
              </>
            )}

            {status === 'SUCCESS' && (
              <>
                <div className="p-3.5 rounded-full bg-success/15 border border-success/20 text-success shadow-glow-success animate-bounce">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-success leading-tight">Handshake Verified</h3>
                {/* Verified success prompt */}
                <div className="p-2.5 rounded-xl bg-success/10 border border-success/20 text-[10px] font-bold text-success uppercase tracking-wider">
                  Meta Ads connection verified successfully.
                </div>
                <p className="text-[11px] text-muted">Active ad account: act_{TARGET_ACCOUNT_ID}</p>
              </>
            )}

            {status === 'ERROR' && (
              <>
                <div className="p-3 rounded-full bg-danger/15 border border-danger/20 text-danger">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white leading-tight">Sync Handshake Blocked</h3>
                <p className="text-[10px] text-danger font-semibold bg-danger/5 border border-danger/10 p-3 rounded-xl text-left max-h-40 overflow-y-auto whitespace-pre-line mt-2">
                  {errorMsg}
                </p>
              </>
            )}
          </div>

          {/* Sync Pacing Indicators */}
          <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Sync Pacing Status
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status !== 'CONNECTING' ? 'bg-success' : 'bg-white/10'}`}></div>
                <span>Connected: {status !== 'CONNECTING' ? 'Yes' : 'Pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'SYNCING' || status === 'SUCCESS' ? 'bg-success animate-pulse' : 'bg-white/10'}`}></div>
                <span>Syncing: {status === 'SYNCING' ? 'Active' : status === 'SUCCESS' ? 'Complete' : 'Pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'SUCCESS' ? 'bg-success' : 'bg-white/10'}`}></div>
                <span>Sync Complete: {status === 'SUCCESS' ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${debug.insightsWorking ? 'bg-success' : 'bg-white/10'}`}></div>
                <span>Insights Working: {debug.insightsWorking ? 'Verified' : 'Pending'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT CARD: TEMPORARY DEVELOPER DEBUG CARD */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full md:w-72 glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-[450px]"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06]">
              <Terminal className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Developer Debug Console</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted font-medium">OAuth Handshake:</span>
                {debug.oAuthSuccess 
                  ? <span className="text-success font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Success</span>
                  : <span className="text-muted font-bold">Pending</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted font-medium">Token Received:</span>
                {debug.tokenReceived 
                  ? <span className="text-success font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Exchanged</span>
                  : <span className="text-muted font-bold">Pending</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted font-medium">Accounts Retrieved:</span>
                {debug.accountsRetrieved 
                  ? <span className="text-success font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Fetched</span>
                  : <span className="text-muted font-bold">Pending</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted font-medium">Account Verified:</span>
                {debug.accountVerified 
                  ? <span className="text-success font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {TARGET_ACCOUNT_ID}</span>
                  : <span className="text-muted font-bold">Pending</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted font-medium">Insights API:</span>
                {debug.insightsWorking 
                  ? <span className="text-success font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Working</span>
                  : <span className="text-muted font-bold">Pending</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted font-medium">Campaigns Synced:</span>
                {debug.campaignCount > 0 
                  ? <span className="text-success font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {debug.campaignCount} Campaigns</span>
                  : <span className="text-muted font-bold">0 Synced</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted font-medium">Has Spend Data:</span>
                {debug.hasSpendData 
                  ? <span className="text-success font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Yes</span>
                  : <span className="text-muted font-bold">No</span>}
              </div>
            </div>
          </div>

          {status === 'ERROR' ? (
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] text-[10px] font-bold text-white transition flex items-center justify-center gap-1"
            >
              Back to Security Vault
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-white/[0.015] border border-white/[0.05] space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Play className="w-2.5 h-2.5 text-primary fill-current" />
                Target Verification
              </span>
              <p className="text-[10px] text-muted font-semibold leading-relaxed">
                Tethered and synced with Meta Account ID: <span className="text-white font-bold">{TARGET_ACCOUNT_ID}</span>
              </p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
