import { motion } from 'framer-motion';
import React from 'react';

interface NeumorphismButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export default function NeumorphismButton({ 
  children, 
  active = false, 
  className = '', 
  ...props 
}: NeumorphismButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden px-8 py-3.5 rounded-xl font-bold transition-all duration-300
        ${active 
          ? 'text-primary shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] bg-[#0F111A]' 
          : 'text-white shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.04)] bg-[#0F111A] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.5),-8px_-8px_16px_rgba(255,255,255,0.05)]'
        }
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
