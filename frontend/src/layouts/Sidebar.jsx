import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  CheckSquare,
  CheckSquare as TaskIcon,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import { ENV } from '../config/env.config.js';
import { ROUTES } from '../constants/routes.js';
import { cn } from '../utils/cn.js';
import { Button } from '../components/ui/Button.jsx';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { projectId } = useParams();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const mainNavItems = [
    { label: 'Dashboard', href: ROUTES.APP, icon: LayoutDashboard },
    { label: 'Projects', href: ROUTES.PROJECTS, icon: FolderKanban },
    { label: 'Account', href: ROUTES.ACCOUNT, icon: User },
  ];

  const projectNavItems = projectId
    ? [
        { label: 'Overview', href: `/app/projects/${projectId}`, icon: FolderKanban },
        { label: 'Tasks', href: `/app/projects/${projectId}/tasks`, icon: TaskIcon },
        { label: 'Notes', href: `/app/projects/${projectId}/notes`, icon: FileText },
        { label: 'Members', href: `/app/projects/${projectId}/members`, icon: Users },
        { label: 'Settings', href: `/app/projects/${projectId}/settings`, icon: Settings },
      ]
    : [];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-4 z-40">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-border bg-card/60 backdrop-blur-md flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-lg">{ENV.APP_NAME}</span>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Main Menu
            </p>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === ROUTES.APP}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Project Specific Navigation (If viewing a project) */}
          {projectId && (
            <div className="space-y-1 pt-4 border-t border-border">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Active Project
              </p>
              {projectNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === `/app/projects/${projectId}`}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-secondary text-secondary-foreground font-semibold'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
