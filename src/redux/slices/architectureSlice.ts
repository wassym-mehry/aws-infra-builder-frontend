// src/redux/slices/architectureSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge } from '@xyflow/react';
import { NodeData, VpcConfig, Ec2Config, S3BucketConfig } from '../../types';

interface ArchitectureState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  terraformCode: string;
  history: { nodes: Node<NodeData>[]; edges: Edge[] }[];
  historyIndex: number;
}

const initialState: ArchitectureState = {
  nodes: [],
  edges: [],
  terraformCode: '',
  history: [{ nodes: [], edges: [] }],
  historyIndex: 0,
};

// Utility function for deep copying
const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const architectureSlice = createSlice({
  name: 'architecture',
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<Node<NodeData>>) => {
      state.nodes.push(action.payload);
      state.terraformCode = generateTerraformCode(state.nodes, state.edges as Edge[]);
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({ nodes: deepCopy(state.nodes), edges: deepCopy(state.edges) });
      state.historyIndex += 1;
    },
    removeNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter(node => node.id !== action.payload);
      state.edges = state.edges.filter(edge => edge.source !== action.payload && edge.target !== action.payload);
      state.terraformCode = generateTerraformCode(state.nodes, state.edges as Edge[]);
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({ nodes: deepCopy(state.nodes), edges: deepCopy(state.edges) });
      state.historyIndex += 1;
    },
    updateNodes: (state, action: PayloadAction<Node<NodeData>[]>) => {
      state.nodes = action.payload;
      state.terraformCode = generateTerraformCode(state.nodes, state.edges as Edge[]);
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({ nodes: deepCopy(state.nodes), edges: deepCopy(state.edges) });
      state.historyIndex += 1;
    },
    updateEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
      state.terraformCode = generateTerraformCode(state.nodes, state.edges as Edge[]);
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({ nodes: deepCopy(state.nodes), edges: deepCopy(state.edges) });
      state.historyIndex += 1;
    },
    addResource: (state, action: PayloadAction<{ type: string; data: VpcConfig | Ec2Config | S3BucketConfig }>) => {
      const { type, data } = action.payload;
      const node: Node<NodeData> = {
        id: `${type}-${Date.now()}`,
        type: 'resource',
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data: { type, data },
      };
      state.nodes.push(node);
      state.terraformCode = generateTerraformCode(state.nodes, state.edges as Edge[]);
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({ nodes: deepCopy(state.nodes), edges: deepCopy(state.edges) });
      state.historyIndex += 1;
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1;
        const previousState = state.history[state.historyIndex];
        state.nodes = deepCopy(previousState.nodes);
        state.edges = deepCopy(previousState.edges);
        state.terraformCode = generateTerraformCode(state.nodes, state.edges as Edge[]);
      }
    },
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1;
        const nextState = state.history[state.historyIndex];
        state.nodes = deepCopy(nextState.nodes);
        state.edges = deepCopy(nextState.edges);
        state.terraformCode = generateTerraformCode(state.nodes, state.edges as Edge[]);
      }
    },
    updateTerraformCode: (state, action: PayloadAction<string>) => {
      state.terraformCode = action.payload;
      // Optionally, you can add the updated code to the history if needed
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({ nodes: deepCopy(state.nodes), edges: deepCopy(state.edges) });
      state.historyIndex += 1;
    },
  },
});

const generateTerraformCode = (nodes: Node<NodeData>[], edges: Edge[]): string => {
  let code = '';

  nodes.forEach(node => {
    const nodeData = node.data;

    if (!nodeData || typeof nodeData !== 'object' || !('type' in nodeData)) {
      return; // Safeguard against invalid node data
    }

    const type = nodeData.type;
    const data = nodeData.data;

    if (type === 'vpc') {
      const vpcData = data as VpcConfig;
      code += `resource "aws_vpc" "${vpcData.name}" {\n`;
      code += `  cidr_block = "${vpcData.cidr_block}"\n`;
      code += `  enable_dns_support = true\n`;
      code += `  enable_dns_hostnames = true\n`;
      code += `  tags = {\n`;
      code += `    Name = "${vpcData.name}"\n`;
      code += `    Environment = "${vpcData.tags?.Environment || 'production'}"\n`;
      code += `  }\n`;
      code += `}\n\n`;
    } else if (type === 'ec2') {
      const ec2Data = data as Ec2Config;
      const vpcNode = nodes.find(n => n.data.type === 'vpc' && edges.some(e => e.target === n.id && e.source === node.id));
      const vpcName = vpcNode ? (vpcNode.data.data as VpcConfig).name : 'default-vpc';
      code += `resource "aws_instance" "${vpcName}_ec2_${node.id}" {\n`;
      code += `  ami = "${ec2Data.ami}"\n`;
      code += `  instance_type = "${ec2Data.instance_type}"\n`;
      code += `  subnet_id = "aws_subnet.${ec2Data.subnet_id}.id"\n`;
      code += `  vpc_security_group_ids = ${JSON.stringify(ec2Data.security_group_ids || [])}\n`;
      code += `  tags = {\n`;
      code += `    Name = "${vpcName}-ec2-${node.id}"\n`;
      code += `    Environment = "${ec2Data.tags?.Environment || 'production'}"\n`;
      code += `  }\n`;
      code += `}\n\n`;
    } else if (type === 's3') {
      const s3Data = data as S3BucketConfig;
      code += `resource "aws_s3_bucket" "${s3Data.bucket_name}" {\n`;
      code += `  bucket = "${s3Data.bucket_name}"\n`;
      code += `  versioning {\n`;
      code += `    enabled = ${s3Data.versioning_enabled || false}\n`;
      code += `  }\n`;
      code += `  tags = {\n`;
      code += `    Name = "${s3Data.bucket_name}"\n`;
      code += `    Environment = "${s3Data.tags?.Environment || 'production'}"\n`;
      code += `  }\n`;
      code += `}\n\n`;
    }
  });

  return code;
};

export const { addNode, removeNode, updateNodes, updateEdges, addResource, undo, redo, updateTerraformCode } = architectureSlice.actions;
export default architectureSlice.reducer;