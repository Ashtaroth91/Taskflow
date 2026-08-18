import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, FileText } from 'lucide-react';
import { notesApi } from '../../api/notes.api.js';
import { noteSchema } from '../../schemas/note.schema.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';

export function NoteFormModal({ isOpen, onClose, projectId, noteToEdit = null }) {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState(null);
  const isEditing = !!noteToEdit;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      if (noteToEdit) {
        reset({
          title: noteToEdit.title || '',
          content: noteToEdit.content || '',
        });
      } else {
        reset({
          title: '',
          content: '',
        });
      }
    }
  }, [isOpen, noteToEdit, reset]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (isEditing) {
        return await notesApi.updateNote(projectId, noteToEdit._id, values);
      }
      return await notesApi.createNote(projectId, values);
    },
    onSuccess: () => {
      showToast.success(isEditing ? 'Note updated successfully!' : 'Note created successfully!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_NOTES(projectId) });
      onClose();
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);

      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          if (['title', 'content'].includes(field)) {
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
      title={isEditing ? 'Edit Project Note' : 'Create Project Note'}
      description="Document architecture decisions, meeting notes, or project documentation."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {apiError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Note Title */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Note Title *</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              {...register('title')}
              placeholder="e.g. Architecture Overview & API Guidelines"
              className="pl-9 text-xs"
              error={errors.title?.message}
            />
          </div>
        </div>

        {/* Note Content */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Note Content *</label>
          <textarea
            {...register('content')}
            rows={6}
            placeholder="Write note details, specifications, or team guidelines..."
            className="flex w-full rounded-md border border-input bg-background p-3 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-border"
          />
          {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={mutation.isPending}>
            {isEditing ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
