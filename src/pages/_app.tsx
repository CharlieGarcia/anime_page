import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, PaletteMode } from '@mui/material';
import ColorModeContext from '../context/theme';

export default function App({
  Component,
  pageProps
}: {
  Component: React.ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps: any;
}) {
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
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
