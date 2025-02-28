// src/components/FlowCanvas.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  addEdge,
  NodeChange,
  OnConnect,
  useNodesState,
  useEdgesState,
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Background,
  useReactFlow,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ResourceNode from './ResourceNode';
import Toolbar from './Toolbar';
import { useDispatch, useSelector } from 'react-redux';
import { addNode, updateNodes, updateEdges, undo, redo } from '../redux/slices/architectureSlice';
import { RootState, NodeData, VpcConfig, Ec2Config, S3BucketConfig } from '../redux/store';
import { Box, Typography } from '@mui/material';
import { deepEqual } from '../utils/deepEqual';

const nodeTypes = {
  resource: ResourceNode,
};

// Inner component that uses useReactFlow
const FlowCanvasInner: React.FC = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(
    (state: RootState) => state.architecture.nodes,
    (prev, next) => deepEqual(prev, next) // Deep comparison for nodes
  );
  const edges = useSelector(
    (state: RootState) => state.architecture.edges,
    (prev, next) => deepEqual(prev, next) // Deep comparison for edges
  );
  const historyIndex = useSelector((state: RootState) => state.architecture.historyIndex);
  const historyLength = useSelector((state: RootState) => state.architecture.history.length);
  const [rfNodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(nodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(edges);
  const { screenToFlowPosition, getViewport, setViewport, setNodes: setReactFlowNodes, setEdges: setReactFlowEdges } = useReactFlow();
  const [mode, setMode] = useState<'select' | 'move'>('move'); // Default to move mode

  // Custom zoom in/out
  const zoomIn = useCallback(() => {
    const { x, y, zoom } = getViewport();
    setViewport({ x, y, zoom: zoom + 0.1 });
  }, [getViewport, setViewport]);

  const zoomOut = useCallback(() => {
    const { x, y, zoom } = getViewport();
    setViewport({ x, y, zoom: Math.max(0.1, zoom - 0.1) }); // Prevent zooming out too far
  }, [getViewport, setViewport]);

  // Sync React Flow state with Redux state after rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Syncing rfNodes with Redux nodes:', nodes);
      setReactFlowNodes(nodes);
      console.log('Syncing rfEdges with Redux edges:', edges);
      setReactFlowEdges(edges);
    }, 0);
    return () => clearTimeout(timer);
  }, [nodes, edges, setReactFlowNodes, setReactFlowEdges]);

  // Update nodes' draggable property based on mode
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        draggable: mode === 'move', // Set draggable based on mode
      }))
    );
  }, [mode, setNodes]);

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

  // Handle node click for multi-selection in Select Mode
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    console.log('Node clicked:', node.id, 'Mode:', mode);
    if (mode !== 'select') return;

    // Check if Ctrl key is pressed for multi-selection
    const isMultiSelect = event.ctrlKey || event.metaKey; // metaKey for Mac Cmd key

    setNodes((currentNodes) => {
      const updatedNodes = currentNodes.map((n) => {
        if (n.id === node.id) {
          // Toggle selection for the clicked node
          return { ...n, selected: isMultiSelect ? !n.selected : true };
        }
        // If not holding Ctrl, deselect all other nodes; otherwise, keep their state
        return { ...n, selected: isMultiSelect ? n.selected : false };
      });
      return updatedNodes;
    });
  }, [mode, setNodes]);

  // Handle canvas click to deselect all nodes in Select Mode
  const onPaneClick = useCallback(() => {
    if (mode !== 'select') return;
    setNodes((currentNodes) => {
      return currentNodes.map((n) => ({ ...n, selected: false }));
    });
  }, [mode, setNodes]);

  // Calculate the number of selected nodes
  const selectedNodesCount = rfNodes.filter((node) => node.selected).length;

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
        draggable: mode === 'move', // Set draggable based on mode
        selected: false, // Initialize as not selected
      };

      dispatch(addNode(newNode));
    },
    [screenToFlowPosition, dispatch, mode]
  );

  // Handle Undo
  const handleUndo = useCallback(() => {
    console.log('Handling undo');
    dispatch(undo());
  }, [dispatch]);

  // Handle Redo
  const handleRedo = useCallback(() => {
    console.log('Handling redo');
    dispatch(redo());
  }, [dispatch]);

  return (
    <div style={{ height: '100vh', width: '50%', position: 'relative' }} onDragOver={onDragOver} onDrop={onDrop}>
      <Toolbar
        mode={mode}
        setMode={setMode}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        undo={handleUndo}
        redo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyLength - 1}
      />
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={mode === 'move'} // Enable dragging in move mode
        nodesConnectable={mode === 'select'} // Enable connecting in select mode
        nodesFocusable={false} // Disable React Flow's default selection
        className={mode === 'select' ? 'select-mode' : 'move-mode'} // Add class for cursor styling
      >
        <MiniMap />
        <Background />
      </ReactFlow>
      {mode === 'select' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            zIndex: 1000,
          }}
        >
          <Typography variant="body2">Selected nodes: {selectedNodesCount}</Typography>
        </Box>
      )}
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