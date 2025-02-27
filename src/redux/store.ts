import { configureStore } from '@reduxjs/toolkit';
import architectureReducer from './slices/architectureSlice';
import uiReducer from './slices/uiSlice';
import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../types';

export const store = configureStore({
  reducer: {
    architecture: architectureReducer,
    ui: uiReducer,
  },
});

export type RootState = {
  architecture: {
    nodes: Node<NodeData>[];
    edges: Edge[];
    terraformCode: string;
  };
  ui: {
    isDialogOpen: boolean;
    selectedResourceType: string | null;
  };
};
export type AppDispatch = typeof store.dispatch;