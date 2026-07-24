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
        className={`w-full bg-background border border-border rounded-sm shadow-2xl flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150 ${sizeClasses[size]}`}
      >
        {/* Header (Optional) */}
        {title && (
          <div className="p-4 border-b border-border flex items-center justify-between bg-card text-foreground">
            <h3 className="font-black text-sm flex items-center gap-2">
              {title}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center border border-border bg-background cursor-pointer transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto bg-background text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
