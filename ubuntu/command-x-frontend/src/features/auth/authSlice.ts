import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/api";
import { jwtDecode } from "jwt-decode";

// Define types for JWT payload
interface JwtPayload {
  id: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

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
  tokenExpiration: number | null;
}

// Define initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("authToken"), // Initialize token from local storage
  isLoading: false,
  error: null,
  tokenExpiration: null,
};

// Function to initialize state from stored token
const initializeStateFromToken = (): Partial<AuthState> => {
  const token = localStorage.getItem("authToken");
  if (!token) return {};

  // Check if token looks like a JWT (has 3 parts separated by dots)
  if (token.split(".").length !== 3) {
    console.warn("Invalid JWT format, removing token");
    localStorage.removeItem("authToken");
    return {};
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn("Token expired, removing token");
      localStorage.removeItem("authToken");
      return {};
    }

    return {
      token,
      tokenExpiration: decoded.exp * 1000, // Convert to milliseconds
      user: {
        userId: decoded.id,
        username: decoded.username,
        role: decoded.role,
      },
    };
  } catch (error) {
    // Invalid token
    console.warn("Error decoding token:", error);
    localStorage.removeItem("authToken");
    return {};
  }
};

// Apply the initialization safely
try {
  Object.assign(initialState, initializeStateFromToken());
} catch (error) {
  console.error("Error initializing auth state:", error);
  // Clear any problematic data
  localStorage.removeItem("authToken");
}

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
      state.tokenExpiration = null;
      localStorage.removeItem("authToken");
    },
    // Reducer to manually set user/token if needed (e.g., on initial load)
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      // Only try to decode if it looks like a JWT
      if (
        action.payload.token &&
        action.payload.token.split(".").length === 3
      ) {
        try {
          // Decode token to get expiration
          const decoded = jwtDecode<JwtPayload>(action.payload.token);
          state.tokenExpiration = decoded.exp * 1000; // Convert to milliseconds
        } catch (error) {
          console.error("Error decoding JWT token:", error);
          state.tokenExpiration = null;
        }
      } else {
        // Not a JWT token, set a default expiration (e.g., 24 hours from now)
        state.tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;
      }
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

        try {
          // Decode token to get expiration
          const decoded = jwtDecode<JwtPayload>(action.payload.token);
          state.tokenExpiration = decoded.exp * 1000; // Convert to milliseconds
        } catch (error) {
          console.error("Error decoding JWT token:", error);
        }

        // Save token to localStorage
        localStorage.setItem("authToken", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.tokenExpiration = null;
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

// Selector to check if the token is expired
export const selectIsTokenExpired = (state: { auth: AuthState }) => {
  const { tokenExpiration } = state.auth;
  if (!tokenExpiration) return true;
  return Date.now() > tokenExpiration;
};

// Selector to get the current user
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;

// Selector to check if the user is authenticated
export const selectIsAuthenticated = (state: { auth: AuthState }) => {
  return !!state.auth.token && !selectIsTokenExpired(state);
};

export default authSlice.reducer;
