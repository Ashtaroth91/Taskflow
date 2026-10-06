import { Menu, Sun, Moon, CheckSquare } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { UserDropdown } from '../components/layout/UserDropdown.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { THEMES } from '../config/theme.config.js';
import { Button } from '../components/ui/Button.jsx';
import { ENV } from '../config/env.config.js';

export function TopBar({ onToggleSidebar }) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  };

  return (
    <header className="h-14 border-b border-border bg-card/95 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left side: Mobile menu toggle + Brand or Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* Mobile Brand indicator */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm tracking-tight">{ENV.APP_NAME}</span>
        </div>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right side: Theme Toggle & User Menu */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title={`Switch to ${theme === THEMES.DARK ? 'light' : 'dark'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === THEMES.DARK ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />
        <UserDropdown />
      </div>
    </header>
  );
}
