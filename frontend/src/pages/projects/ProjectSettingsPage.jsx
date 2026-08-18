import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, Trash2, AlertTriangle, Save, AlertCircle } from 'lucide-react';
import { projectsApi } from '../../api/projects.api.js';
import { projectSchema } from '../../schemas/project.schema.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { ROLES } from '../../constants/roles.js';
import { useProjectRole } from '../../hooks/useProjectRole.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Breadcrumbs } from '../../components/common/Breadcrumbs.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { FullPageSpinner } from '../../components/feedback/FullPageSpinner.jsx';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';

export default function ProjectSettingsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { projectRole } = useProjectRole();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch Project details
  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_DETAIL(projectId),
    queryFn: () => projectsApi.getProjectById(projectId),
    enabled: !!projectId,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        description: project.description || '',
      });
    }
  }, [project, reset]);

  // Update Project Mutation
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      return await projectsApi.updateProject(projectId, values);
    },
    onSuccess: () => {
      showToast.success('Project details updated successfully!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_DETAIL(projectId) });
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

  // Delete Project Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await projectsApi.deleteProject(projectId);
    },
    onSuccess: () => {
      showToast.success('Project deleted successfully.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
      navigate('/app/projects');
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);
    },
  });

  const onSubmit = (data) => {
    setApiError(null);
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <FullPageSpinner message="Loading workspace settings..." />;
  }

  // Admin role check guard
  if (projectRole !== ROLES.ADMIN) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive space-y-3">
        <h2 className="text-lg font-bold">Access Restricted</h2>
        <p className="text-xs">Only Project Administrators can access workspace settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <PageHeader
        title="Project Settings"
        description="Manage workspace title, description, and administrator options"
      />

      {apiError && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2.5 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Edit Form Card */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Workspace Information</CardTitle>
          <CardDescription className="text-xs">
            Both project name and description are required by the backend API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Project Name *</label>
              <Input
                {...register('name')}
                placeholder="Project title (min 5 characters)"
                className="text-xs"
                error={errors.name?.message}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Project Description *</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Project description (min 20 characters)"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-border"
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" isLoading={updateMutation.isPending} disabled={!isDirty}>
                <Save className="w-4 h-4 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Permanently delete this project workspace, including all associated tasks, subtasks, and notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center pt-0">
          <p className="text-xs text-muted-foreground">
            This action is permanent and cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Project
          </Button>
        </CardContent>
      </Card>

      {/* Confirm Delete Project Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project Workspace"
        description="Are you sure you want to delete this project? This will permanently remove all tasks and notes."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Type the project name <span className="font-bold text-foreground">{project?.name}</span> to confirm.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Permanently Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
