import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'isfc_jwt_token';
const PARTNER_KEY = 'isfc_partner_data';

export const saveToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const savePartnerData = async (partner: object): Promise<void> => {
  await SecureStore.setItemAsync(PARTNER_KEY, JSON.stringify(partner));
};

export const getPartnerData = async (): Promise<object | null> => {
  const data = await SecureStore.getItemAsync(PARTNER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearPartnerData = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(PARTNER_KEY);
};
