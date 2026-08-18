import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderKanban, Plus, Search, Filter } from 'lucide-react';
import { projectsApi } from '../../api/projects.api.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';
import { useClientFilter } from '../../hooks/useClientFilter.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { CardSkeleton } from '../../components/feedback/LoadingSkeleton.jsx';
import { EmptyState } from '../../components/feedback/EmptyState.jsx';
import { ProjectCard } from '../../components/projects/ProjectCard.jsx';
import { ProjectFormModal } from '../../components/projects/ProjectFormModal.jsx';

export default function ProjectsListPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: projectsData = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: projectsApi.getProjects,
  });

  // Client-side search & filtering across project names & descriptions
  const searchKeys = ['name', 'description'];
  const {
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    filteredItems,
  } = useClientFilter(
    projectsData.map((item) => ({
      ...item.project,
      role: item.role, // Attach role for filtering
      rawItem: item,
    })),
    searchKeys
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Projects"
        description="Collaborative student team workspaces and repositories"
        actions={
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        }
      />

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by name..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-border"
          >
            <option value="all">All Roles</option>
            <option value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</option>
            <option value={ROLES.PROJECT_ADMIN}>{ROLE_LABELS[ROLES.PROJECT_ADMIN]}</option>
            <option value={ROLES.MEMBER}>{ROLE_LABELS[ROLES.MEMBER]}</option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 text-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive space-y-3">
          <p className="text-sm font-semibold">Failed to load projects list.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Loading
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredItems.length === 0 && (
        <EmptyState
          title={searchTerm ? 'No matching projects found' : 'No projects available'}
          description={
            searchTerm
              ? 'Try adjusting your search keyword or role filter.'
              : 'Create your first collaborative project workspace to start adding tasks and notes.'
          }
          icon={FolderKanban}
          actionLabel="Create Project"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Projects Grid */}
      {!isLoading && !isError && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ProjectCard key={item._id} projectItem={item.rawItem} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
