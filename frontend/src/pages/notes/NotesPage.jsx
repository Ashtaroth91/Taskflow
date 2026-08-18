import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, Search, Calendar, User } from 'lucide-react';
import { notesApi } from '../../api/notes.api.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { ROLES } from '../../constants/roles.js';
import { useProjectRole } from '../../hooks/useProjectRole.js';
import { useClientFilter } from '../../hooks/useClientFilter.js';
import { formatDate } from '../../utils/formatters.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Breadcrumbs } from '../../components/common/Breadcrumbs.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import { FullPageSpinner } from '../../components/feedback/FullPageSpinner.jsx';
import { EmptyState } from '../../components/feedback/EmptyState.jsx';
import { NoteFormModal } from '../../components/notes/NoteFormModal.jsx';
import { NoteDetailModal } from '../../components/notes/NoteDetailModal.jsx';

export default function NotesPage() {
  const { projectId } = useParams();
  const { projectRole } = useProjectRole();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);

  // Fetch Project Notes
  const {
    data: notes = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_NOTES(projectId),
    queryFn: () => notesApi.getNotes(projectId),
    enabled: !!projectId,
  });

  // Client-side search filtering
  const searchKeys = ['title', 'content'];
  const { searchTerm, setSearchTerm, filteredItems } = useClientFilter(notes, searchKeys);

  const canManage = projectRole === ROLES.ADMIN || projectRole === ROLES.PROJECT_ADMIN;

  if (isLoading) {
    return <FullPageSpinner message="Loading project notes..." />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <PageHeader
        title={`Project Notes (${notes.length})`}
        description="Architecture decisions, meeting notes, and workspace documentation"
        actions={
          canManage && (
            <Button
              size="sm"
              onClick={() => {
                setNoteToEdit(null);
                setIsFormModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Note
            </Button>
          )
        }
      />

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notes by title or content..."
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-6 text-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive space-y-3">
          <p className="text-xs font-semibold">Failed to load project notes.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isError && filteredItems.length === 0 && (
        <EmptyState
          title={searchTerm ? 'No matching notes' : 'No notes created yet'}
          description={
            searchTerm
              ? 'Try adjusting your search query.'
              : 'Create notes to share documentation and architecture guidelines with your team.'
          }
          icon={FileText}
          actionLabel={canManage ? 'New Note' : null}
          onAction={() => {
            setNoteToEdit(null);
            setIsFormModalOpen(true);
          }}
        />
      )}

      {/* Notes Grid */}
      {!isError && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((note) => (
            <Card
              key={note._id}
              onClick={() => setSelectedNote(note)}
              className="cursor-pointer border-border/70 hover:border-primary/40 shadow-sm hover:shadow transition-all group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {note.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {note.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{note.createdBy?.username || 'Member'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(note.createdAt, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <NoteFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setNoteToEdit(null);
        }}
        projectId={projectId}
        noteToEdit={noteToEdit}
      />

      {/* Detail Modal */}
      <NoteDetailModal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        note={selectedNote}
        projectId={projectId}
        projectRole={projectRole}
        onEdit={(note) => {
          setNoteToEdit(note);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
}
