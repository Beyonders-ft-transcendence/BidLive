"use client";

import React from "react";

interface ActionCardProps {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary" | "danger";
  onButtonClick?: () => void;
}

export default function ActionCard({
  title,
  subtitle,
  buttonLabel,
  buttonVariant = "primary",
  onButtonClick,
}: ActionCardProps) {
  const getButtonClass = () => {
    switch (buttonVariant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "secondary":
        return "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200";
      case "primary":
      default:
        return "bg-primary hover:bg-primary-light text-white";
    }
  };

  return (
    <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-1 flex-1">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">{subtitle}</p>
      </div>
      {buttonLabel && onButtonClick && (
        <button
          onClick={onButtonClick}
          className={`px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider transition-all shadow-xs shrink-0 ${getButtonClass()}`}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
