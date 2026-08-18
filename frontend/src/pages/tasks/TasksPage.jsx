import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { tasksApi } from '../../api/tasks.api.js';
import { projectsApi } from '../../api/projects.api.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { ROLES } from '../../constants/roles.js';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants/taskStatus.js';
import { useProjectRole } from '../../hooks/useProjectRole.js';
import { useClientFilter } from '../../hooks/useClientFilter.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Breadcrumbs } from '../../components/common/Breadcrumbs.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { FullPageSpinner } from '../../components/feedback/FullPageSpinner.jsx';
import { EmptyState } from '../../components/feedback/EmptyState.jsx';
import { KanbanBoard } from '../../components/tasks/KanbanBoard.jsx';
import { TaskFormModal } from '../../components/tasks/TaskFormModal.jsx';
import { TaskDetailDrawer } from '../../components/tasks/TaskDetailDrawer.jsx';
import { TaskStatusBadge } from '../../components/common/StatusBadge.jsx';
import { getInitials } from '../../utils/formatters.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';

export default function TasksPage() {
  const { projectId } = useParams();
  const { projectRole } = useProjectRole();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Fetch Project Tasks
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_TASKS(projectId),
    queryFn: () => tasksApi.getTasks(projectId),
    enabled: !!projectId,
  });

  // Fetch Project Members (for assignee selection)
  const { data: members = [] } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId),
    queryFn: () => projectsApi.getMembers(projectId),
    enabled: !!projectId,
  });

  // Task Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      return await tasksApi.updateTask(projectId, taskId, { status: newStatus });
    },
    onSuccess: () => {
      showToast.success('Task status updated!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(projectId) });
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      showToast.error(parsed.message);
    },
  });

  const handleStatusChange = (taskId, newStatus) => {
    updateStatusMutation.mutate({ taskId, newStatus });
  };

  // Client-side search and assignee filtering
  const searchKeys = ['title', 'description'];
  const {
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    filteredItems,
  } = useClientFilter(tasks, searchKeys);

  const canCreateTask = projectRole === ROLES.ADMIN || projectRole === ROLES.PROJECT_ADMIN;
  const canEditStatus = canCreateTask || projectRole === ROLES.MEMBER; // Any member can update status per contract

  if (isTasksLoading) {
    return <FullPageSpinner message="Loading task board..." />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <PageHeader
        title={`Tasks Board (${tasks.length})`}
        description="Task status tracking, assignments, and subtasks"
        actions={
          canCreateTask && (
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Task
            </Button>
          )
        }
      />

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs ring-offset-background border-border"
            >
              <option value="all">All Statuses</option>
              <option value={TASK_STATUS.TODO}>{TASK_STATUS_LABELS[TASK_STATUS.TODO]}</option>
              <option value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}</option>
              <option value={TASK_STATUS.DONE}>{TASK_STATUS_LABELS[TASK_STATUS.DONE]}</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('kanban')}
              className="h-8 w-8 rounded-md"
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 rounded-md"
              title="List View"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-6 text-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive space-y-3">
          <p className="text-xs font-semibold">Failed to load project tasks.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isError && filteredItems.length === 0 && (
        <EmptyState
          title={searchTerm ? 'No matching tasks' : 'No tasks created yet'}
          description={
            searchTerm
              ? 'Try adjusting your search query or status filter.'
              : 'Add your first project task to start tracking team progress.'
          }
          icon={CheckSquare}
          actionLabel={canCreateTask ? 'Create Task' : null}
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Task Views */}
      {!isError && filteredItems.length > 0 && (
        <>
          {viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={filteredItems}
              onSelectTask={(task) => setSelectedTaskId(task._id)}
              onStatusChange={handleStatusChange}
              canEditStatus={canEditStatus}
            />
          ) : (
            <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Task Title</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredItems.map((task) => (
                    <tr
                      key={task._id}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="hover:bg-accent/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-bold text-foreground">{task.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {task.assignedTo?.username || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4">
                        <TaskStatusBadge status={task.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        members={members}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        projectId={projectId}
        projectRole={projectRole}
        members={members}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
