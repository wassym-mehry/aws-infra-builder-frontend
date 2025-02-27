// src/types/index.ts
export interface VpcConfig {
  name: string;
  cidr_block: string;
  tags?: { [key: string]: string };
}

export interface Ec2Config {
  instance_type: string;
  ami: string;
  subnet_id: string;
  security_group_ids?: string[];
  iam_instance_profile?: string;
  key_name?: string;
  ebs_block_devices?: {
    device_name: string;
    volume_size: number;
    volume_type: string;
  }[];
  tags?: { [key: string]: string };
}

export interface S3BucketConfig {
  bucket_name: string;
  versioning_enabled?: boolean;
  force_destroy?: boolean;
  acl?: string;
  policy?: string;
  tags?: { [key: string]: string };
}

// Define NodeData with an index signature to satisfy Record<string, unknown>
export interface NodeData {
  type: string;
  data: VpcConfig | Ec2Config | S3BucketConfig;
  [key: string]: any; // Index signature to allow arbitrary properties
}