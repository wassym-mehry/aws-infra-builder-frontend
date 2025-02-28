// src/components/TerraformEditor.tsx
import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Switch, FormControlLabel, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { updateTerraformCode } from '../redux/slices/architectureSlice';

const TerraformEditor: React.FC = () => {
  const dispatch = useDispatch();
  const terraformCode = useSelector((state: RootState) => state.architecture.terraformCode);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (isEditMode && value !== undefined) {
        dispatch(updateTerraformCode(value));
      }
    },
    [isEditMode, dispatch]
  );

  const handleEditModeToggle = () => {
    setIsEditMode((prev) => !prev);
  };

  return (
    <Box sx={{ width: '50%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#1e1e1e', color: 'white' }}>
        <Typography variant="h6">Terraform Code (main.tf)</Typography>
        <FormControlLabel
          control={<Switch checked={isEditMode} onChange={handleEditModeToggle} />}
          label="Edit Mode"
          sx={{ color: 'white' }}
        />
      </Box>
      <Editor
        height="100%"
        language="hcl" // Terraform uses HCL syntax
        theme="vs-dark"
        value={terraformCode}
        onChange={handleEditorChange}
        options={{
          readOnly: !isEditMode,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </Box>
  );
};

export default TerraformEditor;