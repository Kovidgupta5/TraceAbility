import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { UploadedFile, ImpactLine } from '../types';

interface CodeViewerProps {
  file: UploadedFile;
  impacts: ImpactLine[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file, impacts }) => {
  // Determine language from extension
  const extension = file.name.split('.').pop() || '';
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'md': 'markdown'
  };
  const language = langMap[extension] || 'typescript';

  const impactLineNumbers = new Set(impacts.map(i => i.lineNumber));

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="bg-[#0d1117] border-b border-white/5 p-3 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <span className="text-sm font-mono text-slate-300">{file.name}</span>
        {impacts.length > 0 && (
          <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20 font-medium">
            {impacts.length} Modification{impacts.length > 1 ? 's' : ''} Required
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-auto bg-[#0d1117]">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem 0',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const isImpacted = impactLineNumbers.has(lineNumber);
            return {
              style: {
                display: 'block',
                backgroundColor: isImpacted ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                borderLeft: isImpacted ? '4px solid rgba(245, 158, 11, 0.8)' : '4px solid transparent',
                paddingRight: '1rem'
              },
              className: isImpacted ? 'impacted-line group' : ''
            };
          }}
        >
          {file.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeViewer;
