import React from 'react';
import { Container, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { theme } from './styles/theme';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import CodePreview from './components/CodePreview';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} sx={{ display: 'flex', height: '100vh', padding: 0 }}>
        <Sidebar />
        <FlowCanvas />
        <CodePreview />
      </Container>
    </ThemeProvider>
  );
};

export default App;