import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, Animated, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { TopNav } from '../../../components/ui/TopNav';
import { sendWhatsAppMessage, buildLeadStatusMessage } from '../../../services/notifications';

// Progress nodes pipeline
const STEPS = ['Lead Created', 'Docs Verified', 'Underwriting', 'Sanctioned', 'Disbursed'];

export default function LeadDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { leads, onboardingData } = useAuth();

  // Animation hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Find the exact lead from our global context state
  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <SafeAreaView style={styles.container}>
        <TopNav title="Lead Details" />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#DC2626" style={{ marginBottom: 8 }} />
          <Text style={styles.errorText}>Lead not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get active step index based on lead status
  const getActiveStep = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'rejected') return 0; // special case
    if (s === 'pending') return 0;
    if (s === 'processing') return 2; // Underwriting
    if (s === 'approved' || s === 'sanctioned') return 3; // Sanctioned
    if (s === 'disbursed') return 4; // Disbursed
    return 1;
  };

  const activeStep = getActiveStep(lead.status);
  const initials = lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const getBadgeColors = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'sanctioned') return { bg: '#ECFDF5', text: '#059669', border: '#D1FAE5' };
    if (s === 'disbursed') return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    if (s === 'pending') return { bg: '#FFFBEB', text: '#D97706', border: '#FEF3C7' };
    if (s === 'rejected') return { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2' };
    return { bg: '#F8F9FA', text: '#475569', border: '#E2E8F0' }; // processing
  };

  const badge = getBadgeColors(lead.status);

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Lead Details" />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Deviation Banner — shown when RCU or CIBIL is not verified */}
          {lead.hasDeviation && (
            <View style={styles.deviationBanner}>
              <MaterialCommunityIcons name="alert" size={20} color="#B91C1C" style={{ marginRight: 10, marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.deviationTitle}>Deviation Raised</Text>
                <Text style={styles.deviationText}>
                  {lead.deviationReason || 'RCU/CIBIL verification pending — disbursement is blocked until resolved.'}
                </Text>
              </View>
            </View>
          )}

          {/* Lead Hero Area */}
          <View style={styles.hero}>
            <View style={[styles.avatar, { backgroundColor: lead.color || '#DE1F26' }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name}>{lead.name}</Text>
            <Text style={styles.subtitle}>ID: {lead.id}</Text>
            <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>{lead.status}</Text>
            </View>

            {/* RCU / CIBIL chips */}
            <View style={styles.chipRow}>
              <View style={[styles.chip, lead.rcuVerified ? styles.chipSuccess : styles.chipWarning]}>
                <MaterialCommunityIcons
                  name={lead.rcuVerified ? 'shield-check' : 'shield-alert'}
                  size={12}
                  color={lead.rcuVerified ? '#065F46' : '#92400E'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, lead.rcuVerified ? styles.chipTextSuccess : styles.chipTextWarning]}>
                  RCU {lead.rcuVerified ? 'Verified' : 'Pending'}
                </Text>
              </View>
              <View style={[styles.chip, lead.cibilVerified ? styles.chipSuccess : styles.chipWarning]}>
                <MaterialCommunityIcons
                  name={lead.cibilVerified ? 'check-decagram' : 'clock-alert-outline'}
                  size={12}
                  color={lead.cibilVerified ? '#065F46' : '#92400E'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, lead.cibilVerified ? styles.chipTextSuccess : styles.chipTextWarning]}>
                  CIBIL {lead.cibilVerified ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* WhatsApp Contact Button */}
          {lead.mobile && (
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={() =>
                sendWhatsAppMessage(
                  lead.mobile!,
                  buildLeadStatusMessage({
                    dsaName: onboardingData.fullName || 'Partner',
                    leadName: lead.name,
                    product: lead.product,
                    status: lead.status,
                  })
                )
              }
              id={`whatsapp-lead-${lead.id}`}
            >
              <MaterialCommunityIcons name="whatsapp" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.whatsappBtnText}>Message on WhatsApp</Text>
            </TouchableOpacity>
          )}

          {/* Lead Metrics Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Loan Summary</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Product</Text>
              <Text style={styles.value}>{lead.product}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Amount</Text>
              <Text style={[styles.value, { color: '#DE1F26' }]}>{lead.amount}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{lead.city}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Mobile Number</Text>
              <Text style={styles.value}>{lead.mobile || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Created On</Text>
              <Text style={styles.value}>{lead.date || 'N/A'}</Text>
            </View>
          </View>

          {/* Pipeline Progress Tracker */}
          <View style={styles.trackerContainer}>
            <Text style={styles.trackerTitle}>Status Pipeline</Text>
            
            <View style={styles.pipeline}>
              {STEPS.map((step, idx) => {
                const isCompleted = idx <= activeStep;
                const isCurrent = idx === activeStep;
                const showLine = idx < STEPS.length - 1;

                return (
                  <View key={step} style={styles.stepRow}>
                    {/* Left node indicators */}
                    <View style={styles.nodeColumn}>
                      <View style={[
                        styles.circle,
                        isCompleted && styles.circleCompleted,
                        isCurrent && styles.circleCurrent
                      ]}>
                        <Text style={[
                          styles.circleText,
                          isCompleted && styles.circleTextCompleted
                        ]}>
                          {isCompleted ? '✓' : idx + 1}
                        </Text>
                      </View>
                      {showLine && (
                        <View style={[
                          styles.line,
                          idx < activeStep && styles.lineCompleted
                        ]} />
                      )}
                    </View>

                    {/* Right label descriptions */}
                    <View style={styles.labelColumn}>
                      <Text style={[
                        styles.stepLabel,
                        isCompleted && styles.stepLabelCompleted,
                        isCurrent && styles.stepLabelCurrent
                      ]}>
                        {step}
                      </Text>
                      <Text style={styles.stepSub}>
                        {idx === 0 && 'Lead created in sourcing platform'}
                        {idx === 1 && (isCompleted ? 'All mandatory KYC/Income files validated' : 'Pending bank/KYC uploads')}
                        {idx === 2 && (isCompleted ? 'Passed credit screening & automated rule checks' : 'Underwriting review pipeline')}
                        {idx === 3 && (isCompleted ? 'Sanction letter generated and sent' : 'Generating formal approval letter')}
                        {idx === 4 && (isCompleted ? 'Disbursement complete' : 'Executing loan documentation & payouts')}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, flexGrow: 1 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  // Deviation banner
  deviationBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#FCA5A5',
    borderRadius: 14, padding: 14, marginBottom: 16,
  },
  deviationTitle: { fontSize: 13, fontWeight: '800', color: '#B91C1C', marginBottom: 3 },
  deviationText: { fontSize: 12, color: '#7F1D1D', lineHeight: 17 },
  // Hero
  hero: { alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, marginBottom: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  name: { fontSize: 18, fontWeight: '800', color: '#2D3134', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  badge: { borderWidth: 1, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  // RCU/CIBIL chips
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1 },
  chipSuccess: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  chipWarning: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  chipText: { fontSize: 10, fontWeight: '700' },
  chipTextSuccess: { color: '#065F46' },
  chipTextWarning: { color: '#92400E' },
  // WhatsApp button
  whatsappBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#25D366', borderRadius: 14, paddingVertical: 14, marginBottom: 16,
    shadowColor: '#25D366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  whatsappBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  // Card
  card: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 16, overflow: 'hidden', marginBottom: 24,
  },
  cardHeader: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  label: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  value: { fontSize: 14, color: '#2D3134', fontWeight: '700' },
  trackerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  trackerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D3134',
    marginBottom: 20,
  },
  pipeline: {
    flexDirection: 'column',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  nodeColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 28,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  circleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  circleCurrent: {
    borderColor: '#DE1F26',
    borderWidth: 3,
  },
  circleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  circleTextCompleted: {
    color: '#FFFFFF',
  },
  line: {
    width: 2,
    height: 60,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
    marginBottom: -6,
  },
  lineCompleted: {
    backgroundColor: '#10B981',
  },
  labelColumn: {
    flex: 1,
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  stepLabelCompleted: {
    color: '#2D3134',
  },
  stepLabelCurrent: {
    color: '#DE1F26',
  },
  stepSub: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
});
