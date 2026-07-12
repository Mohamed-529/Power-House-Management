import { PackageOpen } from 'lucide-react';

export function EmptyState({ message = 'No records found' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
      <PackageOpen size={40} strokeWidth={1} />
      <p className="text-sm">{message}</p>
    </div>
  );
}
