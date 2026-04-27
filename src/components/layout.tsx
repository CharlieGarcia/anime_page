import React from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { Container } from '@mui/material';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Container maxWidth="lg">
      <Header />
      <Container component="main">{children}</Container>
      <Footer />
    </Container>
  );
};
