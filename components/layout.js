import React, { useContext } from 'react';
import { ThemeContext, ThemeProvider } from '../contexts/themeContext';
import { Header } from './header';
import { Footer } from './footer';
import { Container } from '@mui/material';

const Inner = ({ children }) => {
  const { darkTheme } = useContext(ThemeContext);

  return (
    <div data-theme={darkTheme ? 'dark' : 'light'}>
      <Container maxWidth="lg">
        <Header />
        <Container component="main">{children}</Container>
        <Footer />
      </Container>
    </div>
  );
};

export const Layout = (props) => {
  return (
    <ThemeProvider>
      <Inner {...props} />
    </ThemeProvider>
  );
};
