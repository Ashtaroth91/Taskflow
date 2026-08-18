import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants/taskStatus.js';
import { TaskCard } from './TaskCard.jsx';

export function KanbanBoard({ tasks = [], onSelectTask, onStatusChange, canEditStatus }) {
  const columns = [
    {
      id: TASK_STATUS.TODO,
      title: TASK_STATUS_LABELS[TASK_STATUS.TODO],
      accentColor: 'border-t-slate-400 dark:border-t-slate-600',
    },
    {
      id: TASK_STATUS.IN_PROGRESS,
      title: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS],
      accentColor: 'border-t-amber-500',
    },
    {
      id: TASK_STATUS.DONE,
      title: TASK_STATUS_LABELS[TASK_STATUS.DONE],
      accentColor: 'border-t-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <div
            key={column.id}
            className={`rounded-2xl border border-border/70 bg-card/40 p-4 space-y-4 border-t-4 ${column.accentColor} shadow-sm`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-2">
                {column.title}
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards Container */}
            <div className="space-y-3 min-h-[160px]">
              {columnTasks.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-border/60 text-muted-foreground text-xs">
                  No tasks in {column.title.toLowerCase()}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onSelect={onSelectTask}
                    onStatusChange={onStatusChange}
                    canEditStatus={canEditStatus}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
