import { Constants } from 'expo-constants';
import axios, { AxiosError } from 'axios';

// Base URL for the backend API.
// Read from app.json extra.apiUrl so it works on emulator/device/web without code changes.
//   - app.json extra.apiUrl is "http://192.168.1.8:3000/api" (PC's LAN IP, for physical devices)
//   - Android emulator: set extra.apiUrl to "http://10.0.2.2:3000/api"
//   - Fallback for local/web: http://localhost:3000/api
const expoExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined) ?? {};
export const API_BASE = expoExtra.apiUrl ?? 'http://localhost:3000/api';

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
