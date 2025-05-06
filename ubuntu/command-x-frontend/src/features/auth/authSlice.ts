import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Define types for user and auth state
interface User {
  userId: number;
  username: string;
  role: string;
  // Add other user fields as needed
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Define initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("authToken"), // Initialize token from local storage
  isLoading: false,
  error: null,
};

// Import the loginUser function from the API service
import { loginUser as apiLoginUser } from "../../services/api";

// Async thunk for user login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Use the API service function instead of making a direct API call
      const response = await apiLoginUser({ username, password });

      // Map the response to match the expected format in the reducer
      const mappedUser: User = {
        userId: response.user.user_id,
        username: response.user.username,
        role: response.user.role,
      };

      return {
        token: response.token,
        user: mappedUser,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Async thunk for user registration (optional, based on requirements)
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/auth/register", userData);
      // Optionally log the user in automatically after registration
      return response.data; // Returns the newly created user data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("authToken");
    },
    // Reducer to manually set user/token if needed (e.g., on initial load)
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        // Save token to localStorage
        localStorage.setItem("authToken", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        localStorage.removeItem("authToken");
      })
      // Registration cases (optional)
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        // Handle successful registration (e.g., show message, maybe auto-login)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
