interface StatItemProps {
  label: string;
  value: string | number;
}

export default function StatItem({ label, value }: StatItemProps) {
  return (
    <div>
      <h4 className="text-sm text-gray-500">{label}</h4>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
