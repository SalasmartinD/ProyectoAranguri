import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content text-inherit break-words ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => <h1 className="text-base font-black text-slate-900 mt-4 mb-2 first:mt-0" {...props} />,
          h2: ({ ...props }) => <h2 className="text-sm font-extrabold text-slate-900 mt-3.5 mb-1.5 first:mt-0" {...props} />,
          h3: ({ ...props }) => <h3 className="text-xs font-bold text-slate-900 mt-3 mb-1 first:mt-0" {...props} />,
          p: ({ ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
          li: ({ ...props }) => <li className="pl-0.5 leading-relaxed" {...props} />,
          strong: ({ ...props }) => <strong className="font-extrabold text-slate-950" {...props} />,
          em: ({ ...props }) => <em className="italic" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
