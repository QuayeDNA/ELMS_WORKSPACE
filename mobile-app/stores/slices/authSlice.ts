import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState, LoginCredentials } from '../../types';
import { authApi } from '../../services/api';
import { ApiError, ApiErrorType } from '../../constants/api';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials.username, credentials.password);

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      const { user, token } = response.data;

      // Block students from logging in
      if (user.role === 'STUDENT') {
        throw new Error('Students are not allowed to access this application. Please use the web interface.');
      }

      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', token);

      return { user, token };
    } catch (error: any) {
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error instanceof ApiError) {
        switch (error.type) {
          case ApiErrorType.NETWORK_ERROR:
            errorMessage = 'Network connection failed. Please check your internet connection.';
            break;
          case ApiErrorType.TIMEOUT_ERROR:
            errorMessage = 'Request timed out. Please try again.';
            break;
          case ApiErrorType.AUTHENTICATION_ERROR:
            errorMessage = 'Invalid username or password.';
            break;
          case ApiErrorType.SERVER_ERROR:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem('authToken');
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed.');
    }
  }
);

// Async thunk for checking auth status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await authApi.getCurrentUser();
      if (!response.success) {
        throw new Error(response.message || 'Failed to get user data');
      }

      const user = response.data;

      // Double-check role (in case token is compromised)
      if (user.role === 'STUDENT') {
        await AsyncStorage.removeItem('authToken');
        throw new Error('Access denied for students');
      }

      return { user, token };
    } catch (error: any) {
      await AsyncStorage.removeItem('authToken');

      let errorMessage = 'Session expired. Please login again.';

      if (error instanceof ApiError) {
        switch (error.type) {
          case ApiErrorType.NETWORK_ERROR:
            errorMessage = 'Network connection failed. Please check your connection.';
            break;
          case ApiErrorType.AUTHENTICATION_ERROR:
            errorMessage = 'Session expired. Please login again.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.isLoading = false;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
