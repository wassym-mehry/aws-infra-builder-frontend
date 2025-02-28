// src/components/TerraformEditor.tsx
import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Switch, FormControlLabel, Typography, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { updateTerraformCode } from '../redux/slices/architectureSlice';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface TerraformEditorProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const TerraformEditor: React.FC<TerraformEditorProps> = ({ isCollapsed, toggleCollapse }) => {
  const dispatch = useDispatch();
  const terraformCode = useSelector((state: RootState) => state.architecture.terraformCode);
  const [isEditMode, setIsEditMode] = useState(false);
  const [shouldMountEditor, setShouldMountEditor] = useState(!isCollapsed);

  // Delay mounting the editor when expanding to avoid resize issues
  useEffect(() => {
    if (!isCollapsed) {
      const timer = setTimeout(() => {
        setShouldMountEditor(true);
      }, 100); // Delay mounting by 100ms to ensure container size is stable
      return () => clearTimeout(timer);
    } else {
      setShouldMountEditor(false); // Immediately unmount when collapsing
    }
  }, [isCollapsed]);

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
    <Box
      sx={{
        width: isCollapsed ? '40px' : '50%', // Collapse to a small width
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          bgcolor: '#1e1e1e',
          color: 'white',
        }}
      >
        {!isCollapsed && (
          <>
            <Typography variant="h6">Terraform Code (main.tf)</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={<Switch checked={isEditMode} onChange={handleEditModeToggle} />}
                label="Edit Mode"
                sx={{ color: 'white', mr: 1 }}
              />
              <IconButton onClick={toggleCollapse} sx={{ color: 'white' }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </>
        )}
        {isCollapsed && (
          <IconButton onClick={toggleCollapse} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      {shouldMountEditor && (
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
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
      )}
    </Box>
  );
};

export default TerraformEditor;