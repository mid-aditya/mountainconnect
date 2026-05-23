import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../config/env';
import { store } from '../store';
import { logoutUser } from '../store/slices/authSlice';
import { enqueueAction } from '../store/slices/offlineSlice';
import { encryptionService } from './encryption.service';

// ── Axios Instance ─────────────────────────────────────────────────────────────
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Version': '1.0.0',
    'X-Client-Platform': 'mobile',
  },
});

// ── Token Management ──────────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Request Interceptor ────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.token;

    // Inject JWT auth header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inject device token
    const deviceToken = state.auth.deviceToken;
    if (deviceToken && config.headers) {
      config.headers['X-Device-Token'] = deviceToken;
    }

    // Encrypt sensitive data
    const sensitiveFields = ['password', 'emergencyContacts', 'medicalInfo', 'location'];
    const hasSensitiveData = sensitiveFields.some((field) =>
      config.data && typeof config.data === 'object' && field in config.data,
    );

    if (hasSensitiveData) {
      const encryptionKey = await encryptionService.getOrCreateKey();
      if (config.data && typeof config.data === 'object') {
        const dataToEncrypt = { ...config.data };
        sensitiveFields.forEach((field) => {
          if (field in dataToEncrypt) {
            dataToEncrypt[field] = encryptionService.encryptData(
              JSON.stringify(dataToEncrypt[field]),
              encryptionKey,
            );
          }
        });
        config.data = dataToEncrypt;
      }
    }

    // Add timestamp for request deduplication
    if (config.headers) {
      config.headers['X-Request-Id'] = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = store.getState().auth.refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update store
        const state = store.getState();
        if (state.auth.user) {
          store.dispatch(
            // @ts-ignore - simplified action
            { type: 'auth/setTokens', payload: { accessToken, refreshToken: newRefreshToken } },
          );
        }

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors - queue for offline sync
    if (!error.response && error.message !== 'Network Error') {
      const isOnline = store.getState().offline.isOnline;
      const isMutation =
        originalRequest.method === 'post' ||
        originalRequest.method === 'put' ||
        originalRequest.method === 'patch' ||
        originalRequest.method === 'delete';

      if (!isOnline && isMutation) {
        const actionTypeMap: Record<string, any> = {
          POST: 'CREATE_POST',
          PUT: 'UPDATE_PROFILE',
          PATCH: 'UPDATE_PROFILE',
          DELETE: 'UPDATE_PROFILE',
        };

        const offlineType = actionTypeMap[originalRequest.method?.toUpperCase() || ''];

        if (offlineType) {
          store.dispatch(
            enqueueAction({
              type: offlineType,
              payload: {
                endpoint: originalRequest.url,
                method: originalRequest.method,
                data: originalRequest.data,
              },
            }),
          );
        }

        // Return a fake success to prevent UI error states
        return Promise.resolve({ data: { queued: true }, status: 202 });
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }

    // Format error response
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'An unexpected error occurred';

    const formattedError = new Error(message) as AxiosError;
    formattedError.response = error.response;
    formattedError.config = error.config;
    formattedError.request = error.request;
    formattedError.isAxiosError = true;

    return Promise.reject(formattedError);
  },
);

// ── Retry with Exponential Backoff ─────────────────────────────────────────────
export async function requestWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (except 429)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[API] Retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ── API Methods Helper ─────────────────────────────────────────────────────────
export const api = {
  get: <T = any>(url: string, config?: any) =>
    requestWithRetry(() => apiClient.get<T>(url, config)),

  post: <T = any>(url: string, data?: any, config?: any) =>
    requestWithRetry(() => apiClient.post<T>(url, data, config)),

  put: <T = any>(url: string, data?: any, config?: any) =>
    requestWithRetry(() => apiClient.put<T>(url, data, config)),

  patch: <T = any>(url: string, data?: any, config?: any) =>
    requestWithRetry(() => apiClient.patch<T>(url, data, config)),

  delete: <T = any>(url: string, config?: any) =>
    requestWithRetry(() => apiClient.delete<T>(url, config)),
};

export default apiClient;
