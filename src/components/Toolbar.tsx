// src/components/Toolbar.tsx
import React from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

interface ToolbarProps {
  mode: 'select' | 'move';
  setMode: (mode: 'select' | 'move') => void;
  zoomIn: () => void;
  zoomOut: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  setMode,
  zoomIn,
  zoomOut,
  undo,
  redo,
  canUndo,
  canRedo,
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: 1,
        borderRadius: 1,
        boxShadow: 1,
        display: 'flex',
        gap: 1,
      }}
    >
      <ButtonGroup variant="contained" aria-label="mode selection">
        <Button
          onClick={() => setMode('select')}
          variant={mode === 'select' ? 'contained' : 'outlined'}
          color={mode === 'select' ? 'primary' : 'inherit'}
        >
          Select Mode
        </Button>
        <Button
          onClick={() => setMode('move')}
          variant={mode === 'move' ? 'contained' : 'outlined'}
          color={mode === 'move' ? 'primary' : 'inherit'}
        >
          Move Mode
        </Button>
      </ButtonGroup>
      <Button onClick={zoomIn} variant="contained" color="primary">
        <ZoomInIcon />
      </Button>
      <Button onClick={zoomOut} variant="contained" color="primary">
        <ZoomOutIcon />
      </Button>
      <Button onClick={undo} variant="contained" color="secondary" disabled={!canUndo}>
        <UndoIcon />
      </Button>
      <Button onClick={redo} variant="contained" color="secondary" disabled={!canRedo}>
        <RedoIcon />
      </Button>
    </Box>
  );
};

export default Toolbar;