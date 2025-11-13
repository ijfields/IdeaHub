import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { queryClient } from './lib/query-client';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/toaster';
import { AppRouter } from './router';
import { PasswordGate } from './components/PasswordGate';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem',
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// App component wrapper to ensure proper initialization
function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <PasswordGate>
        <Suspense fallback={<LoadingFallback />}>
          <ThemeProvider>
            <AuthProvider>
              <AppRouter />
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
      </PasswordGate>
    </QueryClientProvider>
  );
}

// Wrap everything in error handling
try {
  // Ensure QueryClient is initialized
  if (!queryClient) {
    throw new Error('QueryClient failed to initialize');
  }

  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <AppWrapper />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  
  rootElement.innerHTML = `
    <div style="padding: 2rem; font-family: sans-serif; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
      <p style="margin-bottom: 1rem;">Failed to initialize the application.</p>
      <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow: auto; margin-bottom: 1rem;">${errorMessage}</pre>
      ${errorStack ? `<details style="margin-bottom: 1rem;"><summary style="cursor: pointer; color: #6b7280;">Stack Trace</summary><pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow: auto; margin-top: 0.5rem;">${errorStack}</pre></details>` : ''}
      <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">Reload Page</button>
    </div>
  `;
}
