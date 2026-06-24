import { getToken, removeToken } from './storage';

// ─── Config ───────────────────────────────────────────────────────────────────
// For Android emulator use 10.0.2.2 instead of localhost
// For physical device use your machine's local IP e.g. http://192.168.1.5:8080
export const BASE_URL = 'http://localhost:8080';

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function buildHeaders(requireAuth = true): Promise<HeadersInit> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (requireAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }
  return json.data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const AuthAPI = {
  /** Send OTP to phone */
  requestOtp: async (phone: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: await buildHeaders(false),
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to send OTP');
  },

  /** Verify OTP and get JWT + partner info */
  verifyOtp: async (phone: string, otp: string): Promise<{
    token: string;
    isNewPartner: boolean;
    partner: any | null;
  }> => {
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: await buildHeaders(false),
      body: JSON.stringify({ phone, otp }),
    });
    return handleResponse(res);
  },

  /** Register new partner (called after KYC onboarding) */
  register: async (data: any): Promise<{
    token: string;
    partnerId: string;
    partnerCode: string;
  }> => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: await buildHeaders(false),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ─── Lead API ─────────────────────────────────────────────────────────────────
export const LeadAPI = {
  /** Fetch all leads for the logged-in partner */
  getLeads: async (): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/api/leads`, {
      headers: await buildHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  /** Fetch a single lead by ID */
  getLeadById: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/leads/${id}`, {
      headers: await buildHeaders(),
    });
    return handleResponse(res);
  },

  /** Submit a new lead */
  createLead: async (data: {
    name: string;
    mobile: string;
    altMobile?: string;
    email?: string;
    dob?: string;
    employment: string;
    product: string;
    amount: number;
    tenure?: string;
    location?: string;
    income?: string;
    cibil?: string;
  }): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// ─── Payout API ───────────────────────────────────────────────────────────────
export const PayoutAPI = {
  /** Fetch all payouts for the logged-in partner */
  getPayouts: async (): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/api/payouts`, {
      headers: await buildHeaders(),
    });
    return handleResponse<any[]>(res);
  },
};

// ─── Partner API ──────────────────────────────────────────────────────────────
export const PartnerAPI = {
  /** Get full partner profile from Salesforce */
  getProfile: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/partner/profile`, {
      headers: await buildHeaders(),
    });
    return handleResponse(res);
  },
};
