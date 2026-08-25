import { useState } from 'react';
import WelcomeView from './components/WelcomeView';
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
import type { UploadedFile, EngineResult } from './types';
import { processImpactAnalysis } from './lib/mockEngine';
import { Loader2 } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<'welcome' | 'upload' | 'processing' | 'dashboard'>('welcome');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [request, setRequest] = useState('');
  const [results, setResults] = useState<EngineResult | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleAnalyze = async (uploadedFiles: UploadedFile[], featureRequest: string) => {
    setFiles(uploadedFiles);
    setRequest(featureRequest);
    setAppState('processing');
    
    try {
      const response = await processImpactAnalysis(uploadedFiles, featureRequest);
      setResults(response);
      
      // Do not auto-select a file so the OverviewPanel displays by default
      setSelectedFileId(null);
      
      setAppState('dashboard');
    } catch (error) {
      console.error('Error during analysis:', error);
      setAppState('upload');
    }
  };

  const handleReset = () => {
    setAppState('upload');
    setFiles([]);
    setRequest('');
    setResults(null);
    setSelectedFileId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-brand-500/30">
      {/* Background glowing effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
              TR
            </div>
            <h1 className="text-xl font-semibold tracking-tight">TraceAbility<span className="text-brand-400">.ai</span></h1>
          </div>
          {appState === 'dashboard' && (
            <button 
              onClick={handleReset}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload New Project
            </button>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {appState === 'welcome' && (
            <WelcomeView onStart={() => setAppState('upload')} />
          )}

          {appState === 'upload' && (
            <LandingView onAnalyze={handleAnalyze} />
          )}

          {appState === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl bg-brand-500/30 animate-pulse" />
                <Loader2 className="w-12 h-12 text-brand-400 animate-spin relative z-10" />
              </div>
              <h2 className="mt-6 text-2xl font-medium tracking-tight">Analyzing Impact...</h2>
              <p className="mt-2 text-slate-400">Mapping requirements to codebase architecture</p>
            </div>
          )}

          {appState === 'dashboard' && results && (
            <DashboardView 
              files={files} 
              results={results} 
              selectedFileId={selectedFileId} 
              onSelectFile={setSelectedFileId}
              onNewRequest={(req) => handleAnalyze(files, req)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
