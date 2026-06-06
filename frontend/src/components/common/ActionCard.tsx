import { type ReactNode } from "react";
import Button from "./Button";

interface ActionCardProps {
    title: string;
    subtitle?: string;
    buttonLabel?: string;
    buttonVariant?: "primary" | "secondary" | "danger" | "success" | "outline";
    onButtonClick?: () => void;
    children?: ReactNode;
}

export default function ActionCard({
    title,
    subtitle,
    buttonLabel,
    buttonVariant = "primary",
    onButtonClick,
    children,
}: ActionCardProps) {
    return (
        <div className="w-full bg-white rounded-sm shadow-sm flex items-center justify-between px-8 py-4 border border-gray-100">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                {children}
            </div>
            {buttonLabel && (
                <Button 
                    variant={buttonVariant} 
                    className="rounded-sm" 
                    size="sm"
                    onClick={onButtonClick}
                >
                    {buttonLabel}
                </Button>
            )}
        </div>
    );
}
