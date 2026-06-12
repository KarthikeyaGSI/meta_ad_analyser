import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  content: string | React.ReactNode;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <HelpCircle className="w-3.5 h-3.5 text-white/30 hover:text-white/60 transition-colors ml-1.5 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[250px] bg-[#1a1c23] border border-white/10 text-white/80 p-3 shadow-xl z-[100]">
        <p className="text-xs leading-relaxed">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
