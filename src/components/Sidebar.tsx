import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addResource } from '../redux/slices/architectureSlice';
import { VpcConfig, Ec2Config, S3BucketConfig } from '../types';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();

  const addVPC = () => {
    const vpc: VpcConfig = {
      name: `vpc-${Date.now()}`,
      cidr_block: '10.0.0.0/16',
      tags: { Name: `vpc-${Date.now()}`, Environment: 'production' },
    };
    dispatch(addResource({ type: 'vpc', data: vpc }));
  };

  const addEC2 = () => {
    const ec2: Ec2Config = {
      instance_type: 't2.micro',
      ami: 'ami-0c55b159cbfafe1f0',
      subnet_id: 'test-subnet',
      security_group_ids: ['sg-12345678'],
      tags: { Name: `ec2-${Date.now()}`, Environment: 'production' },
    };
    dispatch(addResource({ type: 'ec2', data: ec2 }));
  };

  const addS3 = () => {
    const s3: S3BucketConfig = {
      bucket_name: `my-bucket-${Date.now()}`,
      versioning_enabled: true,
      tags: { Name: `my-bucket-${Date.now()}`, Environment: 'production' },
    };
    dispatch(addResource({ type: 's3', data: s3 }));
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
            <ListItemButton onClick={addVPC}>
              <ListItemText primary="Add VPC" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={addEC2}>
              <ListItemText primary="Add EC2" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={addS3}>
              <ListItemText primary="Add S3 Bucket" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;