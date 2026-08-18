import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function ProjectProgressChart({ projectsData = [], tasksByProject = {} }) {
  const data = projectsData.map((item) => {
    const p = item.project || {};
    const projectTasks = tasksByProject[p._id] || [];
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'done').length;

    return {
      name: p.name ? (p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name) : 'Project',
      'Total Tasks': total,
      'Completed Tasks': completed,
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs border border-dashed rounded-xl p-4">
        No project task comparison data available.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
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
          <Bar dataKey="Total Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
