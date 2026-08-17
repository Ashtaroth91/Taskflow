import { Outlet } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { ENV } from '../config/env.config.js';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{ENV.APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">Collaborative project management for teams</p>
        </div>

        {/* Auth Form Container Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-xl border border-border/60">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {ENV.APP_NAME}. All rights reserved.
        </div>
      </div>
    </div>
  );
}
