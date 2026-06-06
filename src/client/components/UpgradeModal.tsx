import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../../services/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function UpgradeModal({ isOpen, onClose, featureName = 'Premium Feature' }: UpgradeModalProps) {
  const { setPremium, brandColor } = useStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // CSS variables for brand colors
  const themeColors: Record<string, { from: string, to: string, text: string }> = {
    orange: { from: 'from-orange-500', to: 'to-amber-500', text: 'text-orange-500' },
    violet: { from: 'from-violet-500', to: 'to-fuchsia-500', text: 'text-violet-500' },
    emerald: { from: 'from-emerald-500', to: 'to-teal-500', text: 'text-emerald-500' },
    ocean: { from: 'from-blue-500', to: 'to-cyan-500', text: 'text-blue-500' },
    obsidian: { from: 'from-zinc-700', to: 'to-zinc-500', text: 'text-zinc-400' }
  };

  const color = themeColors[brandColor] || themeColors.orange;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      await apiClient.post('/activate-key', { code: code.trim() });
      setPremium(true);
      setSuccess(true);
      setError(false);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCode('');
      }, 2000);
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
          >
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              {/* Background Glow */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-gradient-to-r ${color.from} ${color.to} blur-[80px] opacity-20 pointer-events-none`} />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6 pt-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${color.from} ${color.to} mx-auto flex items-center justify-center mb-4 shadow-lg`}>
                  {success ? <CheckCircle2 className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {success ? 'Unlocked!' : 'Pro Feature Locked'}
                </h2>
                <p className="text-white/60 text-sm px-4">
                  {success 
                    ? 'All premium features are now permanently unlocked for this session.'
                    : `${featureName} is only available to Premium users. Enter your VIP access code to unlock.`}
                </p>
              </div>

              {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter Unique Access Code"
                        className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors`}
                      />
                    </div>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-red-400 text-xs mt-2 text-center"
                      >
                        Invalid code. Please try again.
                      </motion.p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${color.from} ${color.to} text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {loading ? 'Activating...' : 'Unlock Premium'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
