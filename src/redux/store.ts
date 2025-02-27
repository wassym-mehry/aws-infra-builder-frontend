// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import architectureReducer from './slices/architectureSlice';
import uiReducer from './slices/uiSlice';
import { Edge } from '@xyflow/react';
import { NodeData } from '../types';

type CustomNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  draggable?: boolean;
  [key: string]: any;
};

export const store = configureStore({
  reducer: {
    architecture: architectureReducer,
    ui: uiReducer,
  },
});

export type RootState = {
  architecture: {
    nodes: CustomNode[];
    edges: Edge[];
    terraformCode: string;
  };
  ui: {
    isDialogOpen: boolean;
    selectedResourceType: string | null;
  };
};
export type AppDispatch = typeof store.dispatch;