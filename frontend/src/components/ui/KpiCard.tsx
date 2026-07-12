import { cn } from '../../utils/cn';

interface KpiCardProps {
  label: string;
  value: string | number;
  accent?: 'blue' | 'green' | 'orange' | 'red' | 'default';
  icon?: React.ReactNode;
}

const accentMap = {
  blue: 'border-t-primary',
  green: 'border-t-success',
  orange: 'border-t-warning',
  red: 'border-t-danger',
  default: 'border-t-border',
};

export function KpiCard({ label, value, accent = 'default', icon }: KpiCardProps) {
  return (
    <div className={cn('card border-t-2 flex flex-col gap-2', accentMap[accent])}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <span className="text-3xl font-bold text-white">{value}</span>
    </div>
  );
}
