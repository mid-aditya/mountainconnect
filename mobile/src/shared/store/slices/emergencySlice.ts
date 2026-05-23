import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api-client';
import { locationService } from '../../services/location.service';
import type { RootState } from '../index';

// ── Types ─────────────────────────────────────────────────────────────────────
export type SOSStatus =
  | 'idle'
  | 'activating'
  | 'sending'
  | 'sent'
  | 'acknowledged'
  | 'resolved'
  | 'cancelled';

export type CheckInStatus = 'idle' | 'active' | 'overdue' | 'emergency';

export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notified: boolean;
  notifiedAt?: string;
}

export interface SOSEvent {
  id: string;
  status: SOSStatus;
  location: Location;
  message?: string;
  triggeredAt: string;
  sentAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  emergencyContacts: EmergencyContact[];
  breadcrumbTrail: Location[];
}

export interface Trip {
  id: string;
  mountainId: string;
  mountainName: string;
  route: string;
  startTime: string;
  estimatedReturnTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'planned' | 'active' | 'completed' | 'overdue';
  isShared: boolean;
  shareLink?: string;
}

export interface CheckInState {
  activeTrip: Trip | null;
  status: CheckInStatus;
  lastCheckIn?: string;
  nextCheckInDue?: string;
  overdueSince?: string;
  breadcrumbTrail: Location[];
}

// ── State ─────────────────────────────────────────────────────────────────────
interface EmergencyState {
  currentSOS: SOSEvent | null;
  checkInState: CheckInState;
  lastKnownLocation: Location | null;
  emergencyContacts: EmergencyContact[];
  isLoading: boolean;
  error: string | null;
  countdownSeconds: number; // For SOS activation countdown
  autoNotifyCountdown: number; // Time until auto-notifying contacts
}

const initialState: EmergencyState = {
  currentSOS: null,
  checkInState: {
    activeTrip: null,
    status: 'idle',
    breadcrumbTrail: [],
  },
  lastKnownLocation: null,
  emergencyContacts: [],
  isLoading: false,
  error: null,
  countdownSeconds: 0,
  autoNotifyCountdown: 300, // 5 minutes default
};

// ── Async Thunks ───────────────────────────────────────────────────────────────
export const triggerSOS = createAsyncThunk<
  SOSEvent,
  { location: Location; message?: string },
  { state: RootState; rejectValue: string }
>('emergency/triggerSOS', async ({ location, message }, { getState, rejectWithValue }) => {
  try {
    const { emergencyContacts, checkInState } = getState().emergency;

    const payload = {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude,
      },
      message,
      emergencyContacts: emergencyContacts.map((c) => c.id),
      activeTripId: checkInState.activeTrip?.id,
      breadcrumbTrail: checkInState.breadcrumbTrail.slice(-50), // Last 50 points
    };

    const response = await apiClient.post<SOSEvent>('/emergency/sos', payload);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'SOS trigger failed';
    return rejectWithValue(message);
  }
});

export const resolveSOS = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>('emergency/resolveSOS', async (sosId, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch<{ id: string }>(
      `/emergency/sos/${sosId}/resolve`,
      {},
    );
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Failed to resolve SOS';
    return rejectWithValue(message);
  }
});

export const checkIn = createAsyncThunk<
  Trip,
  { tripId: string; location: Location },
  { rejectValue: string }
>('emergency/checkIn', async ({ tripId, location }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<Trip>(`/trips/${tripId}/check-in`, {
      location: { latitude: location.latitude, longitude: location.longitude },
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Check-in failed';
    return rejectWithValue(message);
  }
});

export const checkOut = createAsyncThunk<
  { id: string; tripSummary: any },
  { tripId: string; location: Location; breadcrumbTrail: Location[] },
  { rejectValue: string }
>('emergency/checkOut', async ({ tripId, location, breadcrumbTrail }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<{ id: string; tripSummary: any }>(
      `/trips/${tripId}/check-out`,
      {
        location: { latitude: location.latitude, longitude: location.longitude },
        breadcrumbTrail,
        timestamp: new Date().toISOString(),
      },
    );
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Check-out failed';
    return rejectWithValue(message);
  }
});

export const fetchEmergencyContacts = createAsyncThunk<
  EmergencyContact[],
  void,
  { rejectValue: string }
>('emergency/fetchContacts', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<EmergencyContact[]>('/users/me/emergency-contacts');
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || 'Failed to fetch contacts';
    return rejectWithValue(message);
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    updateLocation(state, action: PayloadAction<Location>) {
      state.lastKnownLocation = action.payload;

      // Add to breadcrumb trail if tracking
      if (state.checkInState.status === 'active') {
        const trail = state.checkInState.breadcrumbTrail;
        const lastPoint = trail[trail.length - 1];

        // Only add if moved >10m or 10s passed
        const movedDistance = lastPoint
          ? calculateDistance(
              lastPoint.latitude,
              lastPoint.longitude,
              action.payload.latitude,
              action.payload.longitude,
            )
          : Infinity;
        const timeDiff = action.payload.timestamp - (lastPoint?.timestamp ?? 0);

        if (movedDistance > 10 || timeDiff > 10000) {
          trail.push(action.payload);
          // Keep last 1000 points
          if (trail.length > 1000) {
            trail.splice(0, trail.length - 1000);
          }
        }
      }
    },
    setEmergencyContacts(state, action: PayloadAction<EmergencyContact[]>) {
      state.emergencyContacts = action.payload;
    },
    addEmergencyContact(state, action: PayloadAction<EmergencyContact>) {
      state.emergencyContacts.push(action.payload);
    },
    removeEmergencyContact(state, action: PayloadAction<string>) {
      state.emergencyContacts = state.emergencyContacts.filter(
        (c) => c.id !== action.payload,
      );
    },
    updateSOSStatus(state, action: PayloadAction<SOSStatus>) {
      if (state.currentSOS) {
        state.currentSOS.status = action.payload;
      }
    },
    startSOSCountdown(state, action: PayloadAction<number>) {
      state.countdownSeconds = action.payload;
    },
    decrementCountdown(state) {
      if (state.countdownSeconds > 0) {
        state.countdownSeconds -= 1;
      }
    },
    clearSOSCountdown(state) {
      state.countdownSeconds = 0;
    },
    setAutoNotifyCountdown(state, action: PayloadAction<number>) {
      state.autoNotifyCountdown = action.payload;
    },
    clearCurrentSOS(state) {
      state.currentSOS = null;
    },
    setActiveTrip(state, action: PayloadAction<Trip | null>) {
      state.checkInState.activeTrip = action.payload;
      state.checkInState.status = action.payload ? 'active' : 'idle';
      if (!action.payload) {
        state.checkInState.breadcrumbTrail = [];
      }
    },
    setCheckInStatus(state, action: PayloadAction<CheckInStatus>) {
      state.checkInState.status = action.payload;
    },
    updateTripStatus(state, action: PayloadAction<Trip['status']>) {
      if (state.checkInState.activeTrip) {
        state.checkInState.activeTrip.status = action.payload;
      }
    },
    clearCheckInState(state) {
      state.checkInState = {
        activeTrip: null,
        status: 'idle',
        breadcrumbTrail: [],
      };
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Trigger SOS
    builder
      .addCase(triggerSOS.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        if (state.currentSOS) {
          state.currentSOS.status = 'sending';
        }
      })
      .addCase(triggerSOS.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSOS = action.payload;
        state.currentSOS.status = 'sent';
        state.currentSOS.sentAt = new Date().toISOString();
      })
      .addCase(triggerSOS.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'SOS trigger failed';
        // Keep local SOS active even if API fails - will retry
      });

    // Resolve SOS
    builder
      .addCase(resolveSOS.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resolveSOS.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentSOS?.id === action.payload.id) {
          state.currentSOS.status = 'resolved';
          state.currentSOS.resolvedAt = new Date().toISOString();
        }
      })
      .addCase(resolveSOS.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to resolve SOS';
      });

    // Check In
    builder
      .addCase(checkIn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkInState.activeTrip = action.payload;
        state.checkInState.status = 'active';
        state.checkInState.lastCheckIn = new Date().toISOString();
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Check-in failed';
      });

    // Check Out
    builder
      .addCase(checkOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkOut.fulfilled, (state) => {
        state.isLoading = false;
        state.checkInState = {
          activeTrip: null,
          status: 'idle',
          breadcrumbTrail: [],
        };
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Check-out failed';
      });

    // Fetch Contacts
    builder
      .addCase(fetchEmergencyContacts.fulfilled, (state, action) => {
        state.emergencyContacts = action.payload;
      });
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
// Haversine distance in meters
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const {
  updateLocation,
  setEmergencyContacts,
  addEmergencyContact,
  removeEmergencyContact,
  updateSOSStatus,
  startSOSCountdown,
  decrementCountdown,
  clearSOSCountdown,
  setAutoNotifyCountdown,
  clearCurrentSOS,
  setActiveTrip,
  setCheckInStatus,
  updateTripStatus,
  clearCheckInState,
  clearError,
} = emergencySlice.actions;

export default emergencySlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCurrentSOS = (state: RootState) => state.emergency.currentSOS;
export const selectCheckInState = (state: RootState) => state.emergency.checkInState;
export const selectLastKnownLocation = (state: RootState) =>
  state.emergency.lastKnownLocation;
export const selectEmergencyContacts = (state: RootState) =>
  state.emergency.emergencyContacts;
export const selectIsSOSActive = (state: RootState) =>
  state.emergency.currentSOS !== null &&
  !['resolved', 'cancelled'].includes(state.emergency.currentSOS.status);
export const selectBreadcrumbTrail = (state: RootState) =>
  state.emergency.checkInState.breadcrumbTrail;
