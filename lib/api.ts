import axios, { AxiosError } from 'axios';

// Base URL for the backend API.
//   - Expo Go / emulator (Android): http://10.0.2.2:3000/api
//   - Physical device on same LAN:  http://<your-computer-ip>:3000/api
//   - Web / local:                  http://localhost:3000/api
export const API_BASE = 'http://localhost:3000/api';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = (globalThis as any).__mobileToken;
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response && err.response.status === 401) {
      (globalThis as any).__mobileToken = null;
    }
    return Promise.reject(err);
  }
);

export type ApiError = { code?: string; message?: string };

export function extractErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ error?: ApiError }>;
  return (
    axiosErr.response?.data?.error?.message ||
    axiosErr.response?.data?.error?.code ||
    fallback
  );
}
