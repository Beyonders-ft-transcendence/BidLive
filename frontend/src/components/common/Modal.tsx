
import { X } from "lucide-react";

export default function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            {/* Close button */}
           <button 
                onClick={onClose}
                className="bg-white rounded-full absolute top-8 right-8 cursor-pointer hover:bg-gray-100 transition-colors" 
            >
                <X size={28} className="text-gray-800" />
           </button>
           {/* Modal content */}
           {children}
        </div>
    );
}