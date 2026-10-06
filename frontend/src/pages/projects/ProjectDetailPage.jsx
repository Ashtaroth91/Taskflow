import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  CheckSquare,
  FileText,
  Users,
  Settings,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { projectsApi } from '../../api/projects.api.js';
import { tasksApi } from '../../api/tasks.api.js';
import { notesApi } from '../../api/notes.api.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { ROLES } from '../../constants/roles.js';
import { TASK_STATUS } from '../../constants/taskStatus.js';
import { useProjectRole } from '../../hooks/useProjectRole.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Breadcrumbs } from '../../components/common/Breadcrumbs.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.jsx';
import { RoleBadge, TaskStatusBadge } from '../../components/common/StatusBadge.jsx';
import { FullPageSpinner } from '../../components/feedback/FullPageSpinner.jsx';
import { formatDate, getInitials } from '../../utils/formatters.js';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { projectRole, isLoading: isRoleLoading } = useProjectRole();

  // Query Project Details
  const {
    data: project,
    isLoading: isProjectLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_DETAIL(projectId),
    queryFn: () => projectsApi.getProjectById(projectId),
  });

  // Query Project Tasks
  const { data: tasks = [] } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_TASKS(projectId),
    queryFn: () => tasksApi.getTasks(projectId),
    enabled: !!projectId,
  });

  // Query Project Notes
  const { data: notes = [] } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_NOTES(projectId),
    queryFn: () => notesApi.getNotes(projectId),
    enabled: !!projectId,
  });

  // Query Project Members
  const { data: members = [] } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId),
    queryFn: () => projectsApi.getMembers(projectId),
    enabled: !!projectId,
  });

  if (isProjectLoading || isRoleLoading) {
    return <FullPageSpinner message="Loading workspace details..." />;
  }

  if (isError || !project) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive space-y-3">
        <h2 className="text-lg font-bold">Project Not Found</h2>
        <p className="text-xs">The requested project workspace could not be found or access is denied.</p>
        <Link to="/app/projects">
          <Button variant="outline" size="sm">
            Back to Projects List
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate Task Metrics client-side
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === TASK_STATUS.DONE).length;
  const inProgressTasks = tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length;
  const todoTasks = tasks.filter((t) => t.status === TASK_STATUS.TODO).length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* Project Overview Header */}
      <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
              {projectRole && <RoleBadge role={projectRole} />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {projectRole === ROLES.ADMIN && (
              <Link to={`/app/projects/${projectId}/settings`}>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1.5" />
                  Settings
                </Button>
              </Link>
            )}
            <Link to={`/app/projects/${projectId}/tasks`}>
              <Button size="sm">
                <CheckSquare className="w-4 h-4 mr-1.5" />
                Task Board
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Overall Task Completion</span>
            <span className="text-primary font-bold">{progressPercent}% ({doneTasks}/{totalTasks})</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">To Do Tasks</p>
              <p className="text-xl font-bold text-foreground mt-1">{todoTasks}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">In Progress</p>
              <p className="text-xl font-bold text-amber-500 mt-1">{inProgressTasks}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Completed</p>
              <p className="text-xl font-bold text-emerald-500 mt-1">{doneTasks}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Tasks & Notes Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks Card */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <CardDescription className="text-xs">Latest assigned project tasks</CardDescription>
            </div>
            <Link to={`/app/projects/${projectId}/tasks`}>
              <Button variant="ghost" size="sm" className="text-xs">
                View Board <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No tasks created yet.</p>
            ) : (
              tasks.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="p-3 rounded-xl border border-border/50 bg-card/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{task.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Assigned to: {task.assignedTo?.username || 'Unassigned'}
                    </p>
                  </div>
                  <TaskStatusBadge status={task.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Notes Card */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Project Notes</CardTitle>
              <CardDescription className="text-xs">Shared documentation & notes</CardDescription>
            </div>
            <Link to={`/app/projects/${projectId}/notes`}>
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {notes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No notes created yet.</p>
            ) : (
              notes.slice(0, 4).map((note) => (
                <div
                  key={note._id}
                  className="p-3 rounded-xl border border-border/50 bg-card/60 space-y-1 text-xs"
                >
                  <p className="font-medium text-foreground line-clamp-2">{note.content}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span>By: {note.createdBy?.username || 'Team Member'}</span>
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Members Card */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Team Members ({members.length})</CardTitle>
            <CardDescription className="text-xs">Project collaborators and roles</CardDescription>
          </div>
          <Link to={`/app/projects/${projectId}/members`}>
            <Button variant="ghost" size="sm" className="text-xs">
              Manage Members <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {members.map((m) => {
              const u = m.user;
              const avatar = typeof u?.avatar === 'string' ? u.avatar : u?.avatar?.url;
              return (
                <div
                  key={m._id || u?._id}
                  className="flex items-center gap-2.5 p-2 pr-3 rounded-xl border border-border/60 bg-card/60"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {avatar ? (
                      <img src={avatar} alt={u?.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(u?.username || u?.email)
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-none">{u?.username || 'Member'}</p>
                    <p className="text-[10px] text-muted-foreground leading-none mt-1 capitalize">{m.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
