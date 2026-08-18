import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';

export function Breadcrumbs({ items }) {
  const location = useLocation();

  // If custom items passed, use them
  if (items && items.length > 0) {
    return (
      <nav className="flex items-center text-xs text-muted-foreground space-x-1.5 overflow-x-auto py-1">
        <Link
          to={ROUTES.APP}
          className="hover:text-foreground flex items-center transition-colors shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
        </Link>
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-1.5 shrink-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            {item.href ? (
              <Link to={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    );
  }

  // Generate dynamic breadcrumbs based on pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  const segmentLabels = {
    app: 'Dashboard',
    projects: 'Projects',
    new: 'New Project',
    tasks: 'Tasks',
    notes: 'Notes',
    members: 'Members',
    settings: 'Settings',
    account: 'Account',
  };

  const breadcrumbList = [];
  let currentPath = '';

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;

    // Skip root 'app' segment if it's the start
    if (segment === 'app') {
      breadcrumbList.push({ label: 'Dashboard', href: ROUTES.APP });
      return;
    }

    const isId = segment.length > 15; // Mongo ID segment
    const label = isId
      ? 'Detail'
      : segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    breadcrumbList.push({
      label,
      href: currentPath,
    });
  });

  return (
    <nav className="flex items-center text-xs text-muted-foreground space-x-1.5 overflow-x-auto py-1">
      <Link
        to={ROUTES.APP}
        className="hover:text-foreground flex items-center transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {breadcrumbList.map((item, idx) => {
        const isLast = idx === breadcrumbList.length - 1;
        return (
          <div key={idx} className="flex items-center space-x-1.5 shrink-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
            {isLast ? (
              <span className="text-foreground font-medium truncate max-w-[120px]">
                {item.label}
              </span>
            ) : (
              <Link to={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
