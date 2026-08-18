import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Mail, Shield } from 'lucide-react';
import { projectsApi } from '../../api/projects.api.js';
import { addMemberSchema } from '../../schemas/project.schema.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';

export function InviteMemberModal({ isOpen, onClose, projectId }) {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: '',
      role: ROLES.MEMBER,
    },
  });

  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      reset({ email: '', role: ROLES.MEMBER });
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      return await projectsApi.addMember(projectId, values);
    },
    onSuccess: (data) => {
      showToast.success('Member added to project team!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId) });
      onClose();
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);

      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          if (['email', 'role'].includes(field)) {
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
      title="Add Team Member"
      description="Add an existing registered user to this project workspace by their registered email address."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {apiError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Member Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Registered User Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('email')}
              type="email"
              placeholder="user@example.com"
              className="pl-9 text-xs"
              error={errors.email?.message}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            User must already have an active registered account on TaskFlow.
          </p>
        </div>

        {/* Member Role Select */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Assigned Role *</label>
          <div className="relative">
            <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <select
              {...register('role')}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-border"
            >
              <option value={ROLES.MEMBER}>{ROLE_LABELS[ROLES.MEMBER]} - Can view & update subtasks</option>
              <option value={ROLES.PROJECT_ADMIN}>{ROLE_LABELS[ROLES.PROJECT_ADMIN]} - Can manage tasks & notes</option>
              <option value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]} - Full workspace admin control</option>
            </select>
          </div>
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={mutation.isPending}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
