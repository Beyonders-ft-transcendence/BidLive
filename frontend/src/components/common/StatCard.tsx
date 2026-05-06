import { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  chart: ReactNode;
}

export default function StatCard({
  label,
  value,
  trend,
  trendValue,
  chart,
}: StatCardProps) {
  const trendColor = trend === "up" ? "text-green-400" : "text-red-400";
  const TrendIcon = trend === "up" ? ArrowUp : ArrowDown;

  return (
    <div className="bg-white rounded-sm shadow-sm overflow-hidden">
      <div className="p-4">
        <p className="text-gray-600 font-medium">{label}</p>
        <div className="flex items-center space-x-4 mt-2">
          <h4 className="text-3xl font-semibold">{value}</h4>
          {trend && trendValue && (
            <span className={`${trendColor} flex items-center text-sm font-medium`}>
              <TrendIcon className="w-4 h-4" />
              {trendValue}
            </span>
          )}
        </div>
      </div>

      <div className="h-24">
        {chart}
      </div>
    </div>
  );
}
