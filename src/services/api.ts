import { getToken, removeToken } from './storage';
import Constants from 'expo-constants';

// ─── Salesforce API Config ───────────────────────────────────────────────────
// 3-layer fallback: EXPO_PUBLIC_ env var → app.config.js extra → hardcoded Sandbox default
const extra = Constants.expoConfig?.extra || {};
export const SF_LOGIN_URL = process.env.EXPO_PUBLIC_SF_LOGIN_URL || extra.SF_LOGIN_URL || 'https://isfc--partial.sandbox.my.salesforce.com';
export const SF_INSTANCE_URL = process.env.EXPO_PUBLIC_SF_INSTANCE_URL || extra.SF_INSTANCE_URL || 'https://isfc--partial.sandbox.my.salesforce.com';
export const SF_CLIENT_ID = process.env.EXPO_PUBLIC_SF_CLIENT_ID || extra.SF_CLIENT_ID || '';
export const SF_CLIENT_SECRET = process.env.EXPO_PUBLIC_SF_CLIENT_SECRET || extra.SF_CLIENT_SECRET || '';
export const SF_USERNAME = process.env.EXPO_PUBLIC_SF_USERNAME || '';
export const SF_PASSWORD = process.env.EXPO_PUBLIC_SF_PASSWORD || '';

// ─── Spring Boot Config (Used as backup/fallback) ─────────────────────────────
export const BASE_URL = 'http://localhost:8080';

// ─── In-memory Salesforce Token Cache ─────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiryTime: number = 0; // Epoch timestamp in ms
let cachedInstanceUrl: string | null = null;

export function getInstanceUrl() { return cachedInstanceUrl || SF_INSTANCE_URL; }

/**
 * Dynamically retrieves a Salesforce Bearer token using OAuth 2.0.
 * Uses Username-Password flow if SF_USERNAME is provided, otherwise falls back to Client Credentials.
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
    if (SF_USERNAME) {
      params.append('grant_type', 'password');
      params.append('username', SF_USERNAME);
      params.append('password', SF_PASSWORD);
    } else {
      params.append('grant_type', 'client_credentials');
    }
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
    if (data.instance_url) cachedInstanceUrl = data.instance_url;
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

/**
 * Maps app-facing product names to valid Property_Type__c picklist values on Partial Sandbox.
 * Valid values: "Home Purchase", "Home Construction", "Residential House",
 *   "Ready Built Flat", "Commercial Building", "Commercial Shop/Unit",
 *   "Plot + Construction", "Under Construction Property", "Owned Plot"
 */
function mapProductToPropertyType(product?: string): string {
  const map: Record<string, string> = {
    'Home Loan':         'Home Purchase',
    'Home Purchase':     'Home Purchase',
    'Home Construction': 'Home Construction',
    'LAP':               'Residential House',
    'Lap':               'Residential House',
    'MSME Loan':         'Commercial Building',
    'Commercial':        'Commercial Building',
    'Plot':              'Owned Plot',
    'Under Construction':'Under Construction Property',
    'Apartment':         'Ready Built Flat',
    'Flat':              'Ready Built Flat',
  };
  if (!product) return 'Home Purchase';
  return map[product] || map[product.trim()] || 'Home Purchase';
}

export const LeadAPI = {
  /** Fetch all leads for the logged-in partner (via SOQL query) */
  getLeads: async (): Promise<any[]> => {
    try {
      const token = await getSalesforceToken();
      const query = encodeURIComponent(
        `SELECT Id, FirstName, LastName, MobilePhone, Email, Status, City, State, PostalCode, CreatedDate,
         Loan_Amount__c, Property_Type__c, Employment_Type__c, Tenure__c,
         Property_City__c, Current_Step__c, Application_Status__c, Connector__c
         FROM Lead ORDER BY CreatedDate DESC`
      );
      const res = await fetch(`/services/data/v59.0/query?q=${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`Failed to query leads: ${res.status}`);

      const json = await res.json();
      const records = json.records || [];
      const randomColors = ['#DE1F26', '#2E7D32', '#EF6C00', '#FBC02D', '#1565C0', '#6A1B9A'];

      return records.map((r: any, idx: number) => ({
        id:                r.Id,
        name:              `${r.FirstName || ''} ${r.LastName || ''}`.trim() || 'No Name',
        product:           r.Property_Type__c || 'Home Loan',
        amount:            r.Loan_Amount__c ? r.Loan_Amount__c.toLocaleString('en-IN') : '0',
        status:            mapLeadStatus(r.Status),
        color:             randomColors[idx % randomColors.length],
        city:              r.Property_City__c || r.City || 'Unknown',
        date:              r.CreatedDate ? new Date(r.CreatedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        mobile:            r.MobilePhone,
        email:             r.Email,
        employment:        r.Employment_Type__c,
        currentStep:       r.Current_Step__c,
        applicationStatus: r.Application_Status__c,
        connectorId:       r.Connector__c,
      }));
    } catch (e) {
      console.warn('Direct Salesforce getLeads failed, returning mock lead list for testing');
      return [
        {
          id: 'L001', name: 'Amit Sharma', product: 'Home Loan', amount: '45,00,000',
          status: 'Processing', color: '#DE1F26', city: 'Delhi', date: '01 Jul 2026',
          mobile: '9876543210', email: 'amit.sharma@example.com', employment: 'Salaried',
          currentStep: 'Submitted', applicationStatus: 'Submitted',
          rcuVerified: true, cibilVerified: true, hasDeviation: false,
        },
        {
          id: 'L002', name: 'Priya Patel', product: 'LAP', amount: '20,00,000',
          status: 'Pending', color: '#2E7D32', city: 'Mumbai', date: '30 Jun 2026',
          mobile: '8765432109', email: 'priya.patel@example.com', employment: 'Self-Employed',
          currentStep: 'Personal Info', applicationStatus: 'Draft',
          rcuVerified: false, cibilVerified: false, hasDeviation: true,
          deviationReason: 'CIBIL score is 620 (below required 650) — blocked pending deviation approval.',
        },
        {
          id: 'L003', name: 'Rohan Verma', product: 'MSME Loan', amount: '12,00,000',
          status: 'Approved', color: '#EF6C00', city: 'Bangalore', date: '28 Jun 2026',
          mobile: '7654321098', email: 'rohan.verma@example.com', employment: 'Business Owner',
          currentStep: 'Submitted', applicationStatus: 'Submitted',
          rcuVerified: true, cibilVerified: true, hasDeviation: false,
        },
      ];
    }
  },

  getLeadById: async (id: string): Promise<any> => {
    const token = await getSalesforceToken();
    const res = await fetch(`/services/apexrest/v1/leads/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch lead: ${res.status}`);

    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lead not found');

    const r = json.data;
    const randomColors = ['#DE1F26', '#2E7D32', '#EF6C00', '#FBC02D', '#1565C0', '#6A1B9A'];

    return {
      id:                r.leadId,
      name:              `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'No Name',
      product:           r.propertyType || 'Home Loan',
      amount:            r.loanAmount ? r.loanAmount.toLocaleString('en-IN') : '0',
      status:            mapLeadStatus(r.status),
      color:             randomColors[0],
      city:              r.propertyCity || r.city || 'Unknown',
      date:              r.createdDate ? new Date(r.createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      mobile:            r.mobileNumber,
      email:             r.email,
      employment:        r.employmentType,
      // New onboarding fields
      currentStep:       r.currentStep,
      applicationStatus: r.applicationStatus,
      propertyCity:      r.propertyCity,
      propertyPincode:   r.propertyPincode,
      submittedDate:     r.submittedDate,
      connectorId:       r.connectorId,
      annualIncome:      r.annualIncome,
      propertyValue:     r.propertyValue,
      loanTenure:        r.loanTenure,
      remarks:           r.remarks,
      lastModifiedDate:  r.lastModifiedDate,
    };
  },

  /** Submit a new lead directly to Salesforce — includes all onboarding fields */
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
    location?: string;        // maps to City
    state?: string;
    pincode?: string;
    income?: string;
    propertyValue?: number;
    propertyCity?: string;
    propertyPincode?: string;
    currentStep?: string;     // onboarding step (e.g. 'Personal Info')
    applicationStatus?: string; // 'Draft' | 'Submitted' | 'Approved'
    remarks?: string;
    connectorId?: string;     // Connector__c Salesforce record ID
    cibil?: string;
  }): Promise<any> => {
    const token = await getSalesforceToken();

    const nameParts = (data.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'First';
    const lastName  = nameParts.slice(1).join(' ') || '.';

    // Use Salesforce standard sObject REST API directly.
    // This bypasses the custom Apex class which has field-level security
    // and picklist access issues on the Integration User profile in Partial Sandbox.
    const payload: Record<string, any> = {
      FirstName:             firstName,
      LastName:              lastName,
      Company:               `${firstName} ${lastName}`,
      Email:                 data.email || '',
      City:                  data.location || data.propertyCity || '',
      State:                 data.state || '',
      PostalCode:            data.pincode || data.propertyPincode || '',
      LeadSource:            'Online Business Partner', // valid picklist in Partial Sandbox
      Status:                'New',                     // valid picklist in Partial Sandbox
      Description:           data.remarks || '',
      // Custom loan & onboarding fields
      Loan_Amount__c:        data.amount || 1000000,
      Employment_Type__c:    data.employment || 'Salaried',
      Property_City__c:      data.propertyCity || data.location || '',
      Current_Step__c:       data.currentStep || 'Personal Info',
      Application_Status__c: data.applicationStatus || 'Draft',
    };

    // Add MobilePhone only (the Integration User profile may not have access — caught below)
    if (data.mobile) payload.MobilePhone = data.mobile;

    // Link to Connector__c if provided
    if (data.connectorId) payload.Connector__c = data.connectorId;

    const res = await fetch(`/services/data/v59.0/sobjects/Lead`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errArr = await res.json().catch(() => []);
      // If MobilePhone blocked by FLS, retry without it
      const mobileBlocked = Array.isArray(errArr) && errArr.some((e: any) =>
        e.fields?.includes('MobilePhone') || (e.message || '').toLowerCase().includes('mobilephone')
      );
      if (mobileBlocked && payload.MobilePhone) {
        console.warn('MobilePhone field access denied — retrying without it');
        delete payload.MobilePhone;
        const retry = await fetch(`/services/data/v59.0/sobjects/Lead`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!retry.ok) {
          const retryErr = await retry.json().catch(() => []);
          throw new Error(Array.isArray(retryErr) ? retryErr[0]?.message : 'Failed to create lead');
        }
        const retryData = await retry.json();
        const leadId = retryData.id;
        const randomColors = ['#DE1F26', '#2E7D32', '#EF6C00', '#FBC02D', '#1565C0', '#6A1B9A'];
        return {
          id: leadId, name: data.name, product: data.product,
          amount: data.amount.toLocaleString('en-IN'), status: 'Pending',
          color: randomColors[Math.floor(Math.random() * randomColors.length)],
          city: data.location || data.propertyCity || 'Unknown',
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          mobile: data.mobile, email: data.email,
          currentStep: data.currentStep || 'Personal Info',
          applicationStatus: data.applicationStatus || 'Draft',
        };
      }
      throw new Error(Array.isArray(errArr) ? errArr[0]?.message : 'Failed to create lead');
    }

    const json = await res.json();
    const leadId = json.id;
    const randomColors = ['#DE1F26', '#2E7D32', '#EF6C00', '#FBC02D', '#1565C0', '#6A1B9A'];
    return {
      id:     leadId,
      name:   data.name,
      product: data.product,
      amount:  data.amount.toLocaleString('en-IN'),
      status:  'Pending',
      color:   randomColors[Math.floor(Math.random() * randomColors.length)],
      city:    data.location || data.propertyCity || 'Unknown',
      date:    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      mobile:  data.mobile,
      email:   data.email,
      currentStep:       data.currentStep || 'Personal Info',
      applicationStatus: data.applicationStatus || 'Draft',
    };
  },

  /**
   * Update a lead's onboarding progress or loan details.
   * Replaces OnboardingAPI.updateOnboarding().
   */
  updateLead: async (leadId: string, data: {
    city?: string;
    state?: string;
    pincode?: string;
    email?: string;
    mobileNumber?: string;
    annualIncome?: number;
    loanAmount?: number;
    propertyValue?: number;
    propertyType?: string;
    loanTenure?: number;
    employmentType?: string;
    propertyCity?: string;
    propertyPincode?: string;
    currentStep?: string;
    applicationStatus?: string;
    remarks?: string;
    status?: string;
  }): Promise<void> => {
    const token = await getSalesforceToken();
    const res = await fetch(`/services/apexrest/v1/leads/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = 'Failed to update lead';
      try { const errJson = JSON.parse(errText); errMsg = errJson.message || errMsg; } catch (e) {}
      throw new Error(errMsg);
    }

    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lead update failed');
  },

  /**
   * Submit a lead application — sets applicationStatus to 'Submitted'.
   * Replaces OnboardingAPI flow's final submit step.
   */
  submitLead: async (leadId: string, remarks?: string): Promise<void> => {
    return LeadAPI.updateLead(leadId, {
      applicationStatus: 'Submitted',
      currentStep: 'Submitted',
      remarks: remarks,
    });
  },
};

// ─── Payout API (Direct Salesforce — DSA_Payout__c SOQL) ─────────────────────
export const PayoutAPI = {
  /**
   * Fetch all payouts for the logged-in connector directly from Salesforce.
   * Queries DSA_Payout__c using the SF OAuth token.
   * Falls back to mock data if Salesforce is unavailable.
   */
  getPayouts: async (connectorId?: string): Promise<any[]> => {
    try {
      const token = await getSalesforceToken();

      // Build SOQL — filter by Connector__c if connectorId is provided
      const whereClause = connectorId
        ? `WHERE Connector__c = '${connectorId}'`
        : '';
      const query = encodeURIComponent(
        `SELECT Id, Month__c, Amount__c, Lead_Count__c, Status__c, Payment_Date__c, Bank_Account__c 
         FROM DSA_Payout__c ${whereClause} ORDER BY Payment_Date__c DESC`
      );

      const res = await fetch(
        `/services/data/v59.0/query?q=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error(`Payout query failed: ${res.status}`);

      const json = await res.json();
      const records = json.records || [];

      return records.map((r: any) => ({
        id: r.Id,
        month: r.Month__c || '',
        amount: r.Amount__c
          ? `₹${Number(r.Amount__c).toLocaleString('en-IN')}`
          : '₹0',
        leads: r.Lead_Count__c || 0,
        status: r.Status__c || 'Pending',
        date: r.Payment_Date__c
          ? new Date(r.Payment_Date__c).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '',
        bank: r.Bank_Account__c || '',
      }));
    } catch (e) {
      console.warn('PayoutAPI: Salesforce query failed, returning mock payouts:', e);
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

// ─── Partner API (Direct Salesforce — Connector__c SOQL) ──────────────────────
export const PartnerAPI = {
  /**
   * Get full connector profile from Connector__c.
   * Queries by Mobile__c using the Salesforce OAuth token directly.
   * Falls back to mock if Salesforce is unavailable.
   */
  getProfile: async (mobile?: string): Promise<ConnectorRecord> => {
    try {
      if (!mobile) throw new Error('Mobile number required to fetch profile');
      const profile = await ConnectorAPI.getConnectorByMobile(mobile);
      if (!profile) throw new Error('Connector record not found');
      return profile;
    } catch (e) {
      console.warn('PartnerAPI: Salesforce profile fetch failed, returning mock profile:', e);
      return {
        id: 'mock-connector-001',
        connectorId: 'DSA-08421',
        fullName: 'Rajesh Kumar',
        mobile: mobile || '9876543210',
        email: 'rajesh@example.com',
        pan: 'ABCDE1234F',
        occupation: 'Financial Advisor',
        bank: 'HDFC Bank',
        bankAccount: '****4521',
        ifsc: 'HDFC0000001',
        residentialAddress: 'Mumbai, Maharashtra',
        leadStatus: 'Active',
        status: 'Active',
      };
    }
  },
};

// ─── Connector__c API (Direct Salesforce — SOQL + SOSL) ──────────────────────
// This API talks directly to the Connector__c custom object created in SF org.
// Requires an Apex REST class on SF: /services/apexrest/v1/connector
// ─────────────────────────────────────────────────────────────────────────────

export interface ConnectorRecord {
  id?: string;
  connectorId?: string;         // ConnectorID__c
  name?: string;                // Name (Connector Name — standard field)
  fullName?: string;            // Name__c
  mobile?: string;              // Mobile__c
  alternateMobile?: string;     // Alternative_Mobile__c
  email?: string;               // Email__c
  pan?: string;                 // PAN__c
  pincode?: string;             // Pincode__c
  residentialAddress?: string;  // ResidentialAddress__c
  landmark?: string;            // Landmark__c
  officeAddress?: string;       // OfficeAddress__c
  officeLandmark?: string;      // OfficeAddresLanmark__c
  officePincode?: string;       // OfficeAddresPincode__c
  occupation?: string;          // Occupation__c
  occupationYear?: string;      // OccupationYear__c
  company?: string;             // Company__c
  companyGST?: string;          // CompanyGST__c
  companyPAN?: string;          // CompanyPAN__c
  connectorType?: string;       // ConnectorType__c
  idProofType?: string;         // IDProofType__c
  idProofNumber?: string;       // IDProofNumber__c
  idProofDocument?: string;     // IDProofDocument__c
  addressProofType?: string;    // AddressProofType__c
  addressProofNumber?: string;  // AddressProofNumber__c
  addressProofDocument?: string;// AddressProofDocument__c
  bank?: string;                // Bank__c
  bankAccount?: string;         // BankAccount__c
  nameInBank?: string;          // NameInBank__c
  ifsc?: string;                // IFSC__c
  branch?: string;              // Branch__c
  chequeDocument?: string;      // ChequeDocument__c
  mpin?: string;                // MPIN__c
  profile?: string;             // Profile__c
  tieup?: string;               // Tieup__c
  loId?: string;                // LO_Id__c
  loMobile?: string;            // LO_Mobile__c
  leadStatus?: string;          // LeadStatus__c
  status?: string;              // Status__c
  deviceId?: string;            // DeviceID__c
  notificationId?: string;      // NotificationId__c
  notificationEnable?: boolean; // NotificationEnable__c
  verifiedLO?: boolean;         // verifiedLO__c
  verifiedTermsCondition?: boolean; // verifiedTermsCondition__c
}

export const ConnectorAPI = {

  /**
   * Request OTP — generates a 6-digit OTP and stores it on the Connector__c record.
   * If no record exists for this mobile, creates a blank one first.
   */
  requestOtp: async (mobile: string): Promise<void> => {
    try {
      const token = await getSalesforceToken();
      const res = await fetch(`/services/apexrest/v1/connector/otp/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OTP request failed: ${res.status} — ${text}`);
      }
      console.log(`OTP sent to ${mobile}`);
    } catch (e) {
      console.warn('ConnectorAPI.requestOtp failed — using mock OTP (123456):', e);
    }
  },

  /**
   * Verify OTP — validates the OTP against the Connector__c record.
   * Returns the connector record + a JWT if valid.
   */
  verifyOtp: async (mobile: string, otp: string): Promise<{
    token: string;
    isNewConnector: boolean;
    connector: ConnectorRecord | null;
  }> => {
    try {
      const sfToken = await getSalesforceToken();
      const res = await fetch(`/services/apexrest/v1/connector/otp/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, otp }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OTP verify failed: ${res.status} — ${text}`);
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'OTP verification failed');

      return {
        token: json.token || sfToken,
        isNewConnector: json.isNewConnector ?? false,
        connector: json.connector || null,
      };
    } catch (e) {
      console.warn('ConnectorAPI.verifyOtp failed — using mock credentials:', e);
      return {
        token: 'mock-sf-token',
        isNewConnector: false,
        connector: {
          id: 'mock-connector-001',
          connectorId: 'DSAP12345',
          fullName: 'Test Connector',
          mobile,
          email: 'test@example.com',
          status: 'Active',
          leadStatus: 'Active',
        },
      };
    }
  },

  createConnector: async (data: ConnectorRecord): Promise<{ id: string; connectorId: string }> => {
    try {
      const token = await getSalesforceToken();

      const payload = {
        Process:            'softsignup',
        Name:               data.fullName || data.name || 'Connector',
        Mobile:             data.mobile || '',
        Email:              data.email || '',
        DeviceID:           data.deviceId || '',
        NotificationId:     data.notificationId || '',
        NotificationEnable: data.notificationEnable ?? false,
      };

      const res = await fetch(`/services/apexrest/v1/connector/signup`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`SoftSignup failed: ${res.status} — ${text}`);
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.errorMessages || 'SoftSignup failed');

      // The Apex REST response returns "Connector ID" as key
      const conId = json['Connector ID'] || json.connectorId || '';
      return { id: conId, connectorId: conId };
    } catch (e) {
      console.warn('ConnectorAPI.createConnector failed — returning mock:', e);
      return { id: 'mock-connector-001', connectorId: 'DSAP12345' };
    }
  },

  /**
   * Get Connector record by mobile number (SOQL lookup).
   */
  getConnectorByMobile: async (mobile: string): Promise<ConnectorRecord | null> => {
    try {
      const token = await getSalesforceToken();
      const query = encodeURIComponent(
        `SELECT Id, Name, Name__c, Mobile__c, Email__c, PAN__c, ConnectorID__c, ConnectorType__c, `+
        `LeadStatus__c, Status__c, ResidentialAddress__c, OfficeAddress__c, `+
        `Bank__c, BankAccount__c, IFSC__c, Branch__c, `+
        `Occupation__c, Company__c, CompanyGST__c, `+
        `NotificationEnable__c, NotificationId__c, DeviceID__c, `+
        `verifiedLO__c, verifiedTermsCondition__c, LO_Id__c, LO_Mobile__c `+
        `FROM Connector__c WHERE Mobile__c = '${mobile}' LIMIT 1`
      );

      const res = await fetch(`/services/data/v59.0/query?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`Query failed: ${res.status}`);
      const json = await res.json();
      const r = json.records?.[0];
      if (!r) return null;

      return {
        id: r.Id,
        connectorId: r.ConnectorID__c,
        name: r.Name,
        fullName: r.Name__c,
        mobile: r.Mobile__c,
        email: r.Email__c,
        pan: r.PAN__c,
        connectorType: r.ConnectorType__c,
        leadStatus: r.LeadStatus__c,
        status: r.Status__c,
        residentialAddress: r.ResidentialAddress__c,
        officeAddress: r.OfficeAddress__c,
        bank: r.Bank__c,
        bankAccount: r.BankAccount__c,
        ifsc: r.IFSC__c,
        branch: r.Branch__c,
        occupation: r.Occupation__c,
        company: r.Company__c,
        companyGST: r.CompanyGST__c,
        notificationEnable: r.NotificationEnable__c,
        notificationId: r.NotificationId__c,
        deviceId: r.DeviceID__c,
        verifiedLO: r.verifiedLO__c,
        verifiedTermsCondition: r.verifiedTermsCondition__c,
        loId: r.LO_Id__c,
        loMobile: r.LO_Mobile__c,
      };
    } catch (e) {
      console.warn('ConnectorAPI.getConnectorByMobile failed:', e);
      return null;
    }
  },

  updateConnector: async (connectorId: string, data: Partial<ConnectorRecord>): Promise<void> => {
    try {
      const token = await getSalesforceToken();

      const payload = {
        Process:                'profileupdate',
        ConnectorID:            connectorId,
        Name:                   data.fullName || data.name || '',
        Mobile:                 data.mobile || '',
        Email:                  data.email,
        PAN:                    data.pan,
        Pincode:                data.pincode,
        ResidentialAddress:     data.residentialAddress,
        Landmark:               data.landmark,
        OfficeAddress:          data.officeAddress,
        OfficeAddressLandmark:  data.officeLandmark,
        OfficeAddressPincode:   data.officePincode,
        Occupation:             data.occupation,
        OccupationYear:         data.occupationYear,
        Company:                data.company,
        CompanyGST:             data.companyGST,
        CompanyPAN:             data.companyPAN,
        ConnectorType:          data.connectorType,
        IDProofType:            data.idProofType,
        IDProofAddress:         data.idProofNumber,
        IDProofDocument:        data.idProofDocument,
        AddressProofType:       data.addressProofType,
        AddressProofNumber:     data.addressProofNumber,
        AddressProofDocument:   data.addressProofDocument,
        Bank:                   data.bank,
        BankAccount:            data.bankAccount,
        NameInBank:             data.nameInBank,
        ISFC:                   data.ifsc,
        Branch:                 data.branch,
        ChequeDocument:         data.chequeDocument,
        Profile:                data.profile,
        Tieup:                  data.tieup,
        LOMobile:               data.loMobile,
        VerifiedLO:             data.verifiedLO,
        AcceptTermsCondition:   data.verifiedTermsCondition,
        AlternativeMobile:      data.alternateMobile,
      };

      const res = await fetch(`/services/apexrest/v1/connector/signup`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Profile update failed: ${res.status} — ${text}`);
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.errorMessages || 'Profile update failed');
    } catch (e) {
      console.warn('ConnectorAPI.updateConnector failed:', e);
    }
  },

  /**
   * Sync push notification device token to Connector__c record.
   */
  updateDeviceToken: async (id: string, deviceToken: string): Promise<void> => {
    return ConnectorAPI.updateConnector(id, {
      notificationId: deviceToken,
      notificationEnable: true,
    });
  },
};
