import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { projectsApi } from '../../api/projects.api.js';
import { projectSchema } from '../../schemas/project.schema.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';

export function ProjectFormModal({ isOpen, onClose, initialData = null, onSuccess }) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?._id;
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      if (initialData) {
        reset({
          name: initialData.name || '',
          description: initialData.description || '',
        });
      } else {
        reset({ name: '', description: '' });
      }
    }
  }, [isOpen, initialData, reset]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (isEditing) {
        return await projectsApi.updateProject(initialData._id, values);
      }
      return await projectsApi.createProject(values);
    },
    onSuccess: (data) => {
      showToast.success(
        isEditing ? 'Project details updated!' : 'Project workspace created successfully!'
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_DETAIL(initialData._id) });
      }
      onClose();
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);

      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          if (['name', 'description'].includes(field)) {
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
      title={isEditing ? 'Edit Project Workspace' : 'Create New Project'}
      description={
        isEditing
          ? 'Update project title and description details.'
          : 'Setup a new collaborative project workspace for your team.'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {apiError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Project Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Project Name *</label>
          <Input
            {...register('name')}
            placeholder="e.g. Web Development Capstone"
            className="text-xs"
            error={errors.name?.message}
          />
        </div>

        {/* Project Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Description *</label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Detailed overview of project goals, team requirements, and objectives (at least 20 characters)..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-border"
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={mutation.isPending}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
