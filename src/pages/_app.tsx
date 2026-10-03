import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, PaletteMode } from '@mui/material';
import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query';
import ColorModeContext from '../context/theme';
import { makeQueryClient } from '../helpers/queryClient';

export default function App({
  Component,
  pageProps
}: {
  Component: React.ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps: any;
}) {
  const [queryClient] = React.useState(makeQueryClient);
  const [mode, setMode] = React.useState('light');

  // Initialize theme from localStorage or system preference
  React.useEffect(() => {
    const savedTheme =
      typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;

    if (savedTheme) {
      setMode(savedTheme);
    } else if (prefersDark) {
      setMode('dark');
    }
  }, []);

  // Update the colorMode to save to localStorage
  const colorMode = {
    toggleColorMode: () => {
      setMode((prevMode) => {
        const newMode = prevMode === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', newMode);
        }
        return newMode;
      });
    }
  };

  const theme = createTheme({
    palette: {
      mode: mode as PaletteMode,
      ...(mode === 'dark' && {
        background: {
          default: '#121212',
          paper: '#1E1E1E'
        }
      })
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
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
        </ColorModeContext.Provider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
