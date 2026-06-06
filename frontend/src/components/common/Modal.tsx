"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string | ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-full h-full rounded-none",
};

export default function Modal({
  isOpen = true,
  onClose,
  title,
  size = "md",
  children,
}: ModalProps) {
  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      {/* Modal Dialog Card */}
      <div
        className={`w-full bg-white rounded-sm shadow-2xl flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150 ${sizeClasses[size]}`}
      >
        {/* Header (Optional) */}
        {title && (
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-sm text-gray-950 flex items-center gap-2">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-sm hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center border border-gray-100 bg-white cursor-pointer transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}