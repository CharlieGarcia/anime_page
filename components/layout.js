import React from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { Container } from '@mui/material';

export const Layout = ({ children }) => {
  return (
    <Container maxWidth="lg">
      <Header />
      <Container component="main">{children}</Container>
      <Footer />
    </Container>
  );
};
