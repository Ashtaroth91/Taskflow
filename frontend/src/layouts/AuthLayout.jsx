import { Outlet } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { ENV } from '../config/env.config.js';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{ENV.APP_NAME}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Project management for teams and students</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl p-7 border border-border shadow-sm">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {ENV.APP_NAME} &middot; Open project collaboration
        </div>
      </div>
    </div>
  );
}

