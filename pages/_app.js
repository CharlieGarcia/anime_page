import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material';
import ColorModeContext from '../context/theme';

export default function App({ Component, pageProps }) {
  const [mode, setMode] = React.useState('light');

  // Initialize theme from localStorage or system preference
  React.useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : false;

    if (savedTheme) {
      setMode(savedTheme);
    } else if (prefersDark) {
      setMode('dark');
    }
  }, []);

  // Update the colorMode to save to localStorage
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newMode);
          }
          return newMode;
        });
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark' && {
            background: {
              default: '#121212',
              paper: '#1E1E1E',
            },
          }),
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
