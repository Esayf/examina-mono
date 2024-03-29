import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './features/client/client';
import examReducer from './features/client/exam';
import accountReducer from './features/client/account';
// ...

export const store = configureStore({
  reducer: {
    client: clientReducer,
    exam: examReducer,
    account: accountReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
