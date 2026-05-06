import { ReactNode } from "react";

interface PieStatCardProps {
  label: string;
  value: string | number;
  chart: ReactNode;
}

export default function PieStatCard({
  label,
  value,
  chart,
}: PieStatCardProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-32 h-32">
        {chart}
      </div>
      <div>
        <h4 className="font-medium">{label}</h4>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
