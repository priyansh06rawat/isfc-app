import { Linking } from 'react-native';
import { BASE_URL } from './api';
import { getToken } from './storage';

// ─── Email Notification ────────────────────────────────────────────────────────

/**
 * Sends a status update email to the DSA at each onboarding stage.
 * Falls back silently when backend is unavailable.
 */
export async function sendStatusEmail(params: {
  to: string;
  dsaName: string;
  stage: string;
  dsaCode?: string;
  extraMessage?: string;
}): Promise<void> {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/api/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        to: params.to,
        subject: `DSA Onboarding Update — ${params.stage}`,
        body: `Dear ${params.dsaName},\n\nYour DSA onboarding is progressing.\nCurrent Stage: ${params.stage}\n${params.dsaCode ? `DSA Code: ${params.dsaCode}\n` : ''}${params.extraMessage || ''}\n\nRegards,\nIndia Shelter Finance`,
      }),
    });
    if (!res.ok) throw new Error(`Email API ${res.status}`);
  } catch (e) {
    console.warn('[Notifications] sendStatusEmail failed (backend may be offline):', e);
  }
}

// ─── WhatsApp Communication ────────────────────────────────────────────────────

/**
 * Opens WhatsApp with a pre-filled message to the given phone number.
 * Uses the whatsapp:// deep-link scheme. Falls back to wa.me URL.
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const encoded = encodeURIComponent(message);
  const waDeepLink = `whatsapp://send?phone=${fullPhone}&text=${encoded}`;
  const waWebLink = `https://wa.me/${fullPhone}?text=${encoded}`;

  try {
    const supported = await Linking.canOpenURL(waDeepLink);
    if (supported) {
      await Linking.openURL(waDeepLink);
    } else {
      await Linking.openURL(waWebLink);
    }
  } catch (e) {
    console.warn('[Notifications] WhatsApp open failed:', e);
  }
}

/**
 * Builds a standard lead status update WhatsApp message for a DSA.
 */
export function buildLeadStatusMessage(params: {
  dsaName: string;
  leadName: string;
  product: string;
  status: string;
  dsaCode?: string;
}): string {
  return (
    `Hello ${params.dsaName},\n\n` +
    `Your lead *${params.leadName}* (${params.product}) has been updated.\n` +
    `New Status: *${params.status}*\n` +
    (params.dsaCode ? `Your DSA Code: *${params.dsaCode}*\n` : '') +
    `\nFor queries, contact your India Shelter Channel Manager.\n\n` +
    `_India Shelter Finance Corporation_`
  );
}

// ─── Business Manager Alert ────────────────────────────────────────────────────

/**
 * Sends an alert to the Business Manager when a DSA has missing documents.
 * Falls back silently when backend is unavailable.
 */
export async function notifyBusinessManager(params: {
  dsaName: string;
  dsaPhone: string;
  missingDocs: string[];
}): Promise<void> {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/api/notifications/bm-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        dsaName: params.dsaName,
        dsaPhone: params.dsaPhone,
        missingDocuments: params.missingDocs,
        message: `DSA ${params.dsaName} (${params.dsaPhone}) has not uploaded the following documents: ${params.missingDocs.join(', ')}. Please follow up.`,
      }),
    });
    if (!res.ok) throw new Error(`BM Alert API ${res.status}`);
  } catch (e) {
    console.warn('[Notifications] notifyBusinessManager failed (backend may be offline):', e);
  }
}

// ─── Push Notification Trigger ─────────────────────────────────────────────────

/**
 * Sends a push notification to role-based managers (Channel Manager / ABM / RBM).
 * Requires push tokens to be registered on the backend.
 */
export async function notifyManagers(params: {
  event: 'new_dsa_onboarded' | 'lead_created' | 'deviation_raised' | 'doc_missing';
  roles: Array<'CHANNEL_MANAGER' | 'ABM' | 'RBM'>;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<void> {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/api/notifications/push-managers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        event: params.event,
        roles: params.roles,
        title: params.title,
        body: params.body,
        data: params.data || {},
      }),
    });
    if (!res.ok) throw new Error(`Push API ${res.status}`);
  } catch (e) {
    console.warn('[Notifications] notifyManagers push failed (backend may be offline):', e);
  }
}
