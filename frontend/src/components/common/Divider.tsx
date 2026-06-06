import React from "react";

interface DividerProps {
    children?: React.ReactNode;
    className?: string;
}

export default function Divider({ children, className = "" }: DividerProps) {
    return (
        <div className={`relative flex py-5 items-center select-none pointer-events-none ${className}`}>
            <div className="flex-grow border-t border-gray-100"></div>
            {children && (
                <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-normal">
                    {children}
                </span>
            )}
            <div className="flex-grow border-t border-gray-100"></div>
        </div>
    );
}
