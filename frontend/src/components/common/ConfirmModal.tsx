import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import Modal from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
}

const variantStyles = {
  danger: {
    icon: <AlertTriangle size={22} className="text-destructive" />,
    confirmButton: "bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive/20",
  },
  warning: {
    icon: <AlertCircle size={22} className="text-warning" />,
    confirmButton: "bg-warning hover:bg-warning/90 text-warning-foreground focus:ring-warning/20",
  },
  primary: {
    icon: <Info size={22} className="text-primary" />,
    confirmButton: "bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary/20",
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
}: ConfirmModalProps) {
  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 flex flex-col gap-4 select-none text-foreground bg-background">
        {/* Warning Icon and Message */}
        <div className="flex gap-3">
          <div className="shrink-0">{styles.icon}</div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 mt-3">
          <button
            onClick={onClose}
            className="bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-semibold text-xs py-2 px-4 rounded-sm transition-colors cursor-pointer focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`font-semibold text-xs py-2 px-5 rounded-sm transition-colors cursor-pointer focus:outline-none shadow-sm ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
