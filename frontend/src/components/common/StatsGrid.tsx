import { type ReactNode } from "react";

export interface StatItem {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconColorClass?: string; // e.g. "text-primary"
  iconBgClass?: string;    // e.g. "bg-primary/10"
}

interface StatsGridProps {
  items: StatItem[];
  columns?: 2 | 3 | 4;
}

const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export default function StatsGrid({ items, columns = 4 }: StatsGridProps) {
  return (
    <div className={`grid gap-4 ${columnClasses[columns]}`}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-card border border-border rounded-sm p-4 shadow-sm flex items-center gap-3 select-none text-foreground"
        >
          {/* Icon Wrap */}
          <div
            className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${item.iconBgClass || "bg-primary/10"
              } ${item.iconColorClass || "text-primary"}`}
          >
            {item.icon}
          </div>

          {/* Metric Labels */}
          <div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
              {item.label}
            </p>
            <h4 className="text-base font-black text-foreground mt-0.5">
              {item.value}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}
