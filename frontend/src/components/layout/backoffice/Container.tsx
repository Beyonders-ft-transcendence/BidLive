import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface ContainerProps {
    children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-50 flex relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-30 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Fixed Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content Area - margin-left offsets the 64 (16rem) width of sidebar on desktop */}
        <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
            <Header onOpenSidebar={() => setSidebarOpen(true)} />
            
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
            </main>
        </div>
    </div>
  );
}
