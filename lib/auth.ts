import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'mobile_auth_token';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'worker' | 'officer';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
