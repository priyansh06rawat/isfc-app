import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI, LeadAPI, PayoutAPI, PartnerAPI } from '../services/api';
import { saveToken, getToken, removeToken, savePartnerData, getPartnerData, clearPartnerData } from '../services/storage';

export interface Lead {
  id: string;
  name: string;
  product: string;
  amount: string;
  status: 'Processing' | 'Approved' | 'Pending' | 'Disbursed' | 'Rejected' | string;
  color: string;
  city: string;
  date: string;
  mobile?: string;
  employment?: string;
  cibil?: string;
  // RCU & CIBIL deviation tracking
  rcuVerified?: boolean;
  cibilVerified?: boolean;
  hasDeviation?: boolean;
  deviationReason?: string;
}

export interface Payout {
  id: string;
  month: string;
  amount: string;
  leads: number;
  status: 'Pending' | 'Paid' | string;
  date: string;
  bank: string;
}

export interface OnboardingData {
  partnerType: string | null;
  fullName: string;
  dob: string;
  gender: string;
  email: string;
  address: string;
  city: string;
  pin: string;
  state: string;
  occupation: string;
  experience: string;
  product: string;
  volume: string;
  pan: string;
  isPanVerified: boolean;
  panUploaded: boolean;
  aadhaarLast4: string;
  isAadhaarVerified: boolean;
  aadhaarFrontUploaded: boolean;
  aadhaarBackUploaded: boolean;
  isSelfieCaptured: boolean;
  businessDocType: string;
  gstin: string;
  businessName: string;
  isBusinessVerified: boolean;
  businessDocUploaded: boolean;
  accName: string;
  accNumber: string;
  ifsc: string;
  accType: string;
  isBankVerified: boolean;
  bankDocUploaded: boolean;
  isAgreementSigned: boolean;
  dsaCertificateUploaded: boolean;
  // Office address / Udhyam MSME
  officeAddress: string;
  officeCity: string;
  officePin: string;
  officeState: string;
  udhyamNumber: string;
  isUdhyamVerified: boolean;
  msmeCertUploaded: boolean;
  // Banking statement (3/6 months)
  bankStatementMonths: '3' | '6';
  bankingStatementUploaded: boolean;
  // ITR details
  itrYear: string;
  itrIncome: string;
  itrUploaded: boolean;
  // Enrollment letter (other DSA company)
  enrollmentCompany: string;
  enrollmentDsaCode: string;
  enrollmentLetterUploaded: boolean;
  enrollmentSkipped: boolean;
}

const DEFAULT_ONBOARDING: OnboardingData = {
  partnerType: null,
  fullName: '',
  dob: '',
  gender: '',
  email: '',
  address: '',
  city: '',
  pin: '',
  state: '',
  occupation: 'Financial Advisor',
  experience: '',
  product: 'Home Loan',
  volume: '',
  pan: '',
  isPanVerified: false,
  panUploaded: false,
  aadhaarLast4: '',
  isAadhaarVerified: false,
  aadhaarFrontUploaded: false,
  aadhaarBackUploaded: false,
  isSelfieCaptured: false,
  businessDocType: 'GST Certificate',
  gstin: '',
  businessName: '',
  isBusinessVerified: false,
  businessDocUploaded: false,
  accName: '',
  accNumber: '',
  ifsc: '',
  accType: 'Savings Account',
  isBankVerified: false,
  bankDocUploaded: false,
  isAgreementSigned: false,
  dsaCertificateUploaded: false,
  // Office / Udhyam
  officeAddress: '',
  officeCity: '',
  officePin: '',
  officeState: '',
  udhyamNumber: '',
  isUdhyamVerified: false,
  msmeCertUploaded: false,
  // Banking statement
  bankStatementMonths: '6',
  bankingStatementUploaded: false,
  // ITR
  itrYear: '',
  itrIncome: '',
  itrUploaded: false,
  // Enrollment letter
  enrollmentCompany: '',
  enrollmentDsaCode: '',
  enrollmentLetterUploaded: false,
  enrollmentSkipped: false,
};

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isApiLoading: boolean;
  phoneNumber: string | null;
  setPhoneNumber: (phone: string | null) => void;
  verifyOtp: (otp: string) => Promise<{ isNewPartner: boolean }>;
  logout: () => void;
  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'color' | 'date'>) => Promise<void>;
  fetchLeads: () => Promise<void>;
  // Payouts
  payouts: Payout[];
  fetchPayouts: () => Promise<void>;
  // Onboarding
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  submitRegistration: () => Promise<void>;
  // DSA Code
  dsaCode: string | null;
  // Settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  darkModeEnabled: boolean;
  setDarkModeEnabled: (enabled: boolean) => void;
  // Push token
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(DEFAULT_ONBOARDING);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [dsaCode, setDsaCode] = useState<string | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // On mount: check for stored JWT → auto-login
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();
        if (token) {
          const partnerData = await getPartnerData();
          if (partnerData) {
            const p = partnerData as any;
            setOnboardingData((prev) => ({
              ...prev,
              fullName: p.name || '',
              email: p.email || '',
              city: p.city || '',
              pan: p.pan || '',
            }));
          }
          setIsAuthenticated(true);
          // Load data in background
          fetchLeadsInBackground();
          fetchPayoutsInBackground();
        }
      } catch (e) {
        console.warn('Session restore failed:', e);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const fetchLeadsInBackground = async () => {
    try {
      const data = await LeadAPI.getLeads();
      setLeads(data);
    } catch (e) {
      console.warn('Failed to fetch leads:', e);
    }
  };

  const fetchPayoutsInBackground = async () => {
    try {
      const data = await PayoutAPI.getPayouts();
      setPayouts(data);
    } catch (e) {
      console.warn('Failed to fetch payouts:', e);
    }
  };

  const fetchLeads = async () => {
    setIsApiLoading(true);
    try {
      const data = await LeadAPI.getLeads();
      setLeads(data);
    } catch (e) {
      console.warn('fetchLeads error:', e);
    } finally {
      setIsApiLoading(false);
    }
  };

  const fetchPayouts = async () => {
    setIsApiLoading(true);
    try {
      const data = await PayoutAPI.getPayouts();
      setPayouts(data);
    } catch (e) {
      console.warn('fetchPayouts error:', e);
    } finally {
      setIsApiLoading(false);
    }
  };

  /**
   * Verify OTP — calls the backend, saves JWT, loads profile + leads + payouts.
   * Returns { isNewPartner } so the caller can route to registration if needed.
   */
  const verifyOtp = async (otp: string): Promise<{ isNewPartner: boolean }> => {
    if (!phoneNumber) throw new Error('Phone number not set');

    setIsApiLoading(true);
    try {
      // Step 1: Request OTP first (in case screen navigated without calling it)
      try {
        await AuthAPI.requestOtp(phoneNumber);
      } catch (_) {
        // Ignore — OTP may have been requested already on the login screen
      }

      // Step 2: Verify OTP
      const result = await AuthAPI.verifyOtp(phoneNumber, otp);

      // Step 3: Save JWT
      await saveToken(result.token);

      // Step 4: If existing partner, save profile data
      if (!result.isNewPartner && result.partner) {
        await savePartnerData(result.partner);
        const p = result.partner;
        setOnboardingData((prev) => ({
          ...prev,
          fullName: p.name || '',
          email: p.email || '',
          city: p.city || '',
          pan: p.pan || '',
        }));
        setIsAuthenticated(true);

        // Load leads + payouts asynchronously
        fetchLeadsInBackground();
        fetchPayoutsInBackground();
      }

      return { isNewPartner: result.isNewPartner };
    } finally {
      setIsApiLoading(false);
    }
  };

  /**
   * Submit registration after KYC onboarding — calls backend to create partner in Salesforce.
   */
  const submitRegistration = async () => {
    setIsApiLoading(true);
    try {
      const result = await AuthAPI.register({
        ...onboardingData,
        phone: phoneNumber || '',
      });
      // Save new JWT (registration issues a new token)
      await saveToken(result.token);
      // Store DSA code returned by backend (same-day generation)
      if (result.partnerCode) {
        setDsaCode(result.partnerCode);
      }
      setIsAuthenticated(true);

      // Load initial data
      fetchLeadsInBackground();
      fetchPayoutsInBackground();
    } finally {
      setIsApiLoading(false);
    }
  };

  const logout = async () => {
    await removeToken();
    await clearPartnerData();
    setIsAuthenticated(false);
    setPhoneNumber(null);
    setLeads([]);
    setPayouts([]);
    setOnboardingData(DEFAULT_ONBOARDING);
    setDsaCode(null);
    setPushToken(null);
  };

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const addLead = async (newLead: Omit<Lead, 'id' | 'color' | 'date'>) => {
    setIsApiLoading(true);
    try {
      const created = await LeadAPI.createLead({
        name: newLead.name,
        mobile: newLead.mobile || '',
        employment: newLead.employment || '',
        product: newLead.product,
        amount: parseLoanAmount(newLead.amount),
        location: newLead.city,
      });
      // Prepend to local state
      setLeads((prev) => [created, ...prev]);
    } catch (e) {
      // Fallback: add locally if API fails
      const randomColors = ['#DE1F26', '#2E7D32', '#EF6C00', '#FBC02D', '#1565C0', '#6A1B9A'];
      const fallback: Lead = {
        ...newLead,
        id: `L${String(leads.length + 1).padStart(3, '0')}`,
        color: randomColors[Math.floor(Math.random() * randomColors.length)],
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      setLeads((prev) => [fallback, ...prev]);
    } finally {
      setIsApiLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isApiLoading,
        phoneNumber,
        setPhoneNumber,
        verifyOtp,
        logout,
        leads,
        addLead,
        fetchLeads,
        payouts,
        fetchPayouts,
        onboardingData,
        updateOnboardingData,
        submitRegistration,
        dsaCode,
        notificationsEnabled,
        setNotificationsEnabled,
        darkModeEnabled,
        setDarkModeEnabled,
        pushToken,
        setPushToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper: parse formatted amount string back to number for API
function parseLoanAmount(amountStr: string): number {
  if (!amountStr) return 0;
  const clean = amountStr.replace(/[₹,\s]/g, '');
  if (clean.endsWith('Cr')) return parseFloat(clean) * 10_000_000;
  if (clean.endsWith('L')) return parseFloat(clean) * 100_000;
  return parseInt(clean) || 0;
}
