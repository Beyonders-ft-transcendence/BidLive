import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            icon,
            iconPosition = "left",
            fullWidth = false,
            className = "",
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        const baseInputStyles = "w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed";

        const errorStyles = error
            ? "border-red-500 focus:border-red-500 focus:ring-gray-300"
            : "border-gray-300 border focus:border-gray-300 focus:ring-gray-300";

        const iconPaddingStyles = icon
            ? iconPosition === "left"
                ? "pl-11"
                : "pr-11"
            : "";

        return (
            <div className={`${fullWidth ? "w-full" : ""}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {icon && iconPosition === "left" && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2563eb]">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={`${baseInputStyles} ${errorStyles} ${iconPaddingStyles} ${className}`}
                        {...props}
                    />

                    {icon && iconPosition === "right" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2563eb]">
                            {icon}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;