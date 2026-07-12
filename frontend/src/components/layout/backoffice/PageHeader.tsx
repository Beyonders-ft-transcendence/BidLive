import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, backUrl, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-zinc-800 mb-8">
      <div className="flex items-start gap-4">
        {backUrl && (
          <Link 
            to={backUrl}
            className="p-2 mt-1 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        <div className="flex gap-3">
          {icon && (
            <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-300 mt-1">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-zinc-400 mt-1 max-w-2xl">{description}</p>
            )}
          </div>
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
