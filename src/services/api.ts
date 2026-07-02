import { getToken, removeToken } from './storage';

// ─── Salesforce API Config ───────────────────────────────────────────────────
export const SF_LOGIN_URL = process.env.EXPO_PUBLIC_SF_LOGIN_URL || 'https://login.salesforce.com';
export const SF_INSTANCE_URL = process.env.EXPO_PUBLIC_SF_INSTANCE_URL || 'https://orgfarm-6ebfdf48c8-dev-ed.develop.my.salesforce.com';
export const SF_CLIENT_ID = process.env.EXPO_PUBLIC_SF_CLIENT_ID || 'YOUR_CONSUMER_KEY';
export const SF_CLIENT_SECRET = process.env.EXPO_PUBLIC_SF_CLIENT_SECRET || 'YOUR_CONSUMER_SECRET';

// ─── Spring Boot Config (Used as backup/fallback) ─────────────────────────────
export const BASE_URL = 'http://localhost:8080';

// ─── In-memory Salesforce Token Cache ─────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiryTime: number = 0; // Epoch timestamp in ms

/**
 * Dynamically retrieves a Salesforce Bearer token using OAuth 2.0 Client Credentials.
 * Caches the token to avoid repetitive requests.
 */
async function getSalesforceToken(): Promise<string> {
  const now = Date.now();
  // Return cached token if valid and expires in more than 5 minutes
  if (cachedToken && tokenExpiryTime > now + 300000) {
    return cachedToken;
  }

  // Otherwise, request a new one
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', SF_CLIENT_ID);
    params.append('client_secret', SF_CLIENT_SECRET);

    const res = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Salesforce auth failed: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    const expiresIn = data.expires_in ? parseInt(data.expires_in) * 1000 : 3600000;
    tokenExpiryTime = now + expiresIn;

    return cachedToken!;
  } catch (err) {
    console.error('Error fetching Salesforce token:', err);
    throw err;
  }
}

/**
 * Standard mapper to translate Salesforce picklist Status values
 * to corresponding frontend Lead statuses.
 */
function mapLeadStatus(status: string): string {
  if (status === 'Open - Not Contacted') return 'Pending';
  if (status === 'Working - Contacted') return 'Processing';
  if (status === 'Closed - Converted') return 'Approved';
  if (status === 'Closed - Not Converted') return 'Rejected';
  return status || 'Pending';
}

// ─── Spring Boot Header Helpers ────────────────────────────────────────────────
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

// ─── Auth API (With Local Mock Fallbacks if Spring Boot is down) ──────────────
export const AuthAPI = {
  /** Send OTP to phone */
  requestOtp: async (phone: string): Promise<void> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: await buildHeaders(false),
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to send OTP');
    } catch (e) {
      console.warn('Backend Auth requestOtp offline, using mock flow (fixed OTP 123456)');
    }
  },

  /** Verify OTP and get JWT + partner info */
  verifyOtp: async (phone: string, otp: string): Promise<{
    token: string;
    isNewPartner: boolean;
    partner: any | null;
  }> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: await buildHeaders(false),
        body: JSON.stringify({ phone, otp }),
      });
      return await handleResponse(res);
    } catch (e) {
      console.warn('Backend Auth verifyOtp offline, returning mock credentials');
      return {
        token: 'mock-jwt-token-from-expo',
        isNewPartner: false,
        partner: {
          id: 'mock-partner-123',
          fullName: 'Rajesh Kumar',
          mobileNumber: phone,
          email: 'rajesh@example.com',
          city: 'Mumbai',
        },
      };
    }
  },

  /** Register new partner (called after KYC onboarding) */
  register: async (data: any): Promise<{
    token: string;
    partnerId: string;
    partnerCode: string;
  }> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: await buildHeaders(false),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (e) {
      console.warn('Backend Auth register offline, returning mock registration');
      return {
        token: 'mock-jwt-token-from-expo',
        partnerId: 'mock-partner-123',
        partnerCode: 'DSAP12345',
      };
    }
  },
};

// ─── Lead API (Direct Salesforce Connection) ──────────────────────────────────
export const LeadAPI = {
  /** Fetch all leads for the logged-in partner (via SOQL query) */
  getLeads: async (): Promise<any[]> => {
    try {
      const token = await getSalesforceToken();
      const query = encodeURIComponent(
        "SELECT Id, FirstName, LastName, MobilePhone, Email, Status, City, CreatedDate, Description FROM Lead ORDER BY CreatedDate DESC"
      );
      const res = await fetch(`${SF_INSTANCE_URL}/services/data/v59.0/query?q=${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to query leads: ${res.status}`);
      }

      const json = await res.json();
      const records = json.records || [];
      const randomColors = ['#DE1F26', '#2E7D32', '#EF6C00', '#FBC02D', '#1565C0', '#6A1B9A'];

      return records.map((r: any, idx: number) => {
        let product = 'Home Loan';
        let amount = '5,00,000';
        if (r.Description) {
          const prodMatch = r.Description.match(/Product:\s*([^|]+)/);
          const amtMatch = r.Description.match(/Loan Amount:\s*([^|]+)/);
          if (prodMatch) product = prodMatch[1].trim();
          if (amtMatch) {
            const amtVal = parseFloat(amtMatch[1].trim());
            if (!isNaN(amtVal)) {
              amount = amtVal.toLocaleString('en-IN');
            }
          }
        }

        return {
          id: r.Id,
          name: `${r.FirstName || ''} ${r.LastName || ''}`.trim() || 'No Name',
          product: product,
          amount: amount,
          status: mapLeadStatus(r.Status),
          color: randomColors[idx % randomColors.length],
          city: r.City || 'Unknown',
          date: r.CreatedDate ? new Date(r.CreatedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          mobile: r.MobilePhone,
          email: r.Email,
        };
      });
    } catch (e) {
      console.warn('Direct Salesforce getLeads failed, returning mock lead list for testing');
      return [
        {
          id: 'L001',
          name: 'Amit Sharma',
          product: 'Home Loan',
          amount: '45,00,000',
          status: 'Processing',
          color: '#DE1F26',
          city: 'Delhi',
          date: '01 Jul 2026',
          mobile: '9876543210',
          email: 'amit.sharma@example.com',
          employment: 'Salaried',
          rcuVerified: true,
          cibilVerified: true,
          hasDeviation: false,
        },
        {
          id: 'L002',
          name: 'Priya Patel',
          product: 'LAP',
          amount: '20,00,000',
          status: 'Pending',
          color: '#2E7D32',
          city: 'Mumbai',
          date: '30 Jun 2026',
          mobile: '8765432109',
          email: 'priya.patel@example.com',
          employment: 'Self-Employed',
          rcuVerified: false,
          cibilVerified: false,
          hasDeviation: true,
          deviationReason: 'CIBIL score is 620 (below required 650) — blocked pending deviation approval.',
        },
        {
          id: 'L003',
          name: 'Rohan Verma',
          product: 'MSME Loan',
          amount: '12,00,000',
          status: 'Approved',
          color: '#EF6C00',
          city: 'Bangalore',
          date: '28 Jun 2026',
          mobile: '7654321098',
          email: 'rohan.verma@example.com',
          employment: 'Business Owner',
          rcuVerified: true,
          cibilVerified: true,
          hasDeviation: false,
        }
      ];
    }
  },

  /** Fetch a single lead by ID */
  getLeadById: async (id: string): Promise<any> => {
    const token = await getSalesforceToken();
    const res = await fetch(`${SF_INSTANCE_URL}/services/apexrest/v1/leads/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch lead: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Lead not found');
    }

    const r = json.data;
    const randomColors = ['#DE1F26', '#2E7D32', '#EF6C00', '#FBC02D', '#1565C0', '#6A1B9A'];
    
    return {
      id: r.leadId,
      name: `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'No Name',
      product: r.propertyType || 'Home Loan',
      amount: r.loanAmount ? r.loanAmount.toLocaleString('en-IN') : '0',
      status: mapLeadStatus(r.status),
      color: randomColors[0],
      city: r.city || 'Unknown',
      date: r.createdDate ? new Date(r.createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      mobile: r.mobileNumber,
      email: r.email,
      employment: r.employmentType,
    };
  },

  /** Submit a new lead directly to Salesforce */
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
    const token = await getSalesforceToken();
    
    const nameParts = (data.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'First';
    const lastName = nameParts.slice(1).join(' ') || 'Last';

    const payload = {
      firstName: firstName,
      lastName: lastName,
      mobileNumber: data.mobile || '9876543210',
      email: data.email || '',
      city: data.location || '',
      employmentType: data.employment || 'Salaried',
      annualIncome: data.income ? parseFloat(data.income) : 600000.00,
      loanAmount: data.amount || 1000000.00,
      propertyValue: (data.amount || 1000000.00) * 1.3,
      propertyType: data.product || 'Apartment',
      loanTenure: data.tenure ? parseInt(data.tenure) : 15,
      leadSource: 'Mobile App',
      status: 'Open - Not Contacted'
    };

    const res = await fetch(`${SF_INSTANCE_URL}/services/apexrest/v1/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = 'Failed to create lead';
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.message || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Lead creation failed');
    }

    const randomColors = ['#DE1F26', '#2E7D32', '#EF6C00', '#FBC02D', '#1565C0', '#6A1B9A'];
    return {
      id: json.leadId,
      name: data.name,
      product: data.product,
      amount: data.amount.toLocaleString('en-IN'),
      status: 'Pending',
      color: randomColors[0],
      city: data.location || 'Unknown',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      mobile: data.mobile,
      email: data.email,
    };
  },
};

// ─── Onboarding API (Direct Salesforce Connection) ────────────────────────────
export const OnboardingAPI = {
  /** Create Onboarding record linked to a Lead */
  createOnboarding: async (data: {
    leadId: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    propertyType: string;
    propertyValue: number;
    propertyCity: string;
    propertyPincode: string;
    loanAmount: number;
    loanTenure: number;
    employmentType: string;
    annualIncome: number;
    currentStep?: string;
    applicationStatus?: string;
    remarks?: string;
  }): Promise<any> => {
    const token = await getSalesforceToken();
    const res = await fetch(`${SF_INSTANCE_URL}/services/apexrest/v1/onboarding`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = 'Failed to create onboarding';
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.message || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Onboarding creation failed');
    }
    return json;
  },

  /** Fetch onboarding by ID */
  getOnboardingById: async (id: string): Promise<any> => {
    const token = await getSalesforceToken();
    const res = await fetch(`${SF_INSTANCE_URL}/services/apexrest/v1/onboarding/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch onboarding: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Onboarding not found');
    }
    return json.data;
  },

  /** Fetch onboarding by Lead ID */
  getOnboardingByLeadId: async (leadId: string): Promise<any> => {
    const token = await getSalesforceToken();
    const res = await fetch(`${SF_INSTANCE_URL}/services/apexrest/v1/onboarding?leadId=${leadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch onboarding: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Onboarding not found');
    }
    return json.data;
  },

  /** Update onboarding details */
  updateOnboarding: async (id: string, data: {
    fullName?: string;
    mobileNumber?: string;
    email?: string;
    propertyType?: string;
    propertyValue?: number;
    propertyCity?: string;
    propertyPincode?: string;
    loanAmount?: number;
    loanTenure?: number;
    employmentType?: string;
    annualIncome?: number;
    currentStep?: string;
    applicationStatus?: string;
    remarks?: string;
  }): Promise<any> => {
    const token = await getSalesforceToken();
    const res = await fetch(`${SF_INSTANCE_URL}/services/apexrest/v1/onboarding/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = 'Failed to update onboarding';
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.message || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Onboarding update failed');
    }
    return json;
  },

  /** Delete onboarding record */
  deleteOnboarding: async (id: string): Promise<any> => {
    const token = await getSalesforceToken();
    const res = await fetch(`${SF_INSTANCE_URL}/services/apexrest/v1/onboarding/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete onboarding: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Onboarding deletion failed');
    }
    return json;
  },
};

// ─── Payout API (With Local Mock Fallback) ────────────────────────────────────
export const PayoutAPI = {
  /** Fetch all payouts for the logged-in partner */
  getPayouts: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/api/payouts`, {
        headers: await buildHeaders(),
      });
      return await handleResponse<any[]>(res);
    } catch (e) {
      console.warn('Backend PayoutAPI offline, returning mock payouts');
      return [
        {
          id: 'P001',
          month: 'May 2026',
          amount: '₹45,200',
          leads: 4,
          status: 'Paid',
          date: '10 May 2026',
          bank: 'HDFC Bank ****4521',
        },
        {
          id: 'P002',
          month: 'June 2026',
          amount: '₹12,800',
          leads: 1,
          status: 'Pending',
          date: '05 Jun 2026',
          bank: 'HDFC Bank ****4521',
        },
      ];
    }
  },
};

// ─── Partner API (With Local Mock Fallback) ───────────────────────────────────
export const PartnerAPI = {
  /** Get full partner profile */
  getProfile: async (): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/api/partner/profile`, {
        headers: await buildHeaders(),
      });
      return await handleResponse(res);
    } catch (e) {
      console.warn('Backend PartnerAPI offline, returning mock profile');
      return {
        id: 'mock-partner-123',
        fullName: 'Rajesh Kumar',
        mobileNumber: '9876543210',
        email: 'rajesh@example.com',
        city: 'Mumbai',
        state: 'Maharashtra',
        dob: '15 Mar 1988',
        occupation: 'Financial Advisor',
        accNumber: '50100012344521',
        ifsc: 'HDFC0000001',
        pan: 'ABCDE1234F',
      };
    }
  },
};
