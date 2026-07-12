import { cn } from '../../utils/cn';

type Variant = 'available' | 'ontrip' | 'inshop' | 'retired' | 'dispatched' | 'completed' | 'draft' | 'cancelled' | 'suspended' | 'offduty';

const map: Record<Variant, string> = {
  available: 'bg-success/20 text-success',
  ontrip: 'bg-primary/20 text-blue-400',
  inshop: 'bg-warning/20 text-warning',
  retired: 'bg-danger/20 text-danger',
  dispatched: 'bg-primary/20 text-blue-400',
  completed: 'bg-success/20 text-success',
  draft: 'bg-gray-700 text-gray-400',
  cancelled: 'bg-danger/20 text-danger',
  suspended: 'bg-warning/20 text-warning',
  offduty: 'bg-gray-700 text-gray-400',
};

export function Badge({ label }: { label: string }) {
  const key = label.toLowerCase().replace(' ', '') as Variant;
  return (
    <span className={cn('text-xs px-2.5 py-0.5 rounded-full font-medium', map[key] ?? 'bg-gray-700 text-gray-400')}>
      {label}
    </span>
  );
}
