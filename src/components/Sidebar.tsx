// src/components/Sidebar.tsx
import React from 'react';
import { Box, Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addResource } from '../redux/slices/architectureSlice';
import { VpcConfig, Ec2Config, S3BucketConfig } from '../types';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, resourceType: string) => {
    event.dataTransfer.setData('application/reactflow', resourceType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">AWS Resources</Typography>
        <List>
          <ListItem disablePadding>
            <ListItemText
              primary="VPC"
              sx={{
                p: 1,
                border: '1px solid #ccc',
                borderRadius: 1,
                m: 0.5,
                bgcolor: 'white',
                cursor: 'move',
                '&:hover': { bgcolor: '#f0f0f0' },
              }}
              onDragStart={(event) => onDragStart(event, 'vpc')}
              draggable
            />
          </ListItem>

          <ListItem disablePadding>
            <ListItemText
              primary="EC2"
              sx={{
                p: 1,
                border: '1px solid #ccc',
                borderRadius: 1,
                m: 0.5,
                bgcolor: 'white',
                cursor: 'move',
                '&:hover': { bgcolor: '#f0f0f0' },
              }}
              onDragStart={(event) => onDragStart(event, 'ec2')}
              draggable
            />
          </ListItem>

          <ListItem disablePadding>
            <ListItemText
              primary="S3 Bucket"
              sx={{
                p: 1,
                border: '1px solid #ccc',
                borderRadius: 1,
                m: 0.5,
                bgcolor: 'white',
                cursor: 'move',
                '&:hover': { bgcolor: '#f0f0f0' },
              }}
              onDragStart={(event) => onDragStart(event, 's3')}
              draggable
            />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;