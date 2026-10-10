import React from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { Box, Container } from '@mui/material';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          zIndex: 999
        }}
        tabIndex={0}>
        Skip to content
      </Box>
      <Container maxWidth="lg">
        <Header />
        <Container component="main" id="main-content" tabIndex={-1}>
          {children}
        </Container>
        <Footer />
      </Container>
    </>
  );
};
