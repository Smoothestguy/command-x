import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// Import other reducers here as they are created

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here
    // projects: projectsReducer,
    // workOrders: workOrdersReducer,
  },
  // Middleware can be added here (e.g., for RTK Query)
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

