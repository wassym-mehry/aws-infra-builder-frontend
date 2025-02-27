import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addResource } from '../redux/slices/architectureSlice';
import { VpcConfig, Ec2Config, S3BucketConfig } from '../types';

interface ResourceFormData {
  type: 'vpc' | 'ec2' | 's3';
  vpc?: Partial<VpcConfig>;
  ec2?: Partial<Ec2Config>;
  s3?: Partial<S3BucketConfig>;
}

interface AddResourceDialogProps {
  open: boolean;
  onClose: () => void;
  resourceType: 'vpc' | 'ec2' | 's3';
}

const AddResourceDialog: React.FC<AddResourceDialogProps> = ({ open, onClose, resourceType }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<ResourceFormData>({
    type: resourceType,
    [resourceType]: {},
  } as ResourceFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [resourceType]: { ...prev[resourceType], [name]: value },
    }));
  };

  const handleSubmit = () => {
    let resource: VpcConfig | Ec2Config | S3BucketConfig;
    switch (resourceType) {
      case 'vpc':
        resource = {
          name: `vpc-${Date.now()}`,
          cidr_block: (formData.vpc?.cidr_block as string) || '10.0.0.0/16',
          tags: { Name: `vpc-${Date.now()}`, Environment: 'production' },
        };
        break;
      case 'ec2':
        resource = {
          instance_type: (formData.ec2?.instance_type as string) || 't2.micro',
          ami: (formData.ec2?.ami as string) || 'ami-0c55b159cbfafe1f0',
          subnet_id: (formData.ec2?.subnet_id as string) || 'test-subnet',
          security_group_ids: ['sg-12345678'],
          tags: { Name: `ec2-${Date.now()}`, Environment: 'production' },
        };
        break;
      case 's3':
        resource = {
          bucket_name: `my-bucket-${Date.now()}`,
          versioning_enabled: true,
          tags: { Name: `my-bucket-${Date.now()}`, Environment: 'production' },
        };
        break;
      default:
        return;
    }
    dispatch(addResource({ type: resourceType, data: resource }));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add {resourceType.toUpperCase()}</DialogTitle>
      <DialogContent>
        {resourceType === 'vpc' && (
          <TextField
            autoFocus
            margin="dense"
            name="cidr_block"
            label="CIDR Block"
            type="text"
            fullWidth
            value={(formData.vpc?.cidr_block as string) || ''}
            onChange={handleChange}
          />
        )}
        {resourceType === 'ec2' && (
          <>
            <TextField
              margin="dense"
              name="instance_type"
              label="Instance Type"
              type="text"
              fullWidth
              value={(formData.ec2?.instance_type as string) || ''}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="ami"
              label="AMI"
              type="text"
              fullWidth
              value={(formData.ec2?.ami as string) || ''}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="subnet_id"
              label="Subnet ID"
              type="text"
              fullWidth
              value={(formData.ec2?.subnet_id as string) || ''}
              onChange={handleChange}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddResourceDialog;