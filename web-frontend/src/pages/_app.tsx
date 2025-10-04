import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

import { store } from '@/store';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import theme from '@/styles/theme';
import createEmotionCache from '@/utils/createEmotionCache';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/globals.css';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create persistor for Redux Persist
const persistor = persistStore(store);

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

// Component to handle route protection
function AppContent({ Component, pageProps }: { Component: any; pageProps: any }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Routes that don't require authentication
  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  // Show loading during SSR
  if (!isClient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando...</Typography>
      </Box>
    );
  }

  // If it's a public route, render without protection
  if (isPublicRoute) {
    return <Component {...pageProps} />;
  }

  // For protected routes, wrap with ProtectedRoute
  return (
    <ProtectedRoute>
      <Component {...pageProps} />
    </ProtectedRoute>
  );
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <CssBaseline />
              <AppContent Component={Component} pageProps={pageProps} />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4caf50',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#f44336',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <ReactQueryDevtools initialIsOpen={false} />
            </ThemeProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </CacheProvider>
  );
}
