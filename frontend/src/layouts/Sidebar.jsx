import { NavLink, useParams } from 'react-router-dom';
import {
  CheckSquare,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  User,
  Users,
  X,
  PlusCircle,
} from 'lucide-react';
import { ENV } from '../config/env.config.js';
import { ROUTES } from '../constants/routes.js';
import { cn } from '../utils/cn.js';
import { Button } from '../components/ui/Button.jsx';
import { ROLES } from '../constants/roles.js';
import { useProjectRole } from '../hooks/useProjectRole.js';

export function Sidebar({ isOpen, onClose }) {
  const { projectId } = useParams();
  const { projectRole } = useProjectRole();

  const mainNavItems = [
    { label: 'Dashboard', href: ROUTES.APP, icon: LayoutDashboard },
    { label: 'Projects', href: ROUTES.PROJECTS, icon: FolderKanban },
    { label: 'Account', href: ROUTES.ACCOUNT, icon: User },
  ];

  const projectNavItems = projectId
    ? [
        { label: 'Overview', href: `/app/projects/${projectId}`, icon: FolderKanban },
        { label: 'Tasks', href: `/app/projects/${projectId}/tasks`, icon: CheckSquare },
        { label: 'Notes', href: `/app/projects/${projectId}/notes`, icon: FileText },
        { label: 'Members', href: `/app/projects/${projectId}/members`, icon: Users },
        ...(projectRole === ROLES.ADMIN
          ? [{ label: 'Settings', href: `/app/projects/${projectId}/settings`, icon: Settings }]
          : []),
      ]
    : [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 w-60 border-r border-border bg-card flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm block leading-tight text-foreground">
                {ENV.APP_NAME}
              </span>
              <span className="text-[10px] text-muted-foreground block leading-tight">
                Project Workspace
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Main Navigation */}
          <div className="space-y-0.5">
            <p className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              General
            </p>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === ROUTES.APP}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Active Project Navigation */}
          {projectId && (
            <div className="space-y-0.5 pt-3 border-t border-border">
              <p className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Current Workspace
              </p>
              {projectNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === `/app/projects/${projectId}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-secondary text-secondary-foreground font-semibold border border-border'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer Action */}
        <div className="p-3 border-t border-border">
          <NavLink
            to={ROUTES.PROJECT_NEW}
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted border border-border text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Project
          </NavLink>
        </div>
      </aside>
    </>
  );
}
