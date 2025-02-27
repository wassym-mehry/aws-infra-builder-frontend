import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isDialogOpen: boolean;
  selectedResourceType: string | null;
}

const initialState: UiState = {
  isDialogOpen: false,
  selectedResourceType: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<string>) => {
      state.isDialogOpen = true;
      state.selectedResourceType = action.payload;
    },
    closeDialog: (state) => {
      state.isDialogOpen = false;
      state.selectedResourceType = null;
    },
  },
});

export const { openDialog, closeDialog } = uiSlice.actions;
export default uiSlice.reducer;