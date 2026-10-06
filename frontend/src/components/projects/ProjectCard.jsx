import { Link } from 'react-router-dom';
import { FolderKanban, Users, ArrowRight, CheckSquare, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card.jsx';
import { RoleBadge } from '../common/StatusBadge.jsx';
import { truncateText } from '../../utils/formatters.js';

export function ProjectCard({ projectItem }) {
  if (!projectItem) return null;

  // Endpoint returns { role, project: { _id, name, description, members, createdAt } }
  const { role, project } = projectItem;
  const projectId = project?._id;

  return (
    <Card className="border-border hover:border-primary/40 shadow-sm transition-colors flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
            <FolderKanban className="w-4.5 h-4.5" />
          </div>
          <RoleBadge role={role} />
        </div>
        <CardTitle className="text-base font-bold hover:text-primary transition-colors mt-3">
          <Link to={`/app/projects/${projectId}`} className="hover:underline">
            {project?.name || 'Untitled Project'}
          </Link>
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2 mt-1">
          {truncateText(project?.description, 120) || 'No description provided.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{project?.members || 1} Member{project?.members === 1 ? '' : 's'}</span>
          </div>

          <Link
            to={`/app/projects/${projectId}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Open Project
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
