import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { AppShell } from '../layouts/AppShell.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { PublicRoute } from './PublicRoute.jsx';
import { ROLES } from '../constants/roles.js';

// Architectural Page Shell Placeholders (Pages will be implemented in subsequent phases)
const ArchitecturePlaceholder = ({ title }) => (
  <div className="p-8 border border-dashed rounded-xl bg-card text-card-foreground text-center space-y-2">
    <h2 className="text-xl font-bold text-foreground">{title}</h2>
    <p className="text-sm text-muted-foreground">
      Route architecture initialized and ready for page component implementation.
    </p>
  </div>
);

export function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect to App */}
      <Route path="/" element={<Navigate to={ROUTES.APP} replace />} />

      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<ArchitecturePlaceholder title="Login Screen" />} />
          <Route path={ROUTES.REGISTER} element={<ArchitecturePlaceholder title="Register Screen" />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ArchitecturePlaceholder title="Forgot Password Screen" />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ArchitecturePlaceholder title="Reset Password Screen" />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<ArchitecturePlaceholder title="Verify Email Screen" />} />
        </Route>
      </Route>

      {/* Authenticated Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path={ROUTES.APP} element={<ArchitecturePlaceholder title="Dashboard Overview" />} />
          <Route path={ROUTES.PROJECTS} element={<ArchitecturePlaceholder title="Projects List" />} />
          <Route path={ROUTES.PROJECT_NEW} element={<ArchitecturePlaceholder title="Create Project Modal / Screen" />} />
          <Route path={ROUTES.PROJECT_DETAIL} element={<ArchitecturePlaceholder title="Project Detail Overview" />} />
          <Route path={ROUTES.PROJECT_TASKS} element={<ArchitecturePlaceholder title="Project Tasks & Kanban Board" />} />
          <Route path={ROUTES.TASK_DETAIL} element={<ArchitecturePlaceholder title="Task Detail Drawer / View" />} />
          <Route path={ROUTES.PROJECT_NOTES} element={<ArchitecturePlaceholder title="Project Notes List" />} />
          <Route path={ROUTES.NOTE_DETAIL} element={<ArchitecturePlaceholder title="Note Detail & Editor View" />} />
          <Route path={ROUTES.PROJECT_MEMBERS} element={<ArchitecturePlaceholder title="Project Member Management" />} />
          <Route path={ROUTES.ACCOUNT} element={<ArchitecturePlaceholder title="Account & Security Settings" />} />

          {/* Admin Protected Route */}
          <Route element={<ProtectedRoute requiredRole={ROLES.ADMIN} />}>
            <Route path={ROUTES.PROJECT_SETTINGS} element={<ArchitecturePlaceholder title="Project Admin Settings" />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Error Screens */}
      <Route
        path={ROUTES.FORBIDDEN}
        element={
          <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <h1 className="text-4xl font-bold text-destructive">403</h1>
            <p className="text-muted-foreground mt-2">Access Denied. You do not have permission to view this resource.</p>
          </div>
        }
      />
      <Route
        path="*"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <h1 className="text-4xl font-bold text-primary">404</h1>
            <p className="text-muted-foreground mt-2">Page Not Found.</p>
          </div>
        }
      />
    </Routes>
  );
}
