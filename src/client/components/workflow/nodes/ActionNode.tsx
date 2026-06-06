import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

function ActionNode({ data }: { data: any }) {
  return (
    <div className="relative group px-5 py-4 rounded-xl border border-white/10 bg-surface/90 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-primary/50 hover:shadow-glow-primary min-w-[220px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Play className="w-5 h-5 text-emerald-500 ml-0.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white leading-none mb-1">{data.label || 'Action'}</h3>
          <p className="text-[11px] text-muted-foreground">{data.description || 'Executes a task'}</p>
        </div>
      </div>

      {/* Decorative top edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-xl opacity-80" />

      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-white border-2 border-emerald-500 transition-all group-hover:scale-125"
      />
      
      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-white border-2 border-emerald-500 transition-all group-hover:scale-125"
      />
    </div>
  );
}

export default memo(ActionNode);
