import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Info } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notificationsPlaceholder = [
    {
      id: '1',
      title: 'Welcome to TaskFlow',
      description: 'Your workspace is ready. Explore active projects and tasks.',
      time: 'Just now',
      unread: true,
      type: 'info',
    },
    {
      id: '2',
      title: 'Email Verified',
      description: 'Your account email address was confirmed.',
      time: '1 hour ago',
      unread: false,
      type: 'success',
    },
  ];

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
      </Button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-xl p-3 z-50 animate-in fade-in-80 slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
            <h4 className="text-xs font-bold text-foreground">Notifications</h4>
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              2 New
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notificationsPlaceholder.map((n) => (
              <div
                key={n.id}
                className="p-2.5 rounded-lg border border-border/50 bg-card/60 hover:bg-accent/40 transition-colors flex items-start gap-2.5"
              >
                {n.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {n.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {n.description}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{n.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 mt-2 border-t border-border text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Close Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
