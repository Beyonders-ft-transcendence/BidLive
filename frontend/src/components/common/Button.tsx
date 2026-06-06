import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "social";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
	loading?: boolean;
	icon?: ReactNode;
	iconPosition?: "left" | "right";
	children: ReactNode;
}

export default function Button({
	variant = "primary",
	size = "md",
	fullWidth = false,
	loading = false,
	icon,
	iconPosition = "left",
	children,
	className = "",
	disabled,
	style,
	...props
}: ButtonProps) {
	const baseStyles =
		"inline-flex cursor-pointer items-center justify-center rounded-sm px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed";

	const variants = {
		primary: "bg-primary text-white hover:bg-primary-light focus:ring-primary/20",
		secondary: "bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-100",
		danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-100",
		success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-100",
		outline: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-primary/20",
		social: "w-full overflow-hidden rounded-sm text-white hover:opacity-90",
	};

	const sizes = {
		sm: "px-3 py-2 text-xs gap-1.5",
		md: "px-4 py-3 text-sm gap-2",
		lg: "px-6 py-3.5 text-base gap-2.5",
	};

	const widthClass = fullWidth ? "w-full" : "";
	const isSocial = variant === "social";

	if (isSocial) {
		return (
			<button
				className={`w-full flex items-center overflow-hidden rounded-sm text-white mb-4 hover:opacity-90 transition ${widthClass} ${className}`}
				style={style}
				disabled={disabled || loading}
				{...props}
			>
				{loading ? (
					<>
						<span className="w-14 h-12 flex items-center justify-center border-r border-white/20 shrink-0">
							<svg
								className="animate-spin h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						</span>
						<span className="flex-1 pl-6 pr-4 text-sm font-medium leading-none flex items-center">Carregando...</span>
					</>
				) : (
					<>
						{icon && iconPosition === "left" && (
							<span className="w-14 h-12 flex items-center justify-center border-r border-white/20 shrink-0">
								{icon}
							</span>
						)}
						<span className="flex-1 pl-6 pr-4 py-3 text-sm font-medium leading-none flex items-center">{children}</span>
						{icon && iconPosition === "right" && (
							<span className="w-14 h-12 flex items-center justify-center border-l border-white/20 shrink-0">
								{icon}
							</span>
						)}
					</>
				)}
			</button>
		);
	}

	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
			style={style}
			disabled={disabled || loading}
			{...props}
		>
			{loading ? (
				<>
					<svg
						className="animate-spin h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					<span>Carregando...</span>
				</>
			) : (
				<>
					{icon && iconPosition === "left" && <span>{icon}</span>}
					<span>{children}</span>
					{icon && iconPosition === "right" && <span>{icon}</span>}
				</>
			)}
		</button>
	);
}