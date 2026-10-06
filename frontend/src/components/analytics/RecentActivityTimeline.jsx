import { Clock, FolderKanban, CheckSquare } from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export function RecentActivityTimeline({ projectsData = [], allTasks = [] }) {
  // Aggregate activities derived from timestamps
  const activities = [];

  projectsData.forEach((item) => {
    const p = item.project || {};
    if (p.createdAt) {
      activities.push({
        id: `p-create-${p._id}`,
        title: `Workspace "${p.name}" created`,
        type: 'project',
        date: new Date(p.createdAt),
      });
    }
  });

  allTasks.forEach((task) => {
    if (task.createdAt) {
      activities.push({
        id: `t-create-${task._id}`,
        title: `Task "${task.title}" created`,
        type: 'task',
        date: new Date(task.createdAt),
      });
    }
    if (task.updatedAt && task.updatedAt !== task.createdAt) {
      activities.push({
        id: `t-update-${task._id}`,
        title: `Task "${task.title}" updated (${task.status.replace('_', ' ')})`,
        type: 'task',
        date: new Date(task.updatedAt),
      });
    }
  });

  // Sort descending by date
  activities.sort((a, b) => b.date - a.date);
  const recentActivities = activities.slice(0, 5);

  if (recentActivities.length === 0) {
    return <p className="text-xs text-muted-foreground py-4 text-center">No recent activity recorded.</p>;
  }

  return (
    <div className="space-y-3">
      {recentActivities.map((act) => (
        <div
          key={act.id}
          className="flex items-start gap-3 p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs"
        >
          <div className="w-6 h-6 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
            {act.type === 'project' ? (
              <FolderKanban className="w-3.5 h-3.5 text-primary" />
            ) : (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="font-medium text-foreground truncate">{act.title}</p>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span>{formatDate(act.date, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
