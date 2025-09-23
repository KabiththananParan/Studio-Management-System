import { Badge } from './ui/badge';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Closed' | 'Escalated';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const statusConfig = {
  'Pending': { color: 'bg-yellow-100 text-yellow-800', variant: 'secondary' as const },
  'In Progress': { color: 'bg-blue-100 text-blue-800', variant: 'secondary' as const },
  'Resolved': { color: 'bg-green-100 text-green-800', variant: 'secondary' as const },
  'Closed': { color: 'bg-gray-100 text-gray-800', variant: 'secondary' as const },
  'Escalated': { color: 'bg-red-100 text-red-800', variant: 'destructive' as const },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={config.color}>
      {status}
    </Badge>
  );
}