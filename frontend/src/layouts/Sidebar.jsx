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
  PlusCircle,
} from 'lucide-react';
import { ENV } from '../config/env.config.js';
import { ROUTES } from '../constants/routes.js';
import { cn } from '../utils/cn.js';
import { Button } from '../components/ui/Button.jsx';
import { ROLES } from '../constants/roles.js';
import { useProjectRole } from '../hooks/useProjectRole.js';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { projectId } = useParams();
  const { projectRole } = useProjectRole();

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
        ...(projectRole === ROLES.ADMIN
          ? [{ label: 'Settings', href: `/app/projects/${projectId}/settings`, icon: Settings }]
          : []),
      ]
    : [];

  return (
    <>
      {/* Mobile Header Bar & Hamburger Toggle Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-base">{ENV.APP_NAME}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-border bg-card/80 backdrop-blur-md flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-base block leading-tight">{ENV.APP_NAME}</span>
            <span className="text-[10px] text-muted-foreground block leading-tight">Student Workspace</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Active Project Menu */}
          {projectId && (
            <div className="space-y-1 pt-4 border-t border-border">
              <div className="px-3 flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Active Project
                </p>
              </div>
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
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                        isActive
                          ? 'bg-secondary text-secondary-foreground font-bold shadow-sm'
                          : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground'
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

        {/* Sidebar Footer Action */}
        <div className="p-4 border-t border-border">
          <NavLink
            to={ROUTES.PROJECT_NEW}
            onClick={closeSidebar}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Workspace
          </NavLink>
        </div>
      </aside>
    </>
  );
}
