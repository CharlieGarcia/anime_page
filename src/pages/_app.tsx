import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
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

const reducedMotionStyles = (
  <GlobalStyles
    styles={{
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important'
        }
      }
    }}
  />
);

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
            {reducedMotionStyles}
            <Component {...pageProps} />
          </ThemeProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </AppCacheProvider>
  );
}
