import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AssetStatus } from '@/types/asset';
import { STATUS_COLORS } from '@/lib/constants';

interface StatusBadgeProps {
  status: AssetStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium border',
        STATUS_COLORS[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}
