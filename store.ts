import { configureStore } from '@reduxjs/toolkit';
import examReducer from '@/features/client/exam';
import sessionReducer from '@/features/client/session';
// ...

export const store = configureStore({
  reducer: {
    exam: examReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
