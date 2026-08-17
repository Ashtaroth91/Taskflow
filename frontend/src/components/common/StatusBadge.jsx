import { ROLE_LABELS, ROLES } from '../../constants/roles.js';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants/taskStatus.js';
import { Badge } from '../ui/Badge.jsx';

export function TaskStatusBadge({ status }) {
  const config = {
    [TASK_STATUS.TODO]: { variant: 'outline', label: TASK_STATUS_LABELS[TASK_STATUS.TODO] },
    [TASK_STATUS.IN_PROGRESS]: { variant: 'warning', label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS] },
    [TASK_STATUS.DONE]: { variant: 'success', label: TASK_STATUS_LABELS[TASK_STATUS.DONE] },
  };

  const badgeProps = config[status] || { variant: 'secondary', label: status || 'Unknown' };

  return <Badge variant={badgeProps.variant}>{badgeProps.label}</Badge>;
}

export function RoleBadge({ role }) {
  const config = {
    [ROLES.ADMIN]: { variant: 'destructive', label: ROLE_LABELS[ROLES.ADMIN] },
    [ROLES.PROJECT_ADMIN]: { variant: 'info', label: ROLE_LABELS[ROLES.PROJECT_ADMIN] },
    [ROLES.MEMBER]: { variant: 'secondary', label: ROLE_LABELS[ROLES.MEMBER] },
  };

  const badgeProps = config[role] || { variant: 'outline', label: role || 'Member' };

  return <Badge variant={badgeProps.variant}>{badgeProps.label}</Badge>;
}
