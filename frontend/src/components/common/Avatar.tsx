import { getInitials, getAvatarColor } from "@/utils/user";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

export default function Avatar({ name, src, size = "md" }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${getAvatarColor(
        name
      )} flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}
