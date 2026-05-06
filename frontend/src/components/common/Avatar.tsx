import { getInitials, getAvatarColor } from "@/utils/user";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

export default function Avatar({ name, size = "md" }: AvatarProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${getAvatarColor(
        name
      )} flex items-center justify-center text-white font-semibold`}
    >
      {getInitials(name)}
    </div>
  );
}
