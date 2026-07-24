import React from 'react';

interface ToolbarProps {
  children: React.ReactNode;
}

export default function Toolbar({ children }: ToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl mb-6">
      {children}
    </div>
  );
}

export function ToolbarGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      {children}
    </div>
  );
}
