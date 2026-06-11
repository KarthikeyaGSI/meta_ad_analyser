'use client';

import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success' | 'warning' | 'outline' | 'default' | 'link';
type ButtonState   = 'idle' | 'loading' | 'syncing' | 'success' | 'failed' | 'disabled';
type ButtonSize    = 'sm' | 'md' | 'lg' | 'icon' | 'default';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:      ButtonVariant;
  size?:         ButtonSize;
  state?:        ButtonState;
  icon?:         React.ReactNode;
  iconPosition?: 'left' | 'right';
  loadingText?:  string;
  successText?:  string;
  failedText?:   string;
  fullWidth?:    boolean;
  asChild?:      boolean; // shadcn compat — ignored, just prevents TS errors
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:     'bg-[#4f6ef7] hover:bg-[#3d5de0] text-white border border-[#4f6ef7]/50',
  secondary:   'bg-white/5 hover:bg-white/8 text-[#f1f3f5] border border-white/10 hover:border-white/16',
  ghost:       'bg-transparent hover:bg-white/5 text-[#8b92a0] hover:text-[#f1f3f5] border border-transparent',
  outline:     'bg-transparent hover:bg-white/5 text-[#f1f3f5] border border-white/14 hover:border-white/20',
  default:     'bg-white/5 hover:bg-white/8 text-[#f1f3f5] border border-white/10 hover:border-white/16',
  link:        'bg-transparent text-[#818cf8] hover:underline border border-transparent',
  destructive: 'bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/25 hover:border-red-500/40',
  success:     'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  warning:     'bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 border border-amber-500/25',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:      'h-8 px-3 text-xs rounded-md gap-1.5',
  md:      'h-9 px-4 text-sm rounded-lg gap-2',
  lg:      'h-11 px-6 text-sm rounded-xl gap-2.5',
  icon:    'h-9 w-9 p-0 rounded-lg flex items-center justify-center',
  default: 'h-9 px-4 text-sm rounded-lg gap-2',
};

// Compatibility shim for shadcn components (alert-dialog, calendar, navigation-menu, etc.)
export function buttonVariants({ variant = 'secondary', size = 'md', className = '' }: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return [
    'inline-flex items-center justify-center font-medium select-none cursor-pointer transition-all duration-150',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    sizeStyles[size],
    variantStyles[variant],
    className,
  ].filter(Boolean).join(' ');
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant      = 'secondary',
    size         = 'md',
    state        = 'idle',
    icon,
    iconPosition = 'left',
    loadingText,
    successText  = 'Done',
    failedText   = 'Failed',
    fullWidth    = false,
    children,
    disabled,
    className    = '',
    asChild,     // consumed here, not passed to DOM
    ...props
  },
  ref
) {
  const isDisabled = disabled || state === 'disabled' || state === 'loading' || state === 'syncing';
  const isLoading  = state === 'loading' || state === 'syncing';

  let displayContent: React.ReactNode = children;
  let displayIcon: React.ReactNode = icon;

  if (isLoading) {
    displayIcon    = <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    displayContent = loadingText ?? (state === 'syncing' ? 'Syncing…' : 'Loading…');
  } else if (state === 'success') {
    displayIcon    = <CheckCircle2 className="w-3.5 h-3.5" />;
    displayContent = successText;
  } else if (state === 'failed') {
    displayIcon    = <XCircle className="w-3.5 h-3.5" />;
    displayContent = failedText;
  }

  const resolvedVariant: ButtonVariant =
    state === 'success' ? 'success' :
    state === 'failed'  ? 'destructive' :
    variant;

  return (
    <motion.button
      ref={ref}
      whileHover={!isDisabled ? { scale: 1.01 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.12 }}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium select-none cursor-pointer',
        'transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        sizeStyles[size],
        variantStyles[resolvedVariant],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {displayIcon && iconPosition === 'left'  && displayIcon}
      {displayContent}
      {displayIcon && iconPosition === 'right' && displayIcon}
    </motion.button>
  );
});

Button.displayName = 'Button';
