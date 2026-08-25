import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Code2, Sparkles, FileCode, X, Loader2 } from 'lucide-react';
import type { UploadedFile } from '../types';

interface LandingViewProps {
  onAnalyze: (files: UploadedFile[], request: string) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onAnalyze }) => {
  const [request, setRequest] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [readProgress, setReadProgress] = useState({ current: 0, total: 0 });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Filter out common ignored directories and non-code files if needed
    const validFiles = acceptedFiles.filter(f => {
      const path = f.webkitRelativePath || f.name;
      const lowerPath = path.toLowerCase();
      
      // Ignore common build directories and binary/compiled files
      return !path.includes('node_modules') && 
             !path.includes('.git/') && 
             !path.includes('dist/') && 
             !path.includes('build/') &&
             !path.includes('.next/') &&
             !path.includes('__pycache__') &&
             !lowerPath.endsWith('.pyc') &&
             !lowerPath.endsWith('.png') &&
             !lowerPath.endsWith('.jpg') &&
             !lowerPath.endsWith('.jpeg') &&
             !lowerPath.endsWith('.ico') &&
             !lowerPath.endsWith('.svg');
    });

    if (validFiles.length === 0) return;

    setIsReading(true);
    setReadProgress({ current: 0, total: validFiles.length });

    const newUploadedFiles: UploadedFile[] = [];

    // Process in chunks to avoid blocking the UI thread completely
    const chunkSize = 50;
    for (let i = 0; i < validFiles.length; i += chunkSize) {
      const chunk = validFiles.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(file => {
        return new Promise<UploadedFile | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: Math.random().toString(36).substring(2, 9),
              name: file.webkitRelativePath || file.name,
              content: reader.result as string
            });
          };
          reader.onerror = () => resolve(null);
          reader.readAsText(file);
        });
      });

      const results = await Promise.all(chunkPromises);
      results.forEach(res => {
        if (res) newUploadedFiles.push(res);
      });

      setReadProgress(prev => ({ ...prev, current: Math.min(i + chunkSize, validFiles.length) }));
      
      // Yield to main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    setFiles(prev => {
      // Filter out files that already exist to prevent duplicates
      const existingNames = new Set(prev.map(f => f.name));
      const uniqueNewFiles = newUploadedFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...uniqueNewFiles];
    });
    setIsReading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length > 0 && request.trim()) {
      onAnalyze(files, request);
    }
  };

  const displayFiles = files.slice(0, 6);
  const remainingFiles = files.length - displayFiles.length;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Impact Analysis</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your source code and describe the new feature. Our engine will map requirements directly to the lines of code that need modification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Zone */}
          <div 
            {...getRootProps()} 
            className={`
              relative group cursor-pointer p-8 rounded-2xl border-2 border-dashed transition-all duration-300
              ${isDragActive 
                ? 'border-brand-500 bg-brand-500/10' 
                : 'border-white/10 bg-white/5 hover:border-brand-500/50 hover:bg-white/10'
              }
              ${isReading ? 'pointer-events-none opacity-80' : ''}
            `}
          >
            <input {...getInputProps({ webkitdirectory: 'true' } as any)} />
            
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className={`p-4 rounded-full bg-white/5 transition-transform duration-300 ${isDragActive ? 'scale-110 bg-brand-500/20' : 'group-hover:scale-110'}`}>
                {isReading ? (
                  <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                ) : (
                  <Upload className={`w-8 h-8 ${isDragActive ? 'text-brand-400' : 'text-slate-400'}`} />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-slate-200">
                  {isReading 
                    ? `Reading files... ${readProgress.current} / ${readProgress.total}`
                    : isDragActive ? "Drop files here" : "Drag & drop source files or folder"
                  }
                </p>
                {!isReading && <p className="text-sm text-slate-400 mt-1">or click to browse directory</p>}
              </div>
              
              {isReading && (
                <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mt-4">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-200" 
                    style={{ width: `${(readProgress.current / Math.max(1, readProgress.total)) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Display uploaded files */}
            {!isReading && files.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-slate-300">{files.length} file{files.length > 1 ? 's' : ''} ready</span>
                  <button type="button" onClick={clearAllFiles} className="text-xs text-slate-400 hover:text-white transition-colors">
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {displayFiles.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group/file hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileCode className="w-4 h-4 text-brand-400 shrink-0" />
                        <span className="text-xs text-slate-300 truncate" title={f.name}>
                          {f.name.split('/').pop()}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={(e) => removeFile(f.id, e)}
                        className="p-1 rounded-md text-slate-500 opacity-0 group-hover/file:opacity-100 hover:bg-white/10 hover:text-red-400 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {remainingFiles > 0 && (
                    <div className="flex items-center justify-center p-3 rounded-lg bg-white/5 border border-white/5 text-sm font-medium text-slate-400">
                      + {remainingFiles} more file{remainingFiles > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Feature Request Input */}
          <div className="space-y-3">
            <label htmlFor="request" className="block text-sm font-medium text-slate-300">
              Feature Request
            </label>
            <div className="relative">
              <div className="absolute top-3 left-4 text-slate-500">
                <Code2 className="w-5 h-5" />
              </div>
              <textarea
                id="request"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="e.g. Implement Google OAuth login on the authentication page..."
                className="w-full h-32 pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={files.length === 0 || !request.trim() || isReading}
            className="w-full relative group overflow-hidden rounded-xl bg-brand-600 px-6 py-4 font-semibold text-white transition-all hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Analyze Code Impact
            </div>
          </button>
        </form>

      </div>
    </div>
  );
};

export default LandingView;
