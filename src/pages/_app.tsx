import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material';
import { AppCacheProvider } from '@mui/material-nextjs/v16-pagesRouter';
import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '../helpers/queryClient';
import { MODE_STORAGE_KEY } from '../constants';

// The colour scheme is applied through CSS variables and a class on <html>, which
// InitColorSchemeScript (see _document.tsx) sets before the first paint.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: true,
    dark: {
      palette: {
        background: {
          default: '#121212',
          paper: '#1E1E1E'
        }
      }
    }
  }
});

export default function App(props: {
  Component: React.ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps: any;
}) {
  const { Component, pageProps } = props;
  const [queryClient] = React.useState(makeQueryClient);

  return (
    <AppCacheProvider {...props}>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <ThemeProvider
            theme={theme}
            defaultMode="system"
            modeStorageKey={MODE_STORAGE_KEY}>
            <CssBaseline />
            <style global jsx>{`
              @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                  animation-duration: 0.01ms !important;
                  animation-iteration-count: 1 !important;
                  transition-duration: 0.01ms !important;
                  scroll-behavior: auto !important;
                }
              }
            `}</style>
            <Component {...pageProps} />
          </ThemeProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </AppCacheProvider>
  );
}
