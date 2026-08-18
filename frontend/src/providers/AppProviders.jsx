import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary.jsx';
import { ProjectRoleProvider } from '../context/ProjectRoleContext.jsx';

export function AppProviders({ children }) {
  // Create a stable TanStack Query Client instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // Data is fresh upon fetch, re-fetches immediately on navigation/back
            refetchOnMount: 'always', // Always fetch latest data when navigating to/from pages
            refetchOnWindowFocus: true,
            gcTime: 1000 * 60 * 15,
            retry: 1,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <ProjectRoleProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
              </ProjectRoleProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
