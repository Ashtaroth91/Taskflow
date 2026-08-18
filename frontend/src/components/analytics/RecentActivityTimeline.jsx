import { Clock } from 'lucide-react';
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
        title: `Task "${task.title}" updated (Status: ${task.status})`,
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
    <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
      {recentActivities.map((act) => (
        <div key={act.id} className="relative flex items-start gap-3 text-xs">
          <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground">{act.title}</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatDate(act.date, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
