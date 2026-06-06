"use client";

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
    icon: <AlertTriangle size={20} className="text-red-500" />,
    confirmButton: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/20",
  },
  warning: {
    icon: <AlertCircle size={20} className="text-amber-500" />,
    confirmButton: "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500/20",
  },
  primary: {
    icon: <Info size={20} className="text-primary" />,
    confirmButton: "bg-primary hover:bg-primary/95 text-white focus:ring-primary/20",
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
      <div className="p-5 flex flex-col gap-4">
        {/* Warning Icon and Message */}
        <div className="flex gap-3">
          <div className="shrink-0">{styles.icon}</div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-950">
              {title}
            </h4>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-[10px] py-1.5 px-3 rounded-sm transition-colors cursor-pointer focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`font-bold text-[10px] py-1.5 px-4 rounded-sm transition-colors cursor-pointer focus:outline-none ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
