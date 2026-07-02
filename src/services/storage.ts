/**
 * storage.ts — Persistent storage service
 *
 * - JWT token  → expo-secure-store (encrypted, keychain-backed) — SECURITY CRITICAL
 * - Partner data → @react-native-async-storage/async-storage (non-sensitive profile cache)
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'isfc_jwt_token';
const PARTNER_KEY = 'isfc_partner_data';

// ── JWT token (SecureStore — encrypted) ──────────────────────────────────────
export const saveToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

// ── Partner data (AsyncStorage — non-sensitive profile cache) ─────────────────
export const savePartnerData = async (partner: object): Promise<void> => {
  await AsyncStorage.setItem(PARTNER_KEY, JSON.stringify(partner));
};

export const getPartnerData = async (): Promise<object | null> => {
  const data = await AsyncStorage.getItem(PARTNER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearPartnerData = async (): Promise<void> => {
  await AsyncStorage.removeItem(PARTNER_KEY);
};
