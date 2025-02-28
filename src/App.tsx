// src/App.tsx
import React from 'react';
import { Box } from '@mui/material';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import TerraformEditor from './components/TerraformEditor';

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <FlowCanvas />
      <TerraformEditor />
    </Box>
  );
};

export default App;