import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { AppShell } from '../layouts/AppShell.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { ProjectRoleRoute } from './ProjectRoleRoute.jsx';
import { PublicRoute } from './PublicRoute.jsx';
import { ROLES } from '../constants/roles.js';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.jsx';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import ProjectsListPage from '../pages/projects/ProjectsListPage.jsx';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage.jsx';
import ProjectMembersPage from '../pages/projects/ProjectMembersPage.jsx';
import ProjectSettingsPage from '../pages/projects/ProjectSettingsPage.jsx';
import TasksPage from '../pages/tasks/TasksPage.jsx';

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
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        </Route>
      </Route>

      {/* Authenticated Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path={ROUTES.APP} element={<DashboardPage />} />
          <Route path={ROUTES.PROJECTS} element={<ProjectsListPage />} />
          <Route path={ROUTES.PROJECT_NEW} element={<ProjectsListPage />} />
          <Route path={ROUTES.PROJECT_DETAIL} element={<ProjectDetailPage />} />
          <Route path={ROUTES.PROJECT_TASKS} element={<TasksPage />} />
          <Route path={ROUTES.TASK_DETAIL} element={<TasksPage />} />
          <Route path={ROUTES.PROJECT_NOTES} element={<ArchitecturePlaceholder title="Project Notes List" />} />
          <Route path={ROUTES.NOTE_DETAIL} element={<ArchitecturePlaceholder title="Note Detail & Editor View" />} />
          <Route path={ROUTES.PROJECT_MEMBERS} element={<ProjectMembersPage />} />
          <Route path={ROUTES.ACCOUNT} element={<ArchitecturePlaceholder title="Account & Security Settings" />} />

          {/* Admin Protected Route */}
          <Route element={<ProjectRoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path={ROUTES.PROJECT_SETTINGS} element={<ProjectSettingsPage />} />
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
