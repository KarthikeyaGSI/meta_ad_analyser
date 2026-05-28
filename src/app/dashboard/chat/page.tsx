'use client';

import React, { useRef, useEffect } from 'react';
import { useStore } from '../../../store/useStore';
import { useChat } from '@ai-sdk/react';
import { Sparkles, Send, Bot, User, ArrowRight, BrainCircuit, MessageSquare, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiChatAnalyst() {
  const { activeAccount } = useStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat(({
    api: '/api/chat',
    body: {
      accountId: activeAccount?.id
    }
  } as any)) as any;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickPrompt = (promptText: string) => {
    // A bit hacky but we simulate a submit by manually constructing the fake event for useChat
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
    handleInputChange({ target: { value: promptText } } as any);
    setTimeout(() => handleSubmit(fakeEvent), 50);
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* LEFT COLUMN: QUICK PROMPTS */}
        <div className="lg:col-span-1 space-y-6">
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

        {/* RIGHT 3 COLUMNS: CHAT */}
        <div className="lg:col-span-3 glass-panel rounded-3xl h-[600px] flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-muted">
                <div className="flex flex-col items-center gap-3">
                  <Bot className="w-12 h-12 text-primary/50" />
                  <p className="text-sm">Hello! I am your Aetheris AI Chat Analyst.<br/>Ask me about your campaign performance.</p>
                </div>
              </div>
            )}
            
            {messages.map((msg: any, index: number) => {
              const isAi = msg.role === 'assistant';
              return (
                <div key={index} className={`flex gap-3.5 ${isAi ? 'justify-start' : 'justify-end'}`}>
                  {isAi && (
                    <div className="p-2.5 h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-primary flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}
                  <div className={`p-4.5 rounded-2xl max-w-[85%] space-y-1.5 ${
                    isAi 
                      ? 'bg-white/[0.015] border border-white/[0.05] text-slate-200' 
                      : 'bg-primary/10 border border-primary/20 text-white shadow-glow-primary'
                  }`}>
                    <div className="text-xs leading-relaxed font-semibold whitespace-pre-wrap prose prose-invert max-w-none">
                      {msg.content}
                    </div>
                  </div>
                  {!isAi && (
                    <div className="p-2.5 h-10 w-10 rounded-xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {isLoading && (
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
            
            {error && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Error: {error.message}
              </div>
            )}
            
            <div ref={chatEndRef}></div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.06] bg-white/[0.005] flex items-center gap-3">
            <input
              type="text"
              placeholder={activeAccount ? "Ask AI Chat Analyst..." : "Select an account to chat"}
              value={input}
              onChange={handleInputChange}
              disabled={isLoading || !activeAccount}
              className="flex-1 px-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] focus:border-primary/50 text-xs text-white placeholder-muted focus:outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !activeAccount}
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
