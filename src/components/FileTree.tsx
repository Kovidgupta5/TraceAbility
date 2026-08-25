import React, { useState, useMemo } from 'react';
import type { UploadedFile, FileImpact } from '../types';
import { FileCode, AlertCircle, ChevronRight, Filter } from 'lucide-react';

interface FileTreeProps {
  files: UploadedFile[];
  impacts: FileImpact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, impacts, selectedId, onSelect }) => {
  const [showImpactedOnly, setShowImpactedOnly] = useState(true);

  const displayedFiles = useMemo(() => {
    let result = files;
    
    if (showImpactedOnly) {
      result = files.filter(file => {
        const fileImpact = impacts.find(i => i.fileId === file.id);
        return !!fileImpact && fileImpact.impacts.length > 0;
      });
    } else {
      // Sort impacted files to the top
      result = [...files].sort((a, b) => {
        const aImpact = impacts.find(i => i.fileId === a.id);
        const bImpact = impacts.find(i => i.fileId === b.id);
        const aHas = aImpact && aImpact.impacts.length > 0 ? 1 : 0;
        const bHas = bImpact && bImpact.impacts.length > 0 ? 1 : 0;
        return bHas - aHas;
      });
    }
    
    return result;
  }, [files, impacts, showImpactedOnly]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200">Analysis Overview</h3>
          <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-medium">
            {impacts.length} impacted
          </span>
        </div>
        
        <button
          onClick={() => setShowImpactedOnly(!showImpactedOnly)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showImpactedOnly 
              ? 'bg-brand-500/10 text-brand-400 hover:bg-brand-500/20' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'
          }`}
          title="Toggle impacted files filter"
        >
          <Filter className="w-3.5 h-3.5" />
          {showImpactedOnly ? 'Impacted Only' : 'All Files'}
        </button>
      </div>
      
      <div className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
        {/* Navigation button to return to overview */}
        <button
          onClick={() => onSelect('')}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 mb-4
            ${!selectedId 
              ? 'bg-indigo-500/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-indigo-500/50' 
              : 'text-indigo-300 hover:bg-white/5 hover:text-indigo-200'
            }
          `}
        >
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          </div>
          <span className="font-semibold text-sm">Overview Dashboard</span>
        </button>

        {displayedFiles.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm border-t border-white/5 pt-8">
            No files match the current filter.
          </div>
        )}
        
        {displayedFiles.map(file => {
          const fileImpact = impacts.find(i => i.fileId === file.id);
          const hasImpacts = !!fileImpact && fileImpact.impacts.length > 0;
          const isSelected = file.id === selectedId;
          
          return (
            <button
              key={file.id}
              onClick={() => onSelect(file.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 group
                ${isSelected 
                  ? 'bg-brand-500/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-brand-500/50' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }
              `}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-brand-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`} />
                <span className="truncate font-medium text-sm" title={file.name}>
                  {/* Show just the filename and its immediate parent directory to save space if it's long */}
                  {file.name.split('/').slice(-2).join('/') || file.name}
                </span>
              </div>
              
              {hasImpacts && (
                <div className="flex items-center gap-1.5 shrink-0 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-medium text-red-400">{fileImpact.impacts.length}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FileTree;
