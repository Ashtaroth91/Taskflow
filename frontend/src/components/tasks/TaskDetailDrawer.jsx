import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  CheckSquare,
  Paperclip,
  Trash2,
  Plus,
  User,
  AlertCircle,
  Edit2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { tasksApi } from '../../api/tasks.api.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants/taskStatus.js';
import { ROLES } from '../../constants/roles.js';
import { TaskStatusBadge } from '../common/StatusBadge.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import { FullPageSpinner } from '../feedback/FullPageSpinner.jsx';
import { getInitials, formatDate } from '../../utils/formatters.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';

export function TaskDetailDrawer({ taskId, projectId, projectRole, members = [], onClose }) {
  const queryClient = useQueryClient();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Task Edit Form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');

  // Fetch Full Task Details (embeds subtasks and populated assignedTo)
  const {
    data: task,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.TASK_DETAIL(projectId, taskId),
    queryFn: async () => {
      const data = await tasksApi.getTaskById(projectId, taskId);
      setEditTitle(data.title || '');
      setEditDescription(data.description || '');
      setEditStatus(data.status || TASK_STATUS.TODO);
      setEditAssignedTo(data.assignedTo?._id || '');
      return data;
    },
    enabled: !!projectId && !!taskId,
  });

  // Toggle Subtask Completion (Any member can update)
  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subTaskId, isCompleted }) => {
      return await tasksApi.updateSubtask(projectId, subTaskId, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK_DETAIL(projectId, taskId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(projectId) });
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      showToast.error(parsed.message);
    },
  });

  // Create Subtask Mutation (Admin / Project Admin)
  const createSubtaskMutation = useMutation({
    mutationFn: async (title) => {
      return await tasksApi.createSubtask(projectId, taskId, { title });
    },
    onSuccess: () => {
      showToast.success('Subtask added!');
      setNewSubtaskTitle('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK_DETAIL(projectId, taskId) });
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      showToast.error(parsed.message);
    },
  });

  // Delete Subtask Mutation
  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subTaskId) => {
      return await tasksApi.deleteSubtask(projectId, subTaskId);
    },
    onSuccess: () => {
      showToast.success('Subtask removed.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK_DETAIL(projectId, taskId) });
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      showToast.error(parsed.message);
    },
  });

  // Update Task Mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedData) => {
      return await tasksApi.updateTask(projectId, taskId, updatedData);
    },
    onSuccess: () => {
      showToast.success('Task details saved!');
      setIsEditingTask(false);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK_DETAIL(projectId, taskId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(projectId) });
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      return await tasksApi.deleteTask(projectId, taskId);
    },
    onSuccess: () => {
      showToast.success('Task deleted.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(projectId) });
      onClose();
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      showToast.error(parsed.message);
    },
  });

  const canManageTask = projectRole === ROLES.ADMIN || projectRole === ROLES.PROJECT_ADMIN;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || newSubtaskTitle.trim().length < 5) {
      showToast.error('Subtask title must be at least 5 characters.');
      return;
    }
    createSubtaskMutation.mutate(newSubtaskTitle.trim());
  };

  const handleSaveTaskEdit = (e) => {
    e.preventDefault();
    if (editTitle.trim().length < 5) {
      showToast.error('Task title must be at least 5 characters.');
      return;
    }
    updateTaskMutation.mutate({
      title: editTitle.trim(),
      description: editDescription.trim(),
      status: editStatus,
      assignedTo: editAssignedTo,
    });
  };

  if (!taskId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-card border-l border-border h-full shadow-lg flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between gap-4 sticky top-0 bg-card/95 backdrop-blur z-10">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground truncate">
                {task?.title || 'Task Details'}
              </h2>
              {task?.status && <TaskStatusBadge status={task.status} />}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Created by {task?.assignedBy?.username || 'Team Member'} on {formatDate(task?.createdAt)}
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="p-12 text-center">
            <FullPageSpinner message="Loading task details..." />
          </div>
        ) : isError || !task ? (
          <div className="p-8 text-center text-destructive text-xs">
            Failed to load task details.
          </div>
        ) : (
          <div className="p-6 space-y-6 flex-1">
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Task Edit Form vs Readonly View */}
            {isEditingTask ? (
              <form onSubmit={handleSaveTaskEdit} className="space-y-4 p-4 border border-border/80 rounded-xl bg-muted/30">
                <h4 className="text-xs font-bold text-foreground">Edit Task Information</h4>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold">Title</label>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full h-9 text-xs rounded-md border border-input bg-background px-2 border-border"
                    >
                      <option value={TASK_STATUS.TODO}>{TASK_STATUS_LABELS[TASK_STATUS.TODO]}</option>
                      <option value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}</option>
                      <option value={TASK_STATUS.DONE}>{TASK_STATUS_LABELS[TASK_STATUS.DONE]}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold">Assignee</label>
                    <select
                      value={editAssignedTo}
                      onChange={(e) => setEditAssignedTo(e.target.value)}
                      className="w-full h-9 text-xs rounded-md border border-input bg-background px-2 border-border"
                    >
                      {members.map((m) => (
                        <option key={m.user?._id} value={m.user?._id}>
                          {m.user?.username || m.user?.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditingTask(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={updateTaskMutation.isPending}>
                    Save Task
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground">Description</h4>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {task.description || 'No detailed description provided.'}
                  </p>
                </div>

                {/* Assigned Member Card */}
                <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                      {getInitials(task.assignedTo?.username || 'U')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{task.assignedTo?.username || 'Unassigned'}</p>
                      <p className="text-[10px] text-muted-foreground">{task.assignedTo?.email}</p>
                    </div>
                  </div>
                  {canManageTask && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingTask(true)} className="text-xs">
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Task
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Subtasks Checklist Section */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Subtask Checklist ({task.subtasks?.filter((s) => s.isCompleted).length || 0}/{task.subtasks?.length || 0})
                </h4>
              </div>

              {/* Subtasks List */}
              <div className="space-y-2">
                {(!task.subtasks || task.subtasks.length === 0) ? (
                  <p className="text-[11px] text-muted-foreground italic">No subtasks added yet.</p>
                ) : (
                  task.subtasks.map((st) => (
                    <div
                      key={st._id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-card hover:bg-accent/40 transition-colors text-xs"
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={!!st.isCompleted}
                          onChange={(e) =>
                            toggleSubtaskMutation.mutate({ subTaskId: st._id, isCompleted: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
                        />
                        <span className={st.isCompleted ? 'line-through text-muted-foreground' : 'font-medium text-foreground'}>
                          {st.title}
                        </span>
                      </label>

                      {canManageTask && (
                        <button
                          type="button"
                          onClick={() => deleteSubtaskMutation.mutate(st._id)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                          title="Delete subtask"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Subtask Inline Form */}
              {canManageTask && (
                <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a new checklist item..."
                    className="h-8 text-xs flex-1"
                  />
                  <Button type="submit" size="sm" className="h-8 text-xs" isLoading={createSubtaskMutation.isPending}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </form>
              )}
            </div>

            {/* File Attachments Section */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-border">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-primary" />
                  Attachments ({task.attachments.length})
                </h4>
                <div className="space-y-1.5">
                  {task.attachments.map((att, idx) => {
                    const url = typeof att === 'string' ? att : att.url;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/30 text-xs"
                      >
                        <span className="truncate max-w-[280px] font-mono text-[11px]">{url}</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-semibold hover:underline text-[11px]"
                        >
                          View File
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {canManageTask && task && (
          <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center sticky bottom-0">
            <Button variant="destructive" size="sm" onClick={() => setIsDeleting(true)}>
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete Task
            </Button>

            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Delete Task Modal */}
      <Modal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        title="Delete Task"
        description="Are you sure you want to delete this task and all associated subtasks?"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">
            This action cannot be undone. Task <span className="font-bold text-foreground">{task?.title}</span> will be permanently deleted.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={deleteTaskMutation.isPending}
              onClick={() => deleteTaskMutation.mutate()}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
