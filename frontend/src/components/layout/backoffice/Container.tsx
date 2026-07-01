import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface ContainerProps {
    children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-foreground flex">
        {/* Fixed Sidebar */}
        <Sidebar />
        
        {/* Main Content Area - margin-left offsets the 64 (16rem) width of sidebar */}
        <div className="flex-1 flex flex-col ml-64 min-w-0">
            <Header />
            
            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
            </main>
        </div>
    </div>
  );
}
