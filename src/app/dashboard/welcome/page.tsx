'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ShieldCheck, Rocket, BrainCircuit, HeadphonesIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NeumorphismButton from '../../../client/components/NeumorphismButton';

export default function WelcomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Section 1 Opacity
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  // Section 2 Opacity
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.4, 0.7], [50, 0, -50]);

  // Section 3 Opacity
  const opacity3 = useTransform(scrollYProgress, [0.6, 0.8, 1], [0, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.6, 0.8], [50, 0]);

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-background text-white">
      {/* Sticky container for the scrolling content */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* SECTION 1: Core Value */}
        <motion.div 
          style={{ opacity: opacity1, y: y1 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 max-w-4xl mx-auto pointer-events-none"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(249,115,22,0.2)]">
            <BrainCircuit className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Vero</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted max-w-2xl leading-relaxed">
            Your decision intelligence engine is ready. We've connected your node and are analyzing your ad accounts.
          </p>
          <div className="mt-12 text-sm text-white/40 animate-bounce">
            Scroll down to explore
          </div>
        </motion.div>

        {/* SECTION 2: Premium Benefits */}
        <motion.div 
          style={{ opacity: opacity2, y: y2 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 max-w-5xl mx-auto pointer-events-none"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Unlock the Full Potential</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/10">
              <Rocket className="w-12 h-12 text-orange-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Scale Radar</h3>
              <p className="text-sm text-muted">Automatically detect winning ad variations and scale them seamlessly.</p>
            </div>
            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <HeadphonesIcon className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Priority Support</h3>
              <p className="text-sm text-muted">Premium customers get priority support directly from our expert team.</p>
            </div>
            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/10">
              <ShieldCheck className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Competitor Intel</h3>
              <p className="text-sm text-muted">Deep dive into competitor creatives, spend, and funnel strategies.</p>
            </div>
          </div>
        </motion.div>

        {/* SECTION 3: Enter Dashboard */}
        <motion.div 
          style={{ opacity: opacity3, y: y3, pointerEvents: 'auto' }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to dominate?</h2>
          <p className="text-xl text-muted mb-12 max-w-xl mx-auto">
            Your dashboard is calibrated. Experience the next generation of Meta Ads auditing.
          </p>
          <NeumorphismButton 
            onClick={() => router.push('/dashboard')}
            className="text-lg px-12 py-5"
            active={true}
          >
            Enter Dashboard
          </NeumorphismButton>
        </motion.div>

      </div>
    </div>
  );
}
