import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'active' | 'pending' | 'inactive' | 'error' | 'loading';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<StatusType, {
  bg: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultLabel: string;
}> = {
  active: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    icon: CheckCircle2,
    defaultLabel: 'Active',
  },
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-200',
    icon: Clock,
    defaultLabel: 'Pending',
  },
  inactive: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-200',
    icon: XCircle,
    defaultLabel: 'Inactive',
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    icon: AlertCircle,
    defaultLabel: 'Error',
  },
  loading: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-200',
    icon: Loader2,
    defaultLabel: 'Loading',
  },
};

export function StatusBadge({
  status,
  label,
  className,
  showIcon = true
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        config.bg,
        config.text,
        'font-medium border-0',
        showIcon && 'gap-1',
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            'h-3 w-3',
            status === 'loading' && 'animate-spin'
          )}
        />
      )}
      {label || config.defaultLabel}
    </Badge>
  );
}
