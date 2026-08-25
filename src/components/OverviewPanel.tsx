import React from 'react';
import type { UploadedFile, EngineResult } from '../types';
import { Sparkles, BrainCircuit, FileCode, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface OverviewPanelProps {
  files: UploadedFile[];
  results: EngineResult;
  onSelectFile: (id: string) => void;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({ files, results, onSelectFile }) => {
  return (
    <div className="h-full w-full p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-brand-400" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Analysis Complete</h2>
          </div>
          <p className="text-lg text-slate-400 leading-relaxed">
            {results.overallSummary}
          </p>
        </div>

        {/* AI Logic Explanation Card */}
        {results.explanation && (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-400 to-indigo-500" />
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0 mt-1">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-200">Engine Reasoning</h3>
                <div className="text-sm text-slate-400 leading-relaxed prose prose-invert max-w-none">
                  <ReactMarkdown>{results.explanation}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Impacted Files Summary */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Recommended Changes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.fileImpacts.map(impact => {
              const file = files.find(f => f.id === impact.fileId);
              if (!file) return null;

              return (
                <button
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className="flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-500/50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCode className="w-5 h-5 text-brand-400 shrink-0" />
                      <span className="font-medium text-slate-200 truncate" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
                      {impact.impacts.length} impact{impact.impacts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {impact.impacts[0]?.reason || "Modifications required for this component."}
                  </div>
                  
                  <div className="mt-2 text-xs font-medium text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Review Code Changes &rarr;
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* New Files Required */}
        {results.newFiles && results.newFiles.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
              Required New Files
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.newFiles.map((newFile, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 p-5 rounded-2xl border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400 shrink-0"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    <span className="font-semibold text-brand-300 truncate" title={newFile.suggestedName}>
                      {newFile.suggestedName}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-400 leading-relaxed">
                    {newFile.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OverviewPanel;
