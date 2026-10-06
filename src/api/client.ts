import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Set EXPO_PUBLIC_API_URL in .env to point at your backend (see .env.example).
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.103:3000';

export const AUTH_TOKEN_KEY = 'authToken';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
