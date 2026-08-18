import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants/taskStatus.js';

export function TaskStatusChart({ tasks = [] }) {
  const todoCount = tasks.filter((t) => t.status === TASK_STATUS.TODO).length;
  const inProgressCount = tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length;
  const doneCount = tasks.filter((t) => t.status === TASK_STATUS.DONE).length;

  const data = [
    { name: TASK_STATUS_LABELS[TASK_STATUS.TODO], value: todoCount, color: '#64748b' },
    { name: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS], value: inProgressCount, color: '#f59e0b' },
    { name: TASK_STATUS_LABELS[TASK_STATUS.DONE], value: doneCount, color: '#10b981' },
  ];

  const totalTasks = tasks.length;

  if (totalTasks === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs border border-dashed rounded-xl p-4">
        No task data available for status distribution chart.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '0.75rem',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-foreground font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
