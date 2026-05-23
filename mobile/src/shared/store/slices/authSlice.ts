import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api-client';
import type { RootState } from '../index';

// ── Types ─────────────────────────────────────────────────────────────────────
export type VerificationLevel = 0 | 1 | 2 | 3;
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SocialProvider = 'google' | 'facebook' | 'instagram';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface MedicalInfo {
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  notes?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface MountainHistory {
  id: string;
  mountainId: string;
  mountainName: string;
  date: string;
  route: string;
  completed: boolean;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  skillLevel: SkillLevel;
  verificationLevel: VerificationLevel;
  emailVerified: boolean;
  phoneVerified: boolean;
  ktpVerified: boolean;
  certificateVerified: boolean;
  emergencyContacts: EmergencyContact[];
  medicalInfo?: MedicalInfo;
  badges: UserBadge[];
  history: MountainHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface SocialLoginPayload {
  provider: SocialProvider;
  token: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  avatar?: string;
  skillLevel?: SkillLevel;
  emergencyContacts?: EmergencyContact[];
  medicalInfo?: MedicalInfo;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ── State ─────────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRehydrating: boolean;
  verificationLevel: VerificationLevel;
  error: string | null;
  deviceToken: string | null;
  biometricEnabled: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isRehydrating: true,
  verificationLevel: 0,
  error: null,
  deviceToken: null,
  biometricEnabled: false,
};

// ── Async Thunks ───────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk<
  AuthResponse,
  AuthCredentials,
  { rejectValue: string }
>('auth/loginUser', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Login failed';
    return rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Registration failed';
    return rejectWithValue(message);
  }
});

export const socialLogin = createAsyncThunk<
  AuthResponse,
  SocialLoginPayload,
  { rejectValue: string }
>('auth/socialLogin', async ({ provider, token }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/social', {
      provider,
      token,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Social login failed';
    return rejectWithValue(message);
  }
});

export const verifyEmail = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>('auth/verifyEmail', async (code, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/auth/verify-email', { code });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Email verification failed';
    return rejectWithValue(message);
  }
});

export const verifyPhone = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>('auth/verifyPhone', async (code, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/auth/verify-phone', { code });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Phone verification failed';
    return rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk<
  User,
  UpdateProfilePayload,
  { state: RootState; rejectValue: string }
>('auth/updateProfile', async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    const response = await apiClient.patch<User>('/users/me', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Profile update failed';
    return rejectWithValue(message);
  }
});

export const refreshAccessToken = createAsyncThunk<
  AuthTokens,
  void,
  { state: RootState; rejectValue: string }
>('auth/refreshToken', async (_, { getState, rejectWithValue }) => {
  try {
    const refreshToken = getState().auth.refreshToken;
    const response = await apiClient.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue('Token refresh failed');
  }
});

export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error: any) {
    // Ignore logout errors - clear local state anyway
    console.warn('Logout API call failed, clearing local state');
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>,
    ) {
      const { user, tokens } = action.payload;
      state.user = user;
      state.token = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.isAuthenticated = true;
      state.verificationLevel = user.verificationLevel;
      state.error = null;
    },
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.verificationLevel = 0;
      state.error = null;
    },
    updateVerification(
      state,
      action: PayloadAction<{ level: VerificationLevel; user: Partial<User> }>,
    ) {
      state.verificationLevel = action.payload.level;
      if (state.user) {
        Object.assign(state.user, action.payload.user);
      }
    },
    setDeviceToken(state, action: PayloadAction<string>) {
      state.deviceToken = action.payload;
    },
    setBiometricEnabled(state, action: PayloadAction<boolean>) {
      state.biometricEnabled = action.payload;
    },
    setRehydrating(state, action: PayloadAction<boolean>) {
      state.isRehydrating = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const { user, tokens } = action.payload;
        state.user = user;
        state.token = tokens.accessToken;
        state.refreshToken = tokens.refreshToken;
        state.isAuthenticated = true;
        state.verificationLevel = user.verificationLevel;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const { user, tokens } = action.payload;
        state.user = user;
        state.token = tokens.accessToken;
        state.refreshToken = tokens.refreshToken;
        state.isAuthenticated = true;
        state.verificationLevel = user.verificationLevel;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Registration failed';
      });

    // Social Login
    builder
      .addCase(socialLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        const { user, tokens } = action.payload;
        state.user = user;
        state.token = tokens.accessToken;
        state.refreshToken = tokens.refreshToken;
        state.isAuthenticated = true;
        state.verificationLevel = user.verificationLevel;
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Social login failed';
      });

    // Verify Email
    builder
      .addCase(verifyEmail.fulfilled, (state, action) => {
        if (state.user) {
          state.user.emailVerified = true;
          state.verificationLevel = Math.max(state.verificationLevel, 1) as VerificationLevel;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.error = action.payload ?? 'Email verification failed';
      });

    // Verify Phone
    builder
      .addCase(verifyPhone.fulfilled, (state, action) => {
        if (state.user) {
          state.user.phoneVerified = true;
          state.verificationLevel = Math.max(state.verificationLevel, 1) as VerificationLevel;
        }
      })
      .addCase(verifyPhone.rejected, (state, action) => {
        state.error = action.payload ?? 'Phone verification failed';
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Profile update failed';
      });

    // Refresh Token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.verificationLevel = 0;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Still clear credentials on API failure
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.verificationLevel = 0;
        state.error = null;
      });
  },
});

export const {
  setCredentials,
  clearCredentials,
  updateVerification,
  setDeviceToken,
  setBiometricEnabled,
  setRehydrating,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
