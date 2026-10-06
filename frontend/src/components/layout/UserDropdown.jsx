import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import { THEMES } from '../../config/theme.config.js';
import { getInitials } from '../../utils/formatters.js';
import { ROUTES } from '../../constants/routes.js';
import { showToast } from '../../utils/toast.js';
import {
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { RoleBadge } from '../common/StatusBadge.jsx';

export function UserDropdown() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const avatarUrl =
    typeof user?.avatar === 'string' ? user.avatar : user?.avatar?.url;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    showToast.info('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  const toggleTheme = () => {
    setTheme(theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(user.username || user.email)
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold leading-none text-foreground">
            {user.username || 'User'}
          </p>
          <p className="text-[10px] text-muted-foreground leading-none mt-1">
            {user.email}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-lg border border-border bg-card shadow-lg p-1.5 z-50 animate-in fade-in-80 duration-150">
          {/* User Details Header */}
          <div className="px-3 py-2 border-b border-border mb-1 space-y-0.5">
            <p className="text-xs font-semibold text-foreground truncate">
              {user.username || 'User'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>

          {/* Menu Links */}
          <div className="space-y-0.5">
            <Link
              to={ROUTES.ACCOUNT}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Account Settings
            </Link>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
            >
              <span className="flex items-center gap-2.5">
                {theme === THEMES.DARK ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-500" />
                )}
                Appearance
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                {theme}
              </span>
            </button>
          </div>

          {/* Logout Footer */}
          <div className="pt-1 mt-1 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
