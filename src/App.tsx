// src/App.tsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import TerraformEditor from './components/TerraformEditor';

const App: React.FC = () => {
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);

  const toggleEditorCollapse = () => {
    setIsEditorCollapsed((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box
        sx={{
          flex: isEditorCollapsed ? 1 : '0 1 50%', // Expand to fill space when editor is collapsed
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <FlowCanvas />
      </Box>
      <TerraformEditor isCollapsed={isEditorCollapsed} toggleCollapse={toggleEditorCollapse} />
    </Box>
  );
};

export default App;