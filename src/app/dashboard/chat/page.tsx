'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../../store/useStore';
import { analyticsApi } from '../../../services/api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatPercent, formatRoas, formatNumber } from '../../../utils/formatters';
import { 
  Sparkles, 
  Send, 
  Key, 
  Lock, 
  Bot, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  Check, 
  ArrowRight, 
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isDataReport?: boolean;
}

export default function AiChatAnalyst() {
  const { activeAccount, dateRange, refreshTrigger } = useStore();
  const [apiKey, setApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am your Aetheris AI Chat Analyst. I have full context on your active campaign metrics, ad set targeting demographics, and creative fatigue scoreboards.\n\nAsk me anything, like: \n• 'Isolate my worst performing campaigns'\n• 'Draft a comprehensive ROAS performance audit'\n• 'Which ad creative is experiencing severe fatigue?'",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load API Key from LocalStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('ae_gemini_key');
    if (savedKey) {
      setApiKey(savedKey);
      setKeySaved(true);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch contextual metrics from API to feed the chatbot
  const { data: overview } = useQuery({
    queryKey: ['chatOverview', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return null;
      const res = await analyticsApi.getOverview(activeAccount.id, dateRange.startDate, dateRange.endDate);
      return res.data;
    },
    enabled: !!activeAccount,
  });

  const { data: campaignsTable } = useQuery({
    queryKey: ['chatCampaigns', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return { list: [] };
      const res = await analyticsApi.getCampaigns(activeAccount.id, dateRange.startDate, dateRange.endDate, { limit: 100 });
      return res.data;
    },
    enabled: !!activeAccount,
  });

  const { data: creativesTable } = useQuery({
    queryKey: ['chatCreatives', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return [];
      const res = await analyticsApi.getCreatives(activeAccount.id, dateRange.startDate, dateRange.endDate);
      return res.data;
    },
    enabled: !!activeAccount,
  });

  const campaigns = campaignsTable?.list || [];
  const creatives = creativesTable || [];

  // Save/Delete Key Handlers
  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('ae_gemini_key', apiKey.trim());
      setKeySaved(true);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('ae_gemini_key');
    setApiKey('');
    setKeySaved(false);
  };

  // Quick Prompt click
  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  // AI response generation logic
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeAccount) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setSending(true);

    try {
      if (keySaved && apiKey) {
        // --- LIVE GEMINI API MODE (With context injection) ---
        // Construct comprehensive data payload context
        const contextPayload = {
          accountName: activeAccount.name,
          dateRange: `${dateRange.startDate} to ${dateRange.endDate}`,
          overview: {
            spend: overview?.spend || 0,
            revenue: overview?.revenue || 0,
            roas: overview?.roas || 0,
            ctr: overview?.ctr || 0,
            cpc: overview?.cpc || 0,
            cpm: overview?.cpm || 0,
            cpa: overview?.cpa || 0,
            purchases: overview?.purchases || 0,
          },
          campaignsList: campaigns.map((c: any) => ({ name: c.name, spend: c.spend, roas: c.roas, purchases: c.purchases, status: c.status })),
          creativesList: creatives.map((cr: any) => ({ name: cr.name, spend: cr.spend, ctr: cr.ctr, roas: cr.roas, fatigueScore: cr.fatigueScore }))
        };

        const responseText = await queryGeminiApi(apiKey, userMessage, contextPayload);
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

      } else {
        // --- COHERENT SANDBOX COPILOT FALLBACK ---
        // Run deterministic query parsing based on database metrics
        const q = userMessage.toLowerCase();
        let reply = '';
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing wait

        if (q.includes('worst') || q.includes('bleed') || q.includes('bleeders')) {
          const bleeds = [...campaigns]
            .filter(c => c.spend > 10)
            .sort((a, b) => a.roas - b.roas)
            .slice(0, 2);
          
          reply = `### 🚨 Bleeding Campaigns Identified (Low ROAS Spenders)

Here are the active campaigns currently bleeding budget with conversion efficiency below target benchmarks:

${bleeds.map((c, i) => `${i+1}. **${c.name}**
   • **Spend**: ${formatCurrency(c.spend)}
   • **ROAS**: ${formatRoas(c.roas)}
   • **Purchases**: ${c.purchases}
   • **CPA**: ${formatCurrency(c.cpa)} (Highly elevated)
   • **Action Recommendation**: Recommend pausing active adset variants or shifting 50% budget allocation to higher performing lookalikes.`).join('\n\n')}`;

        } else if (q.includes('fatigue') || q.includes('creative') || q.includes('creative fatigue')) {
          const fatigued = [...creatives]
            .sort((a, b) => b.fatigueScore - a.fatigueScore)
            .slice(0, 2);

          reply = `### ⚠️ Ad Creative Fatigue Audit

Here are your active creatives sorted by highest audience saturation score:

${fatigued.map((cr, i) => `${i+1}. **${cr.name}**
   • **Fatigue Score**: ${cr.fatigueScore}/10 (${cr.fatigueScore >= 7.0 ? '🔴 Saturated' : '🟡 Warm'})
   • **Frequency**: ${cr.frequency}x (High repeat views)
   • **Spend**: ${formatCurrency(cr.spend)}
   • **CTR (7D)**: ${formatPercent(cr.ctr)}
   • **ROAS**: ${formatRoas(cr.roas)}
   • **Audit Recommendation**: Frequency has crossed threshold levels. Creative saturation is causing CPM spikes. Prepare a fresh video hook asset to refresh this campaign immediately.`).join('\n\n')}`;

        } else if (q.includes('best') || q.includes('winner') || q.includes('scale') || q.includes('scaling')) {
          const winners = [...campaigns]
            .filter(c => c.spend > 20)
            .sort((a, b) => b.roas - a.roas)
            .slice(0, 2);

          reply = `### 🎯 Scaling Opportunities Discovered

These active campaign buckets exhibit high conversion efficiency and are prime scaling targets:

${winners.map((c, i) => `${i+1}. **${c.name}**
   • **Spend**: ${formatCurrency(c.spend)}
   • **ROAS**: ${formatRoas(c.roas)}
   • **Purchases**: ${c.purchases}
   • **CPA**: ${formatCurrency(c.cpa)}
   • **Scaling Plan**: Incrementally scale daily campaign budget by **15% to 20%** now. Re-evaluate metrics in 48 hours to ensure auction CPA stays within stable thresholds.`).join('\n\n')}`;

        } else {
          // Standard overview response
          reply = `### 📊 Performance Summary for ${activeAccount.name}
Range: ${dateRange.label} (${dateRange.startDate} to ${dateRange.endDate})

Here is the high-level audit for this account context:
• **Total Ad Spend**: ${formatCurrency(overview?.spend || 0)}
• **Revenue Generated**: ${formatCurrency(overview?.revenue || 0)}
• **Overall ROAS**: ${formatRoas(overview?.roas || 0)}
• **Acquisitions (Purchases)**: ${overview?.purchases || 0}
• **Avg Click-Through Rate**: ${formatPercent(overview?.ctr || 0)}

You have **${campaigns.length} campaigns** active. Let me know if you would like me to isolate **creative fatigue ratings** or detail the **best scaling opportunities**!`;
        }

        setMessages(prev => [...prev, {
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDataReport: true
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `### ❌ AI Integration Error\n\nFailed to fetch response from Gemini. Please verify that your API key is correct.\n\n*Error details: ${err.message || 'Network Timeout'}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setSending(false);
    }
  };

  // Fetch API call to Google Gemini Graph Node
  const queryGeminiApi = async (key: string, queryText: string, context: any): Promise<string> => {
    // We target gemini-1.5-flash for maximum efficiency and speed
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    const systemPrompt = `You are the Aetheris AI Chat Analyst, a premium enterprise-grade media buying copilot. 
Your goal is to perform high-fidelity data audits on the user's Meta Ad account data.

Here is the exact live context of their Meta Ad Account:
Ad Account: ${context.accountName}
Date Range Selected: ${context.dateRange}

OVERALL METRICS SUMMARY:
- Spend: ${formatCurrency(context.overview.spend)}
- Revenue: ${formatCurrency(context.overview.revenue)}
- ROAS: ${formatRoas(context.overview.roas)}
- CTR: ${formatPercent(context.overview.ctr)}
- CPC: ${formatCurrency(context.overview.cpc)}
- CPM: ${formatCurrency(context.overview.cpm)}
- CPA: ${formatCurrency(context.overview.cpa)}
- Purchases: ${context.overview.purchases}

HIERARCHICAL CAMPAIGNS METRICS:
${JSON.stringify(context.campaignsList, null, 2)}

CREATIVES FATIGUE PERFORMANCE GRID:
${JSON.stringify(context.creativesList, null, 2)}

Use this exact numbers to audit their account. When asked questions, refer to specific campaigns and creatives by name.
Calculate ROAS and CPC ratios perfectly. Suggest professional marketing strategies (e.g. increase winner budget by 15-20% incrementally, rotate fatigued creatives with high frequency, pause bleeder adsets).
Keep your tone highly professional, analytical, and direct. Format your response in markdown.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${queryText}` }]
          }
        ]
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'API query failed.');
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from the model.';
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            AI Chat Analyst <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
          </h1>
          <p className="text-sm text-muted">Consult Aetheris Copilot on campaign ROAS, audience fatigue, and scaling opportunities.</p>
        </div>
      </div>

      {/* DUAL SECTION: API PORT & CHAT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: GEMINI KEY PORT (THE VAULT) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06]">
              <Lock className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Gemini API Key Port</h3>
            </div>

            <p className="text-[10px] text-muted leading-relaxed">
              Connect your Google Gemini API Key to upgrade to **Live Context-Injection LLM Mode**.
            </p>

            <div className="space-y-3">
              {keySaved ? (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-success/15 border border-success/20 flex items-center gap-2.5 text-success text-xs font-semibold">
                    <Check className="w-4 h-4" />
                    Vault Connected
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    API Key saved in local browser memory. Chatbot is running on active **Gemini-1.5-Flash** node.
                  </p>
                  <button
                    onClick={handleClearKey}
                    className="w-full py-2 px-4 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/15 text-[10px] font-bold text-danger transition"
                  >
                    Disconnect API Key
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] focus:border-primary/50 text-[11px] text-white focus:outline-none transition"
                    />
                  </div>
                  <button
                    onClick={handleSaveKey}
                    disabled={!apiKey.trim()}
                    className="w-full py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-[10px] font-bold text-white transition disabled:opacity-50"
                  >
                    Save Key to Browser
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* QUICK CHATS PROMPT BOARD */}
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06]">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Quick Suggestions</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleQuickPrompt('Which campaign is doing best and ready to scale?')}
                className="p-2.5 rounded-xl border border-white/[0.06] hover:border-primary/30 bg-white/[0.01] hover:bg-white/[0.03] text-left text-[10px] font-medium text-slate-300 hover:text-white transition flex items-center justify-between group"
              >
                Scale Win Opportunities
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-primary transition-all" />
              </button>
              <button
                onClick={() => handleQuickPrompt('Perform a creative fatigue audit on my active visual assets')}
                className="p-2.5 rounded-xl border border-white/[0.06] hover:border-primary/30 bg-white/[0.01] hover:bg-white/[0.03] text-left text-[10px] font-medium text-slate-300 hover:text-white transition flex items-center justify-between group"
              >
                Creative Fatigue Audit
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-primary transition-all" />
              </button>
              <button
                onClick={() => handleQuickPrompt('Isolate my worst performing campaign and draft action steps')}
                className="p-2.5 rounded-xl border border-white/[0.06] hover:border-primary/30 bg-white/[0.01] hover:bg-white/[0.03] text-left text-[10px] font-medium text-slate-300 hover:text-white transition flex items-center justify-between group"
              >
                Isolate Budget Bleeds
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-primary transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT 3 COLUMNS: DIALOG DIALOG CONTAINER */}
        <div className="lg:col-span-3 glass-panel rounded-3xl h-[560px] flex flex-col justify-between overflow-hidden">
          
          {/* Chat Window Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => {
              const isAi = msg.sender === 'ai';
              
              return (
                <div
                  key={index}
                  className={`flex gap-3.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {/* AI Avatar */}
                  {isAi && (
                    <div className="p-2.5 h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-primary flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 animate-pulse" />
                    </div>
                  )}

                  <div className={`p-4.5 rounded-2xl max-w-[85%] space-y-1.5 ${
                    isAi 
                      ? 'bg-white/[0.015] border border-white/[0.05] text-slate-200' 
                      : 'bg-primary/10 border border-primary/20 text-white shadow-glow-primary'
                  }`}>
                    {/* Message Text formatted in Markdown */}
                    <div className="text-xs leading-relaxed font-semibold whitespace-pre-line prose prose-invert max-w-none">
                      {msg.text}
                    </div>
                    
                    <p className="text-[9px] text-muted font-medium text-right mt-1">
                      {msg.timestamp}
                    </p>
                  </div>

                  {/* User Avatar */}
                  {!isAi && (
                    <div className="p-2.5 h-10 w-10 rounded-xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {sending && (
              <div className="flex gap-3.5 justify-start">
                <div className="p-2.5 h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.05] flex items-center gap-1.5 py-3">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef}></div>
          </div>

          {/* Form input */}
          <form 
            onSubmit={handleSend}
            className="p-4 border-t border-white/[0.06] bg-white/[0.005] flex items-center gap-3"
          >
            <input
              type="text"
              placeholder={activeAccount ? "Ask AI Chat Analyst about campaign stats..." : "Connect an account in Navbar to chat"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending || !activeAccount}
              className="flex-1 px-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] focus:border-primary/50 text-xs text-white placeholder-muted focus:outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim() || !activeAccount}
              className="p-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white transition disabled:opacity-50 shadow-glow-primary shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </>
  );
}
