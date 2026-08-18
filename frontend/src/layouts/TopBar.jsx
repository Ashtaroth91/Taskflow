import { useState } from 'react';
import { Search } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { NotificationsPopover } from '../components/layout/NotificationsPopover.jsx';
import { UserDropdown } from '../components/layout/UserDropdown.jsx';
import { Input } from '../components/ui/Input.jsx';

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 border-b border-border bg-card/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left side: Breadcrumbs and Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="hidden lg:block shrink-0">
          <Breadcrumbs />
        </div>

        {/* Search Bar Placeholder (Client-side search input) */}
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or tasks... (Ctrl+K)"
            className="pl-9 pr-4 h-9 text-xs bg-background/50 focus:bg-background border-border/80 rounded-xl"
          />
        </div>
      </div>

      {/* Right side: Notifications and User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationsPopover />
        <div className="h-5 w-[1px] bg-border mx-1" />
        <UserDropdown />
      </div>
    </header>
  );
}
