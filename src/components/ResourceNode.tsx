// src/components/ResourceNode.tsx
import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { removeNode } from '../redux/slices/architectureSlice';
import { NodeData } from '../types';

interface ResourceNodeProps extends NodeProps<Node<NodeData>> {
  // Correctly extend NodeProps with Node<NodeData>
}

const ResourceNode: React.FC<ResourceNodeProps> = ({ data, id }) => {
  const dispatch = useDispatch();
  const type = data.type; // Access type from NodeData

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent React Flow from intercepting the click
    dispatch(removeNode(id));
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'white', border: '1px solid #ccc', borderRadius: 1 }}>
      <Typography variant="h6">{type}</Typography>
      <IconButton onClick={handleDelete} aria-label="delete" size="small">
        <DeleteIcon />
      </IconButton>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </Box>
  );
};

export default ResourceNode;