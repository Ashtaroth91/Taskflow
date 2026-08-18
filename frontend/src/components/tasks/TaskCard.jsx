import { CheckSquare, Paperclip, User, MoveRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card.jsx';
import { TaskStatusBadge } from '../common/StatusBadge.jsx';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants/taskStatus.js';
import { getInitials, truncateText } from '../../utils/formatters.js';

export function TaskCard({ task, onSelect, onStatusChange, canEditStatus }) {
  if (!task) return null;

  const assignedUser = task.assignedTo;
  const avatar = typeof assignedUser?.avatar === 'string' ? assignedUser.avatar : assignedUser?.avatar?.url;
  const hasAttachments = task.attachments && task.attachments.length > 0;

  return (
    <Card className="border-border/60 hover:border-primary/50 shadow-sm hover:shadow transition-all bg-card/90 cursor-pointer group">
      <CardContent className="p-4 space-y-3" onClick={() => onSelect(task)}>
        {/* Header: Title & Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
            {task.title}
          </h4>
          <TaskStatusBadge status={task.status} />
        </div>

        {/* Description snippet */}
        {task.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {truncateText(task.description, 90)}
          </p>
        )}

        {/* Footer: Assignee & Attachments / Status Dropdown */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-[11px]">
          {/* Assignee Avatar */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] shrink-0 border border-primary/20">
              {avatar ? (
                <img src={avatar} alt={assignedUser?.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(assignedUser?.username || 'U')
              )}
            </div>
            <span className="text-muted-foreground truncate text-[10px]">
              {assignedUser?.username || 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Attachment indicator */}
            {hasAttachments && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium" title={`${task.attachments.length} attachment(s)`}>
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}

            {/* Quick Status Change Selector */}
            {canEditStatus && onStatusChange && (
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task._id, e.target.value)}
                className="h-7 text-[10px] font-semibold bg-background border border-input rounded-md px-1.5 focus:outline-none focus:ring-1 focus:ring-ring border-border"
              >
                <option value={TASK_STATUS.TODO}>{TASK_STATUS_LABELS[TASK_STATUS.TODO]}</option>
                <option value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}</option>
                <option value={TASK_STATUS.DONE}>{TASK_STATUS_LABELS[TASK_STATUS.DONE]}</option>
              </select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
