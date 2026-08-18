import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects.api.js';
import { tasksApi } from '../../api/tasks.api.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { TASK_STATUS } from '../../constants/taskStatus.js';
import { useAuth } from '../../hooks/useAuth.js';
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { TaskStatusChart } from '../../components/analytics/TaskStatusChart.jsx';
import { ProjectProgressChart } from '../../components/analytics/ProjectProgressChart.jsx';
import { RecentActivityTimeline } from '../../components/analytics/RecentActivityTimeline.jsx';
import { FullPageSpinner } from '../../components/feedback/FullPageSpinner.jsx';

export default function DashboardPage() {
  const { user } = useAuth();

  // 1. Fetch User's Accessible Projects
  const {
    data: projectsData = [],
    isLoading: isProjectsLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: projectsApi.getProjects,
  });

  // Extract project IDs
  const projectIds = projectsData.map((item) => item.project?._id).filter(Boolean);

  // 2. Fetch Tasks for all projects
  const tasksQueries = useQuery({
    queryKey: ['analytics', 'all-tasks', projectIds],
    queryFn: async () => {
      const taskResults = await Promise.all(
        projectIds.map(async (pId) => {
          try {
            const list = await tasksApi.getTasks(pId);
            return { projectId: pId, tasks: list };
          } catch (e) {
            return { projectId: pId, tasks: [] };
          }
        })
      );
      return taskResults;
    },
    enabled: projectIds.length > 0,
  });

  if (isProjectsLoading || (projectIds.length > 0 && tasksQueries.isLoading)) {
    return <FullPageSpinner message="Loading dashboard..." />;
  }

  // Derive Analytics Data
  const tasksByProjectMap = {};
  let allTasks = [];

  if (tasksQueries.data) {
    tasksQueries.data.forEach((item) => {
      tasksByProjectMap[item.projectId] = item.tasks;
      allTasks = [...allTasks, ...item.tasks];
    });
  }

  const totalProjects = projectsData.length;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === TASK_STATUS.DONE).length;
  const pendingTasks = allTasks.filter(
    (t) => t.status === TASK_STATUS.TODO || t.status === TASK_STATUS.IN_PROGRESS
  ).length;
  const overallProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Sum total team members across projects
  const totalMembers = projectsData.reduce(
    (acc, curr) => acc + (curr.project?.members || 1),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Analytics Dashboard
            </h1>
            <Badge variant="success" className="text-[10px]">
              Live Data
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Overview of project progress and team metrics for {user?.username || 'user'}.
          </p>
        </div>

        <Link to={ROUTES.PROJECTS}>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Manage Workspaces
          </Button>
        </Link>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Projects */}
        <Card className="border-border/60 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{totalProjects}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Tasks */}
        <Card className="border-border/60 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{totalTasks}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="border-border/60 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Completed</p>
              <p className="text-2xl font-extrabold text-emerald-500 mt-1">{completedTasks}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="border-border/60 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Pending Tasks</p>
              <p className="text-2xl font-extrabold text-amber-500 mt-1">{pendingTasks}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Progress Percentage */}
        <Card className="border-border/60 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{overallProgressPercent}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Member Count */}
        <Card className="border-border/60 shadow-sm hover:shadow transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Total Members</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{totalMembers}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution (Pie / Donut Chart) */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Task Status Breakdown</CardTitle>
            </div>
            <CardDescription className="text-xs">Distribution of tasks across To Do, In Progress, and Done</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskStatusChart tasks={allTasks} />
          </CardContent>
        </Card>

        {/* Project Task Completion (Bar Chart) */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Project Task Comparison</CardTitle>
            </div>
            <CardDescription className="text-xs">Total vs Completed Tasks by project workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectProgressChart
              projectsData={projectsData}
              tasksByProject={tasksByProjectMap}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription className="text-xs">Latest workspace updates and task events</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivityTimeline
            projectsData={projectsData}
            allTasks={allTasks}
          />
        </CardContent>
      </Card>
    </div>
  );
}
