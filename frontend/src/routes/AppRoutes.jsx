import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { AppShell } from '../layouts/AppShell.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { ProjectRoleRoute } from './ProjectRoleRoute.jsx';
import { PublicRoute } from './PublicRoute.jsx';
import { ROLES } from '../constants/roles.js';
import { FullPageSpinner } from '../components/feedback/FullPageSpinner.jsx';

// Lazy loaded page components for optimal bundle splitting
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx').then((m) => ({ default: m.LoginPage || m.default })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage.jsx').then((m) => ({ default: m.RegisterPage || m.default })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage.jsx').then((m) => ({ default: m.ForgotPasswordPage || m.default })));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage.jsx').then((m) => ({ default: m.ResetPasswordPage || m.default })));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage.jsx').then((m) => ({ default: m.VerifyEmailPage || m.default })));

const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage.jsx'));
const ProjectsListPage = lazy(() => import('../pages/projects/ProjectsListPage.jsx'));
const ProjectDetailPage = lazy(() => import('../pages/projects/ProjectDetailPage.jsx'));
const ProjectMembersPage = lazy(() => import('../pages/projects/ProjectMembersPage.jsx'));
const ProjectSettingsPage = lazy(() => import('../pages/projects/ProjectSettingsPage.jsx'));
const TasksPage = lazy(() => import('../pages/tasks/TasksPage.jsx'));
const NotesPage = lazy(() => import('../pages/notes/NotesPage.jsx'));
const AccountPage = lazy(() => import('../pages/account/AccountPage.jsx'));

export function AppRoutes() {
  return (
    <Suspense fallback={<FullPageSpinner message="Loading view..." />}>
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
            <Route path={ROUTES.PROJECT_NOTES} element={<NotesPage />} />
            <Route path={ROUTES.NOTE_DETAIL} element={<NotesPage />} />
            <Route path={ROUTES.PROJECT_MEMBERS} element={<ProjectMembersPage />} />
            <Route path={ROUTES.ACCOUNT} element={<AccountPage />} />

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
    </Suspense>
  );
}
