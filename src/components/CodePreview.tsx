import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const CodePreview: React.FC = () => {
  const terraformCode = useSelector((state: RootState) => state.architecture.terraformCode);

  return (
    <Box sx={{ height: '100vh', width: '30%', bgcolor: '#1e1e1e', color: 'white', p: 2, overflow: 'auto' }}>
      <Typography variant="h6">Terraform Code (main.tf)</Typography>
      <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{terraformCode}</pre>
    </Box>
  );
};

export default CodePreview;