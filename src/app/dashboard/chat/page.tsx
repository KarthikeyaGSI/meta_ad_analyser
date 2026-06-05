'use client';

import { useChat } from '@ai-sdk/react';
import { Bot, Send, User, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useStore } from '../../../store/useStore';
import ReactMarkdown from 'react-markdown';

export default function ChatDashboard() {
  const { isPremium } = useStore();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: 'Hi! I am Vero AI. I can analyze your active campaigns, identify creative fatigue, and help you deploy deterministic automation guardrails. What would you like to investigate today?'
      }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isPremium) return null; // Guarded by Sidebar UpgradeModal

  return (
    <div className="p-8 pb-24 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          Agentic AI Assistant
        </h1>
        <p className="text-muted mt-1">Talk to your Meta ad data. Get deterministic insights instantly.</p>
      </div>

      <div className="flex-1 bg-surface/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m) => (
            <motion.div 
              key={m.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-white/10' : 'bg-primary/20 border border-primary/30'}`}>
                {m.role === 'user' ? <User className="w-5 h-5 text-white/70" /> : <Sparkles className="w-5 h-5 text-primary" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-primary text-white shadow-glow-primary rounded-tr-sm' 
                  : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-sm'
              }`}>
                {m.role === 'assistant' ? (
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border-white/10 max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 text-white/50 border border-white/10 rounded-tl-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-white/10">
          <form onSubmit={handleSubmit} className="relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask why ROAS dropped, or ask to build a workflow..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
            <AlertTriangle className="w-3 h-3 text-warning/70" />
            Vero AI can make mistakes. Please verify automation rules in the Workflow builder before activating.
          </div>
        </div>
      </div>
    </div>
  );
}
