"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function SideDrawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: SideDrawerProps) {
  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end select-none backdrop-blur-sm animate-in fade-in duration-150">
      {/* Sliding Drawer Body */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            {title}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center border border-gray-100 bg-white cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50/50 shrink-0">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}
