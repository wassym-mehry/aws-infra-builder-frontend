import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { removeNode } from '../redux/slices/architectureSlice';
import { VpcConfig, Ec2Config, S3BucketConfig } from '../types';

interface NodeData {
  type: string;
  data: VpcConfig | Ec2Config | S3BucketConfig;
}

interface ResourceNodeProps {
  data: NodeData;
}

const ResourceNode: React.FC<ResourceNodeProps> = ({ data }) => {
  const dispatch = useDispatch();
  const { type, data: resourceData } = data;

  const handleDelete = () => {
    dispatch(removeNode(type + '-' + data));
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'white', border: '1px solid #ccc', borderRadius: 1 }}>
      <Typography variant="h6">{type}</Typography>
      <Typography>{JSON.stringify(resourceData).substring(0, 50)}</Typography>
      <IconButton onClick={handleDelete} aria-label="delete" size="small">
        <DeleteIcon />
      </IconButton>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </Box>
  );
};

export default ResourceNode;