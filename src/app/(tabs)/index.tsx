import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { 
    logout, 
    leads, 
    onboardingData, 
    notificationsEnabled, 
    setNotificationsEnabled 
  } = useAuth();

  const [hideBanner, setHideBanner] = React.useState(false);

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

  const handleEnableNotifications = () => {
    setNotificationsEnabled(true);
    Alert.alert('Notifications Enabled', 'You will now receive instant push updates on your lead statuses!');
    setHideBanner(true);
  };

  const handleRecentLeadPress = (id: string) => {
    router.push({
      pathname: '/(tabs)/lead/[id]',
      params: { id }
    } as any);
  };

  const showRecentLeads = leads.slice(0, 5);

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'sanctioned') return styles.badgeSuccess;
    if (s === 'disbursed') return styles.badgeBlue;
    if (s === 'pending') return styles.badgeWarning;
    if (s === 'rejected') return styles.badgeDanger;
    return styles.badgeWarning; // processing / other
  };

  const getStatusText = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'sanctioned') return 'Sanctioned';
    if (s === 'disbursed') return 'Disbursed';
    if (s === 'pending') return 'Pending';
    if (s === 'rejected') return 'Rejected';
    return 'Processing';
  };

  const getStatusTextStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'sanctioned') return styles.badgeSuccessText;
    if (s === 'disbursed') return styles.badgeBlueText;
    if (s === 'pending') return styles.badgeWarningText;
    if (s === 'rejected') return styles.badgeDangerText;
    return styles.badgeWarningText;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header Hero Area */}
          <View style={styles.hero}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.greeting}>Good Evening, <Text style={styles.greetingHighlight}>{onboardingData.fullName || 'Rajesh'}!</Text></Text>
                <Text style={styles.greetingSub}>DSA Partner · Code: DSA-08421</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)} style={styles.avatar}>
                <Text style={styles.avatarText}>RK</Text>
              </TouchableOpacity>
            </View>

            {/* KYC Status Banner */}
            <View style={styles.statusBanner}>
              <View style={styles.statusDot} />
              <View>
                <Text style={styles.statusTitle}>KYC Approved</Text>
                <Text style={styles.statusSub}>Your account is active and verified</Text>
              </View>
            </View>

            {/* Push Notification Banner */}
            {!notificationsEnabled && !hideBanner && (
              <View style={styles.notificationBanner}>
                <View style={styles.notificationBannerContent}>
                  <MaterialCommunityIcons name="bell-ring-outline" size={20} color="#1E3A8A" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>Enable Push Notifications</Text>
                    <Text style={styles.notificationSub}>Stay updated on your lead statuses</Text>
                  </View>
                </View>
                <View style={styles.notificationActions}>
                  <TouchableOpacity onPress={() => setHideBanner(true)}>
                    <Text style={styles.notificationDismiss}>Later</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.notificationEnableBtn} onPress={handleEnableNotifications}>
                    <Text style={styles.notificationEnableText}>Enable Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#DE1F26' }]}>{leads.length}</Text>
                <Text style={styles.statLabel}>Leads</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>₹4.2Cr</Text>
                <Text style={styles.statLabel}>Disbursed</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>₹84K</Text>
                <Text style={styles.statLabel}>Earned</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/new-lead' as any)}>
                <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(222,31,38,0.1)' }]}>
                  <MaterialCommunityIcons name="plus" size={24} color="#DE1F26" />
                </View>
                <Text style={styles.actionLabel}>New Lead</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/leads')}>
                <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(0,212,255,0.12)' }]}>
                  <MaterialCommunityIcons name="file-document-outline" size={24} color="#00D4FF" />
                </View>
                <Text style={styles.actionLabel}>My Leads</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/payouts')}>
                <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(0,229,160,0.12)' }]}>
                  <MaterialCommunityIcons name="cash-multiple" size={24} color="#00E5A0" />
                </View>
                <Text style={styles.actionLabel}>Payouts</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Desktop Admin', 'Opening India Shelter Admin Dashboard view...')}>
                <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(255,184,48,0.12)' }]}>
                  <MaterialCommunityIcons name="monitor" size={24} color="#FFB830" />
                </View>
                <Text style={styles.actionLabel}>Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Commission Card */}
          <View style={styles.section}>
            <View style={styles.payoutCard}>
              <View style={styles.payoutHeader}>
                <View>
                  <Text style={styles.payoutLabel}>NEXT PAYOUT</Text>
                  <Text style={styles.payoutAmount}>₹84,200</Text>
                  <Text style={styles.payoutDate}>Due on 15 Jun 2026</Text>
                </View>
                <MaterialCommunityIcons name="currency-inr" size={32} color="#10B981" />
              </View>
              <View style={styles.payoutMetrics}>
                <View>
                  <Text style={styles.metricLabel}>This Month</Text>
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>₹1.2L</Text>
                </View>
                <View>
                  <Text style={styles.metricLabel}>Pending</Text>
                  <Text style={[styles.metricValue, { color: '#F59E0B' }]}>₹42K</Text>
                </View>
                <View>
                  <Text style={styles.metricLabel}>YTD</Text>
                  <Text style={[styles.metricValue, { color: '#06B6D4' }]}>₹8.4L</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Leads */}
          <View style={styles.section}>
            <View style={styles.recentLeadsHeader}>
              <Text style={styles.sectionTitle}>Recent Leads</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/leads')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {showRecentLeads.map((lead) => (
              <TouchableOpacity 
                key={lead.id} 
                style={styles.leadCard} 
                onPress={() => handleRecentLeadPress(lead.id)}
              >
                <View style={styles.leadHeader}>
                  <Text style={styles.leadName}>{lead.name}</Text>
                  <View style={getStatusStyle(lead.status)}>
                    <Text style={getStatusTextStyle(lead.status)}>{getStatusText(lead.status)}</Text>
                  </View>
                </View>
                <View style={styles.leadDetailsRow}>
                  <Text style={styles.leadDetailText}>{lead.id}</Text>
                  <Text style={styles.leadDetailText}>·</Text>
                  <Text style={styles.leadDetailText}>{lead.amount}</Text>
                  <Text style={styles.leadDetailText}>·</Text>
                  <Text style={styles.leadDetailText}>{lead.product}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={{ height: 60 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    padding: 24,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3134',
  },
  greetingHighlight: {
    color: '#DE1F26',
  },
  greetingSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    backgroundColor: '#DE1F26',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  statusSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  notificationBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  notificationBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  notificationSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  notificationDismiss: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  notificationEnableBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  notificationEnableText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  section: {
    padding: 24,
    paddingBottom: 0,
  },
  recentLeadsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3134',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DE1F26',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    alignItems: 'center',
    width: '23%',
  },
  actionIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(222,31,38,0.1)',
    padding: 20,
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  payoutLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  payoutAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10B981',
  },
  payoutDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  payoutMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leadName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3134',
  },
  badgeSuccess: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  badgeBlue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeBlueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  badgeWarning: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  badgeWarningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  badgeDanger: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  badgeDangerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  leadDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leadDetailText: {
    fontSize: 12,
    color: '#64748B',
  },
});
