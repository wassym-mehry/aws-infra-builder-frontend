// src/components/FlowCanvas.tsx
import React, { useCallback, useEffect } from 'react';
import {
  addEdge,
  NodeChange,
  OnConnect,
  useNodesState,
  useEdgesState,
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  useReactFlow,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ResourceNode from './ResourceNode';
import { useDispatch, useSelector } from 'react-redux';
import { addNode, updateNodes, updateEdges, removeNode } from '../redux/slices/architectureSlice';
import { RootState } from '../redux/store';
import { NodeData , VpcConfig, Ec2Config, S3BucketConfig } from '../types';

const nodeTypes = {
  resource: ResourceNode,
};

// Inner component that uses useReactFlow
const FlowCanvasInner: React.FC = () => {
  const dispatch = useDispatch();
  const nodes = useSelector((state: RootState) => state.architecture.nodes);
  const edges = useSelector((state: RootState) => state.architecture.edges);
  const [rfNodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(nodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(edges);
  const { screenToFlowPosition } = useReactFlow();

  // Sync initial Redux state with React Flow state
  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  // Update Redux state when nodes are dragged (onNodesChange)
  const handleNodesChange = useCallback((changes: NodeChange<Node<NodeData>>[]) => {
    onNodesChange(changes);
    setNodes((currentNodes) => {
      dispatch(updateNodes(currentNodes));
      return currentNodes;
    });
  }, [onNodesChange, dispatch]);

  // Update Redux state when dragging stops (onNodeDragStop)
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node<NodeData>) => {
    dispatch(updateNodes(rfNodes.map(n => n.id === node.id ? node : n)));
  }, [dispatch, rfNodes]);

  const onConnect: OnConnect = useCallback((params) => {
    setEdges((eds) => {
      const newEdges = addEdge({ ...params, id: crypto.randomUUID() }, eds);
      dispatch(updateEdges(newEdges));
      return newEdges;
    });
  }, [setEdges, dispatch]);

  // Handle drag over to allow dropping
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop event to add resource to canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const resourceType = event.dataTransfer.getData('application/reactflow');
      if (!resourceType) return;

      // Calculate the drop position on the canvas using screenToFlowPosition
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create the resource configuration based on the type
      let data: VpcConfig | Ec2Config | S3BucketConfig;
      switch (resourceType) {
        case 'vpc':
          data = {
            name: `vpc-${Date.now()}`,
            cidr_block: '10.0.0.0/16',
            tags: { Name: `vpc-${Date.now()}`, Environment: 'production' },
          };
          break;
        case 'ec2':
          data = {
            instance_type: 't2.micro',
            ami: 'ami-0c55b159cbfafe1f0',
            subnet_id: 'test-subnet',
            security_group_ids: ['sg-12345678'],
            tags: { Name: `ec2-${Date.now()}`, Environment: 'production' },
          };
          break;
        case 's3':
          data = {
            bucket_name: `my-bucket-${Date.now()}`,
            versioning_enabled: true,
            tags: { Name: `my-bucket-${Date.now()}`, Environment: 'production' },
          };
          break;
        default:
          return;
      }

      const newNode: Node<NodeData> = {
        id: `${resourceType}-${Date.now()}`,
        type: 'resource',
        position,
        data: { type: resourceType, data },
        draggable: true,
      };

      dispatch(addNode(newNode));
    },
    [screenToFlowPosition, dispatch]
  );

  return (
    <div style={{ height: '100vh', width: '50%' }} onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
};

// Outer component that wraps FlowCanvasInner with ReactFlowProvider
const FlowCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
};

export default FlowCanvas;