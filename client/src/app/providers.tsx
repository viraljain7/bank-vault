import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ClerkProvider } from '@clerk/clerk-react';
import { theme } from './theme';
import { ErrorBoundary } from './ErrorBoundary';
import { ToastProvider } from '../contexts/ToastContext';
import { VaultProvider } from '../contexts/VaultContext';
import '../index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Provider composition. Order matters: Clerk first, then the vault which
 * depends on the Clerk session, then the router/pages.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider>
              <VaultProvider>
                <BrowserRouter>{children}</BrowserRouter>
              </VaultProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}