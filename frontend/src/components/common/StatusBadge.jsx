import { ROLE_LABELS, ROLES } from '../../constants/roles.js';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants/taskStatus.js';
import { Badge } from '../ui/Badge.jsx';

export function TaskStatusBadge({ status, className }) {
  const config = {
    [TASK_STATUS.TODO]: {
      variant: 'muted',
      dotColor: 'bg-slate-400 dark:bg-slate-500',
      label: TASK_STATUS_LABELS[TASK_STATUS.TODO],
    },
    [TASK_STATUS.IN_PROGRESS]: {
      variant: 'warning',
      dotColor: 'bg-amber-500',
      label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS],
    },
    [TASK_STATUS.DONE]: {
      variant: 'success',
      dotColor: 'bg-emerald-500',
      label: TASK_STATUS_LABELS[TASK_STATUS.DONE],
    },
  };

  const badgeProps = config[status] || {
    variant: 'secondary',
    dotColor: 'bg-muted-foreground',
    label: status || 'Unknown',
  };

  return (
    <Badge variant={badgeProps.variant} className={className}>
      <span className={`w-1.5 h-1.5 rounded-full ${badgeProps.dotColor} shrink-0`} />
      {badgeProps.label}
    </Badge>
  );
}

export function RoleBadge({ role, className }) {
  const config = {
    [ROLES.ADMIN]: { variant: 'destructive', label: ROLE_LABELS[ROLES.ADMIN] },
    [ROLES.PROJECT_ADMIN]: { variant: 'info', label: ROLE_LABELS[ROLES.PROJECT_ADMIN] },
    [ROLES.MEMBER]: { variant: 'secondary', label: ROLE_LABELS[ROLES.MEMBER] },
  };

  const badgeProps = config[role] || { variant: 'outline', label: role || 'Member' };

  return <Badge variant={badgeProps.variant} className={className}>{badgeProps.label}</Badge>;
}
