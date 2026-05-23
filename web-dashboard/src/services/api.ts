import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      await signOut({ redirect: true, callbackUrl: '/' });
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    const errors = error.response?.data?.errors;

    return Promise.reject({ message, errors, status: error.response?.status });
  }
);

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    api.get<ApiResponse<T>>(url, { params }).then((r) => r.data),

  getPaginated: <T>(url: string, params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<T>>(url, { params }).then((r) => r.data),

  post: <T>(url: string, body?: unknown) =>
    api.post<ApiResponse<T>>(url, body).then((r) => r.data),

  put: <T>(url: string, body?: unknown) =>
    api.put<ApiResponse<T>>(url, body).then((r) => r.data),

  patch: <T>(url: string, body?: unknown) =>
    api.patch<ApiResponse<T>>(url, body).then((r) => r.data),

  delete: <T>(url: string) =>
    api.delete<ApiResponse<T>>(url).then((r) => r.data),

  upload: <T>(url: string, formData: FormData) =>
    api.post<ApiResponse<T>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
};

export { api, apiClient };
export type { ApiResponse, PaginatedResponse };
