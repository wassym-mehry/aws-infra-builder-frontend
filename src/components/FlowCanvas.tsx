import React, { useCallback, useEffect } from 'react';
import {
  addEdge,
  Node,
  Edge,
  OnConnect,
  useNodesState,
  useEdgesState,
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ResourceNode from './ResourceNode';
import { useDispatch, useSelector } from 'react-redux';
import { addNode, updateNodes, updateEdges } from '../redux/slices/architectureSlice';
import { NodeData, VpcConfig, Ec2Config, S3BucketConfig } from '../types';
import { RootState } from '../redux/store';

const nodeTypes = {
  resource: ResourceNode,
};

const FlowCanvas: React.FC = () => {
  const dispatch = useDispatch();
  const nodes = useSelector((state: RootState) => state.architecture.nodes);
  const edges = useSelector((state: RootState) => state.architecture.edges);
  const [rfNodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(nodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Sync Redux state with React Flow state
  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  const onConnect: OnConnect = useCallback((params) => {
    setEdges((eds) => {
      const newEdges = addEdge({ ...params, id: crypto.randomUUID() }, eds);
      dispatch(updateEdges(newEdges));
      return newEdges;
    });
  }, [setEdges, dispatch]);

  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node<NodeData>) => {
    dispatch(updateNodes(rfNodes.map(n => n.id === node.id ? node : n)));
  }, [dispatch, rfNodes]);

  const addResource = (type: string, data: VpcConfig | Ec2Config | S3BucketConfig) => {
    const newNode: Node<NodeData> = {
      id: `${type}-${Date.now()}`,
      type: 'resource',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { type, data },
    };
    dispatch(addNode(newNode));
  };

  return (
    <ReactFlowProvider>
      <div style={{ height: '100vh', width: '50%' }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
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
    </ReactFlowProvider>
  );
};

export default FlowCanvas;