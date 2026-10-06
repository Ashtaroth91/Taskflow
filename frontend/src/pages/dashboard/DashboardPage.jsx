import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Users,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  CircleDot,
  Layers,
} from 'lucide-react';
import { projectsApi } from '../../api/projects.api.js';
import { tasksApi } from '../../api/tasks.api.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants/taskStatus.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { TaskStatusBadge, RoleBadge } from '../../components/common/StatusBadge.jsx';
import { ProjectFormModal } from '../../components/projects/ProjectFormModal.jsx';
import { RecentActivityTimeline } from '../../components/analytics/RecentActivityTimeline.jsx';
import { FullPageSpinner } from '../../components/feedback/FullPageSpinner.jsx';
import { ROUTES } from '../../constants/routes.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // Task Status Update Mutation from Dashboard
  const updateStatusMutation = useMutation({
    mutationFn: async ({ projectId, taskId, newStatus }) => {
      return await tasksApi.updateTask(projectId, taskId, { status: newStatus });
    },
    onSuccess: () => {
      showToast.success('Task status updated');
      queryClient.invalidateQueries({ queryKey: ['analytics', 'all-tasks', projectIds] });
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      showToast.error(parsed.message);
    },
  });

  if (isProjectsLoading || (projectIds.length > 0 && tasksQueries.isLoading)) {
    return <FullPageSpinner message="Loading your workspace..." />;
  }

  // Derive Data
  const tasksByProjectMap = {};
  let allTasks = [];

  if (tasksQueries.data) {
    tasksQueries.data.forEach((item) => {
      tasksByProjectMap[item.projectId] = item.tasks;
      // Tag each task with its project name for quick display
      const projectMatch = projectsData.find((p) => p.project?._id === item.projectId);
      const taggedTasks = item.tasks.map((t) => ({
        ...t,
        projectName: projectMatch?.project?.name || 'Project',
      }));
      allTasks = [...allTasks, ...taggedTasks];
    });
  }

  const totalProjects = projectsData.length;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === TASK_STATUS.DONE).length;
  const inProgressTasks = allTasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length;
  const todoTasks = allTasks.filter((t) => t.status === TASK_STATUS.TODO).length;
  const overallProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks assigned to current user
  const myAssignedTasks = allTasks.filter(
    (t) => t.assignedTo?._id === user?._id || t.assignedTo?.username === user?.username
  );

  return (
    <div className="space-y-6">
      {/* Workspace Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.username || 'Student'}
          </h1>
          <p className="text-xs text-muted-foreground">
            You have access to <span className="font-semibold text-foreground">{totalProjects}</span> project{totalProjects === 1 ? '' : 's'} with <span className="font-semibold text-foreground">{myAssignedTasks.length}</span> task{myAssignedTasks.length === 1 ? '' : 's'} assigned to you.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={ROUTES.PROJECTS}>
            <Button variant="outline" size="sm">
              <FolderKanban className="w-4 h-4 mr-1.5 text-muted-foreground" />
              All Projects
            </Button>
          </Link>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Projects Card */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Active Workspaces</p>
              <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
              <p className="text-[11px] text-muted-foreground">Enrolled projects</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FolderKanban className="w-4.5 h-4.5" />
            </div>
          </CardContent>
        </Card>

        {/* My Assigned Tasks Card */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">My Assigned Tasks</p>
              <p className="text-2xl font-bold text-foreground">{myAssignedTasks.length}</p>
              <p className="text-[11px] text-muted-foreground">
                {myAssignedTasks.filter((t) => t.status === TASK_STATUS.DONE).length} completed
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </CardContent>
        </Card>

        {/* Team Task Completion Card */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Team Task Progress</p>
                <p className="text-2xl font-bold text-foreground">{overallProgressPercent}%</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {completedTasks} of {totalTasks} tasks done across all workspaces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: My Tasks & Active Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Assigned Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">My Assigned Tasks</CardTitle>
                <CardDescription className="text-xs">
                  Tasks assigned directly to your account
                </CardDescription>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {myAssignedTasks.length} task{myAssignedTasks.length === 1 ? '' : 's'}
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {myAssignedTasks.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-foreground">You have no assigned tasks right now.</p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Check your project boards to find tasks or create new ones for your team.
                  </p>
                </div>
              ) : (
                myAssignedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/app/projects/${task.project}/tasks`}
                          className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                        >
                          {task.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                          <FolderKanban className="w-3 h-3 text-muted-foreground" />
                          {task.projectName}
                        </span>
                        {task.description && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[240px]">{task.description}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Quick Status Selector */}
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            projectId: task.project,
                            taskId: task._id,
                            newStatus: e.target.value,
                          })
                        }
                        className="h-7 text-[11px] font-medium bg-background border border-border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value={TASK_STATUS.TODO}>{TASK_STATUS_LABELS[TASK_STATUS.TODO]}</option>
                        <option value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}</option>
                        <option value={TASK_STATUS.DONE}>{TASK_STATUS_LABELS[TASK_STATUS.DONE]}</option>
                      </select>

                      <Link to={`/app/projects/${task.project}/tasks`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          Open <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Workspaces List */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Project Workspaces</CardTitle>
                <CardDescription className="text-xs">
                  Your active team projects and progress
                </CardDescription>
              </div>
              <Link to={ROUTES.PROJECTS}>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {projectsData.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-foreground">No projects yet</p>
                  <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                    Create First Project
                  </Button>
                </div>
              ) : (
                projectsData.map((item) => {
                  const p = item.project;
                  const pTasks = tasksByProjectMap[p?._id] || [];
                  const pDone = pTasks.filter((t) => t.status === TASK_STATUS.DONE).length;
                  const pPercent = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;

                  return (
                    <div
                      key={p?._id}
                      className="p-3.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors space-y-2.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <Link
                            to={`/app/projects/${p?._id}`}
                            className="font-bold text-foreground hover:text-primary transition-colors text-sm"
                          >
                            {p?.name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {p?.description}
                          </p>
                        </div>
                        <RoleBadge role={item.role} />
                      </div>

                      {/* Progress and metadata */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>{pDone} of {pTasks.length} tasks completed</span>
                          <span className="font-semibold text-foreground">{pPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${pPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <Users className="w-3 h-3" />
                          {p?.members || 1} team member{p?.members === 1 ? '' : 's'}
                        </span>
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/app/projects/${p?._id}/tasks`}
                            className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Board <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-xs">
                Timeline derived from workspace and task updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <RecentActivityTimeline
                projectsData={projectsData}
                allTasks={allTasks}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
