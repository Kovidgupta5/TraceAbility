import React from 'react';
import type { ImpactLine } from '../types';
import { CheckCircle2, CircleDashed, TerminalSquare } from 'lucide-react';

interface ActionPlanProps {
  fileName: string;
  impacts: ImpactLine[];
}

const ActionPlan: React.FC<ActionPlanProps> = ({ fileName, impacts }) => {
  if (impacts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <CheckCircle2 className="w-12 h-12 text-green-500 mb-4 opacity-80" />
        <h3 className="text-lg font-medium text-slate-200">No Changes Required</h3>
        <p className="mt-2 text-sm">This file is not impacted by the proposed feature.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 h-full flex flex-col">
      <div>
        <h3 className="text-lg font-semibold text-white">Action Plan</h3>
        <p className="text-sm text-slate-400 mt-1">Modifications for <span className="text-brand-400">{fileName}</span></p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {impacts.map((impact, index) => (
          <div key={index} className="relative pl-8 pb-4 last:pb-0">
            {/* Timeline Line */}
            {index !== impacts.length - 1 && (
              <div className="absolute top-6 left-[11px] bottom-0 w-px bg-white/10" />
            )}
            
            {/* Timeline Dot */}
            <div className="absolute top-1 left-0 bg-slate-900 rounded-full">
              <CircleDashed className="w-6 h-6 text-brand-400" />
            </div>
            
            {/* Content */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 transition-colors hover:bg-white/10 hover:border-brand-500/30 group">
              <div className="flex items-center gap-2 mb-2">
                <TerminalSquare className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-mono text-slate-300">Line {impact.lineNumber}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed group-hover:text-white transition-colors">
                {impact.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionPlan;
