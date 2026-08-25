import React from 'react';
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';

interface WelcomeViewProps {
  onStart: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden animate-in fade-in duration-1000">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-400/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center text-center max-w-3xl">
        <div className="w-20 h-20 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-8 border border-brand-500/30 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
          <BrainCircuit className="w-10 h-10 text-brand-400" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          Impact Analysis Engine
        </h1>
        
        <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          Upload your codebase, describe a feature, and let our AI instantly map out the architectural impact across your entire project.
        </p>

        <button 
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-brand-600 rounded-full hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Start Engine
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          {/* Subtle pulse ring */}
          <span className="absolute inset-0 rounded-full border border-brand-400/50 animate-ping opacity-20"></span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeView;
