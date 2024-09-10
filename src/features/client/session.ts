import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

export interface AuthSession {
  userId: string;
  walletAddress: string;
}

// Define a type for the slice state
export interface SessionSlice {
  session: AuthSession;
}

// Define the initial state using that type
export const initialState = {
  session: {},
} as SessionSlice;
export const sessionSlice = createSlice({
  name: "session",
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

export default sessionSlice.reducer;
