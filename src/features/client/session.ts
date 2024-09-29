import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../store';

// Define a type for the slice state
export interface SessionSlice {
  session: {
    userId: string;
    walletAddress: string;
  };
}

// Define the initial state using that type
export const initialState = {
  session: {},
} as SessionSlice;
export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<SessionSlice>) => {
      return {
        ...action.payload,
      };
    },
    resetSession: (state) => {
      state.session = initialState.session;
    },
  },
});

export const { setSession, resetSession } = sessionSlice.actions;

export const selectSession = (state: RootState) => state.session;

export const hasActiveSession = (state: RootState) => Object.keys(state.session.session).length > 0;

export default sessionSlice.reducer;
