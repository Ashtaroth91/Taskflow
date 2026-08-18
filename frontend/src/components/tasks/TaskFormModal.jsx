import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Paperclip, User, X } from 'lucide-react';
import { tasksApi } from '../../api/tasks.api.js';
import { createTaskSchema } from '../../schemas/task.schema.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';

export function TaskFormModal({ isOpen, onClose, projectId, members = [] }) {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTo: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      setSelectedFiles([]);
      reset({ title: '', description: '', assignedTo: members[0]?.user?._id || '' });
    }
  }, [isOpen, reset, members]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      showToast.error('Maximum 5 attachment files allowed.');
      return;
    }
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      showToast.error(`File "${oversized.name}" exceeds maximum allowed size of 5 MB.`);
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async (values) => {
      // Build FormData for task creation with file attachments
      const formData = new FormData();
      formData.append('title', values.title.trim());
      if (values.description) {
        formData.append('description', values.description.trim());
      }
      formData.append('assignedTo', values.assignedTo);

      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      return await tasksApi.createTask(projectId, formData);
    },
    onSuccess: () => {
      showToast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(projectId) });
      onClose();
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);

      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          if (['title', 'description', 'assignedTo'].includes(field)) {
            setError(field, { type: 'server', message: msg });
          }
        });
      }
    },
  });

  const onSubmit = (data) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      description="Add a task to this project workspace and assign it to a team member."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {apiError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Task Title */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Task Title *</label>
          <Input
            {...register('title')}
            placeholder="e.g. Build authentication pages"
            className="text-xs"
            error={errors.title?.message}
          />
        </div>

        {/* Task Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Detailed description of task objectives (min 20 characters if provided)..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-border"
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Assignee Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Assign To Member *</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <select
              {...register('assignedTo')}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-border"
            >
              <option value="">Select project member...</option>
              {members.map((m) => {
                const u = m.user || {};
                return (
                  <option key={u._id} value={u._id}>
                    {u.username || u.email} ({m.role})
                  </option>
                );
              })}
            </select>
          </div>
          {errors.assignedTo && <p className="text-xs text-destructive">{errors.assignedTo.message}</p>}
        </div>

        {/* Attachments Upload (Max 5 files, 5 MB each) */}
        <div className="space-y-2 pt-1 border-t border-border">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
              Attachments (JPEG, PNG, PDF max 5 MB)
            </span>
            <span className="text-[10px] text-muted-foreground">{selectedFiles.length}/5 files</span>
          </label>

          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            disabled={selectedFiles.length >= 5}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50"
          />

          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-1 pt-1">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-muted/40 text-xs"
                >
                  <span className="truncate max-w-[240px] text-[11px] font-medium">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={mutation.isPending}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
