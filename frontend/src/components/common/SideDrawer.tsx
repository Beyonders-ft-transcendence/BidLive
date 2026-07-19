import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export default function SideDrawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
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
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end select-none backdrop-blur-xs animate-in fade-in duration-150">
      {/* Sliding Drawer Body */}
      <div className={`w-full ${sizeClasses[size]} bg-background h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 border-l border-border rounded-l-sm`}>

        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-3">
            {title}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center border border-border bg-background cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-border flex gap-2 bg-card shrink-0">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}
