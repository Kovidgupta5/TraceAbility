import React, { useState } from 'react';
import type { UploadedFile, EngineResult } from '../types';
import FileTree from './FileTree';
import CodeViewer from './CodeViewer';
import ActionPlan from './ActionPlan';
import OverviewPanel from './OverviewPanel';
import { Search } from 'lucide-react';

interface DashboardViewProps {
  files: UploadedFile[];
  results: EngineResult;
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  onNewRequest: (req: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ files, results, selectedFileId, onSelectFile, onNewRequest }) => {
  const [newRequestStr, setNewRequestStr] = useState('');
  const selectedFile = files.find(f => f.id === selectedFileId);
  const selectedImpacts = results.fileImpacts.find(fi => fi.fileId === selectedFileId)?.impacts || [];

  return (
    <div className="flex-1 w-full flex flex-col overflow-hidden animate-in fade-in duration-500">
      <div className="bg-brand-500/10 border-b border-brand-500/20 px-6 py-3 shrink-0 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-brand-100 flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
          </span>
          {results.overallSummary}
        </p>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (newRequestStr.trim()) {
              onNewRequest(newRequestStr.trim());
              setNewRequestStr('');
            }
          }}
          className="flex items-center gap-2 max-w-[400px] w-full relative"
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400/60 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input 
            value={newRequestStr}
            onChange={(e) => setNewRequestStr(e.target.value)}
            placeholder="Ask about another feature for this project..."
            className="w-full bg-black/40 border border-brand-500/20 rounded-lg pl-9 pr-24 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
          <button 
            type="submit" 
            disabled={!newRequestStr.trim()}
            className="absolute right-1 top-1 bottom-1 px-3 bg-brand-500 text-white text-xs font-semibold rounded-md hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze
          </button>
        </form>
      </div>
      
      <div className="flex-1 grid grid-cols-12 overflow-hidden bg-slate-950/50 min-h-0">
        {/* Left Sidebar */}
        <div className="col-span-12 lg:col-span-3 border-r border-white/5 overflow-y-auto bg-black/40">
          <FileTree 
            files={files} 
            impacts={results.fileImpacts} 
            selectedId={selectedFileId} 
            onSelect={onSelectFile} 
          />
        </div>

        {/* Main Content Area */}
        {selectedFile ? (
          <>
            {/* Center View */}
            <div className="col-span-12 lg:col-span-6 border-r border-white/5 overflow-y-auto relative bg-[#0d1117] shadow-inner">
              <CodeViewer file={selectedFile} impacts={selectedImpacts} />
            </div>

            {/* Right Panel */}
            <div className="col-span-12 lg:col-span-3 overflow-y-auto bg-black/40">
              <ActionPlan fileName={selectedFile.name} impacts={selectedImpacts} />
            </div>
          </>
        ) : (
          <div className="col-span-12 lg:col-span-9 bg-[#0d1117] relative overflow-y-auto custom-scrollbar">
            <OverviewPanel files={files} results={results} onSelectFile={onSelectFile} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
