import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, User, Edit3, Trash2, AlertCircle } from 'lucide-react';
import { notesApi } from '../../api/notes.api.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { ROLES } from '../../constants/roles.js';
import { formatDate } from '../../utils/formatters.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';

export function NoteDetailModal({ note, isOpen, onClose, projectId, projectRole, onEdit }) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const canManage = projectRole === ROLES.ADMIN || projectRole === ROLES.PROJECT_ADMIN;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await notesApi.deleteNote(projectId, note?._id);
    },
    onSuccess: () => {
      showToast.success('Note deleted successfully.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_NOTES(projectId) });
      setIsDeleting(false);
      onClose();
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);
    },
  });

  if (!note) return null;

  return (
    <>
      <Modal
        isOpen={isOpen && !isDeleting}
        onClose={onClose}
        title="Project Note"
        description={`Created ${formatDate(note.createdAt, { dateStyle: 'medium' })}`}
      >
        <div className="space-y-4 pt-1">
          {/* Author Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pb-2.5 border-b border-border">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">{note.createdBy?.username || 'Team Member'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{formatDate(note.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Note Content Body */}
          <div className="p-4 rounded-lg bg-muted/40 border border-border text-xs leading-relaxed text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto font-sans">
            {note.content}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {canManage && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit(note);
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleting(true)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        title="Delete Project Note"
        description="Are you sure you want to permanently delete this note?"
      >
        <div className="space-y-4 pt-1">
          {apiError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            This note will be permanently removed.
          </p>
          <div className="p-3 bg-muted/30 border border-border rounded-lg text-xs italic text-muted-foreground line-clamp-3">
            "{note.content}"
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
