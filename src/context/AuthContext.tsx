import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Lead {
  id: string;
  name: string;
  product: string;
  amount: string;
  status: 'Processing' | 'Approved' | 'Pending' | 'Disbursed' | 'Rejected' | string;
  color: string;
  city: string;
  date: string;
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
};

const DEFAULT_LEADS: Lead[] = [
  { id: 'L001', name: 'Rahul Sharma',  product: 'Home Loan',  amount: '₹45L',  status: 'Processing', color: '#DE1F26', city: 'Mumbai',    date: '10 Jun 2026' },
  { id: 'L002', name: 'Priya Nair',    product: 'LAP',        amount: '₹28L',  status: 'Approved',   color: '#2E7D32', city: 'Pune',      date: '08 Jun 2026' },
  { id: 'L003', name: 'Amir Khan',     product: 'MSME Loan',  amount: '₹12L',  status: 'Pending',    color: '#EF6C00', city: 'Nagpur',    date: '07 Jun 2026' },
  { id: 'L004', name: 'Sunita Verma',  product: 'Home Loan',  amount: '₹62L',  status: 'Disbursed',  color: '#FBC02D', city: 'Delhi',     date: '05 Jun 2026' },
  { id: 'L005', name: 'Rajesh Patel',  product: 'PL',         amount: '₹5L',   status: 'Rejected',   color: '#C62828', city: 'Ahmedabad', date: '03 Jun 2026' },
  { id: 'L006', name: 'Meena Iyer',    product: 'Home Loan',  amount: '₹38L',  status: 'Approved',   color: '#1565C0', city: 'Bengaluru', date: '01 Jun 2026' },
  { id: 'L007', name: 'Deepak Gupta',  product: 'LAP',        amount: '₹75L',  status: 'Processing', color: '#6A1B9A', city: 'Jaipur',    date: '30 May 2026' },
  { id: 'L008', name: 'Kavita Singh',  product: 'Home Loan',  amount: '₹22L',  status: 'Disbursed',  color: '#00695C', city: 'Lucknow',   date: '28 May 2026' },
  { id: 'L009', name: 'Arjun Mehta',   product: 'MSME Loan',  amount: '₹18L',  status: 'Pending',    color: '#E65100', city: 'Surat',     date: '26 May 2026' },
  { id: 'L010', name: 'Pooja Reddy',   product: 'Home Loan',  amount: '₹51L',  status: 'Approved',   color: '#AD1457', city: 'Hyderabad', date: '24 May 2026' },
];

const DEFAULT_PAYOUTS: Payout[] = [
  { id: 'P001', month: 'Jun 2026', amount: '₹84,200',    leads: 5, status: 'Pending', date: '15 Jun 2026', bank: 'HDFC ***4521' },
  { id: 'P002', month: 'May 2026', amount: '₹1,12,400',  leads: 6, status: 'Paid',    date: '15 May 2026', bank: 'HDFC ***4521' },
  { id: 'P003', month: 'Apr 2026', amount: '₹84,200',    leads: 4, status: 'Paid',    date: '15 Apr 2026', bank: 'HDFC ***4521' },
  { id: 'P004', month: 'Mar 2026', amount: '₹68,500',    leads: 3, status: 'Paid',    date: '15 Mar 2026', bank: 'HDFC ***4521' },
  { id: 'P005', month: 'Feb 2026', amount: '₹45,000',    leads: 2, status: 'Paid',    date: '15 Feb 2026', bank: 'HDFC ***4521' },
];

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  phoneNumber: string | null;
  setPhoneNumber: (phone: string | null) => void;
  verifyOtp: () => void;
  logout: () => void;
  // Dynamic Leads & Payouts State
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'color' | 'date'>) => void;
  payouts: Payout[];
  // Shared Onboarding state
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  // Device & App Settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  darkModeEnabled: boolean;
  setDarkModeEnabled: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  // Expanded states
  const [leads, setLeads] = useState<Lead[]>(DEFAULT_LEADS);
  const [payouts] = useState<Payout[]>(DEFAULT_PAYOUTS);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(DEFAULT_ONBOARDING);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const verifyOtp = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPhoneNumber(null);
    setOnboardingData(DEFAULT_ONBOARDING);
  };

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const addLead = (newLead: Omit<Lead, 'id' | 'color' | 'date'>) => {
    const randomColors = ['#DE1F26', '#2E7D32', '#EF6C00', '#FBC02D', '#1565C0', '#6A1B9A'];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    const leadId = `L${String(leads.length + 1).padStart(3, '0')}`;
    const today = new Date();
    const formattedDate = `${today.getDate()} ${today.toLocaleString('en-US', { month: 'short' })} ${today.getFullYear()}`;

    const lead: Lead = {
      ...newLead,
      id: leadId,
      color: randomColor,
      date: formattedDate,
    };

    setLeads((prev) => [lead, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        phoneNumber,
        setPhoneNumber,
        verifyOtp,
        logout,
        leads,
        addLead,
        payouts,
        onboardingData,
        updateOnboardingData,
        notificationsEnabled,
        setNotificationsEnabled,
        darkModeEnabled,
        setDarkModeEnabled,
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
