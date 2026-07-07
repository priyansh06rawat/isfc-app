import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert, Animated, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { TouchableScale } from '../../components/ui/TouchableScale';

export default function DashboardScreen() {
  const { 
    logout, 
    leads, 
    payouts,
    onboardingData,
    connectorRecord,
    dsaCode,
    notificationsEnabled, 
    setNotificationsEnabled,
    darkModeEnabled
  } = useAuth();

  const [hideBanner, setHideBanner] = React.useState(false);
  const [showEmpanelment, setShowEmpanelment] = React.useState(false);

  // Animation hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openBottomSheet = () => {
    setShowEmpanelment(true);
    Animated.spring(sheetAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start(() => {
      setShowEmpanelment(false);
    });
  };

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
    <SafeAreaView style={[styles.container, darkModeEnabled && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header Hero Area */}
          <View style={[styles.hero, darkModeEnabled && styles.heroDark]}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={[styles.greeting, darkModeEnabled && styles.textDark]}>Good Evening, <Text style={styles.greetingHighlight}>{connectorRecord?.fullName || onboardingData.fullName || ''}!</Text></Text>
                <Text style={[styles.greetingSub, darkModeEnabled && styles.textMutedDark]}>DSA Partner · Code: {dsaCode || connectorRecord?.connectorId || '—'}</Text>
              </View>
              <TouchableScale onPress={openBottomSheet} style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(connectorRecord?.fullName || onboardingData.fullName || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?'}
                </Text>
              </TouchableScale>
            </View>

            {/* KYC Status Banner */}
            <TouchableScale onPress={openBottomSheet} style={{ width: '100%', marginBottom: 16 }}>
              <View style={[styles.statusBanner, darkModeEnabled && { backgroundColor: 'rgba(16, 185, 129, 0.04)', borderColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <View style={styles.statusDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusTitle}>KYC Approved</Text>
                  <Text style={[styles.statusSub, darkModeEnabled && styles.textMutedDark]}>Your account is active and verified · Tap to view details</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#059669" />
              </View>
            </TouchableScale>

            {/* Push Notification Banner */}
            {!notificationsEnabled && !hideBanner && (
              <View style={[styles.notificationBanner, darkModeEnabled && { backgroundColor: 'rgba(37, 99, 235, 0.05)', borderColor: 'rgba(37, 99, 235, 0.15)' }]}>
                <View style={styles.notificationBannerContent}>
                  <MaterialCommunityIcons name="bell-ring-outline" size={20} color={darkModeEnabled ? '#60A5FA' : '#1E3A8A'} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notificationTitle, darkModeEnabled && { color: '#60A5FA' }]}>Enable Push Notifications</Text>
                    <Text style={[styles.notificationSub, darkModeEnabled && styles.textMutedDark]}>Stay updated on your lead statuses</Text>
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
              <TouchableScale style={[styles.statBox, { borderTopColor: '#DE1F26', borderTopWidth: 3 }, darkModeEnabled && styles.cardDark]} onPress={() => router.push('/(tabs)/leads')}>
                <Text style={[styles.statValue, { color: '#DE1F26' }]}>{leads.length}</Text>
                <Text style={[styles.statLabel, darkModeEnabled && styles.textMutedDark]}>Leads</Text>
              </TouchableScale>
              <TouchableScale style={[styles.statBox, { borderTopColor: '#10B981', borderTopWidth: 3 }, darkModeEnabled && styles.cardDark]} onPress={() => router.push('/(tabs)/payouts')}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  ₹{payouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (parseFloat(String(p.amount).replace(/[₹,]/g, '')) || 0), 0).toLocaleString('en-IN') || '0'}
                </Text>
                <Text style={[styles.statLabel, darkModeEnabled && styles.textMutedDark]}>Disbursed</Text>
              </TouchableScale>
              <TouchableScale style={[styles.statBox, { borderTopColor: '#F59E0B', borderTopWidth: 3 }, darkModeEnabled && styles.cardDark]} onPress={() => router.push('/(tabs)/payouts')}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                  ₹{payouts.reduce((sum, p) => sum + (parseFloat(String(p.amount).replace(/[₹,]/g, '')) || 0), 0).toLocaleString('en-IN') || '0'}
                </Text>
                <Text style={[styles.statLabel, darkModeEnabled && styles.textMutedDark]}>Earned</Text>
              </TouchableScale>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkModeEnabled && styles.textDark]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableScale style={styles.actionBtn} onPress={() => router.push('/(tabs)/new-lead' as any)}>
                <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(222,31,38,0.05)', borderColor: 'rgba(222,31,38,0.15)', borderWidth: 1 }]}>
                  <MaterialCommunityIcons name="plus" size={24} color="#DE1F26" />
                </View>
                <Text style={[styles.actionLabel, darkModeEnabled && styles.textMutedDark]}>New Lead</Text>
              </TouchableScale>

              <TouchableScale style={styles.actionBtn} onPress={() => router.push('/(tabs)/leads')}>
                <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(0,212,255,0.06)', borderColor: 'rgba(0,212,255,0.15)', borderWidth: 1 }]}>
                  <MaterialCommunityIcons name="file-document-outline" size={24} color="#00D4FF" />
                </View>
                <Text style={[styles.actionLabel, darkModeEnabled && styles.textMutedDark]}>My Leads</Text>
              </TouchableScale>

              <TouchableScale style={styles.actionBtn} onPress={() => router.push('/(tabs)/payouts')}>
                <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(0,229,160,0.06)', borderColor: 'rgba(0,229,160,0.15)', borderWidth: 1 }]}>
                  <MaterialCommunityIcons name="cash-multiple" size={24} color="#00E5A0" />
                </View>
                <Text style={[styles.actionLabel, darkModeEnabled && styles.textMutedDark]}>Payouts</Text>
              </TouchableScale>

              <TouchableScale style={styles.actionBtn} onPress={() => Alert.alert('Desktop Admin', 'Opening India Shelter Admin Dashboard view...')}>
                <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(255,184,48,0.06)', borderColor: 'rgba(255,184,48,0.15)', borderWidth: 1 }]}>
                  <MaterialCommunityIcons name="monitor" size={24} color="#FFB830" />
                </View>
                <Text style={[styles.actionLabel, darkModeEnabled && styles.textMutedDark]}>Dashboard</Text>
              </TouchableScale>
            </View>
          </View>

          {/* Commission Card */}
          <View style={styles.section}>
            <TouchableScale style={[styles.payoutCard, darkModeEnabled && styles.cardDark]} onPress={() => router.push('/(tabs)/payouts')}>
              <View style={styles.payoutHeader}>
                <View>
                  <Text style={[styles.payoutLabel, darkModeEnabled && styles.textMutedDark]}>NEXT PAYOUT</Text>
                  <Text style={styles.payoutAmount}>₹84,200</Text>
                  <Text style={[styles.payoutDate, darkModeEnabled && styles.textMutedDark]}>Due on 15 Jun 2026</Text>
                </View>
                <MaterialCommunityIcons name="currency-inr" size={32} color="#10B981" />
              </View>
              <View style={[styles.payoutMetrics, darkModeEnabled && { borderTopColor: '#334155' }]}>
                <View>
                  <Text style={[styles.metricLabel, darkModeEnabled && styles.textMutedDark]}>This Month</Text>
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>₹1.2L</Text>
                </View>
                <View>
                  <Text style={[styles.metricLabel, darkModeEnabled && styles.textMutedDark]}>Pending</Text>
                  <Text style={[styles.metricValue, { color: '#F59E0B' }]}>₹42K</Text>
                </View>
                <View>
                  <Text style={[styles.metricLabel, darkModeEnabled && styles.textMutedDark]}>YTD</Text>
                  <Text style={[styles.metricValue, { color: '#06B6D4' }]}>₹8.4L</Text>
                </View>
              </View>
            </TouchableScale>
          </View>

          {/* Recent Leads */}
          <View style={styles.section}>
            <View style={styles.recentLeadsHeader}>
              <Text style={[styles.sectionTitle, darkModeEnabled && styles.textDark]}>Recent Leads</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/leads')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {showRecentLeads.map((lead) => (
              <TouchableScale 
                key={lead.id} 
                style={[styles.leadCard, darkModeEnabled && styles.cardDark]} 
                onPress={() => handleRecentLeadPress(lead.id)}
              >
                <View style={styles.leadHeader}>
                  <Text style={[styles.leadName, darkModeEnabled && styles.textDark]}>{lead.name}</Text>
                  <View style={getStatusStyle(lead.status)}>
                    <Text style={getStatusTextStyle(lead.status)}>{getStatusText(lead.status)}</Text>
                  </View>
                </View>
                <View style={styles.leadDetailsRow}>
                  <Text style={[styles.leadDetailText, darkModeEnabled && styles.textMutedDark]}>{lead.id}</Text>
                  <Text style={[styles.leadDetailText, darkModeEnabled && styles.textMutedDark]}>·</Text>
                  <Text style={[styles.leadDetailText, darkModeEnabled && styles.textMutedDark]}>{lead.amount}</Text>
                  <Text style={[styles.leadDetailText, darkModeEnabled && styles.textMutedDark]}>·</Text>
                  <Text style={[styles.leadDetailText, darkModeEnabled && styles.textMutedDark]}>{lead.product}</Text>
                </View>
              </TouchableScale>
            ))}
          </View>
          
          <View style={{ height: 60 }} />
        </Animated.View>
      </ScrollView>

      {/* Empanelment Bottom Sheet */}
      {showEmpanelment && (
        <View style={StyleSheet.absoluteFill}>
          {/* Backdrop */}
          <Animated.View 
            style={[
              styles.backdrop, 
              { 
                opacity: sheetAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                }) 
              }
            ]}
          >
            <TouchableOpacity style={styles.backdropPressable} onPress={closeBottomSheet} activeOpacity={1} />
          </Animated.View>

          {/* Bottom Sheet Panel */}
          <Animated.View 
            style={[
              styles.sheetPanel,
              {
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.sheetHandle} />
            
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Partner Empanelment</Text>
              <TouchableOpacity onPress={closeBottomSheet} style={styles.sheetCloseBtn}>
                <MaterialCommunityIcons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {/* Partner ID Card */}
              <View style={styles.partnerCard}>
                <View style={styles.partnerCardHeader}>
                  <MaterialCommunityIcons name="shield-check" size={28} color="#FFFFFF" />
                  <Text style={styles.partnerCardTitle}>INDIA SHELTER PARTNER</Text>
                </View>
                <Text style={styles.partnerName}>{connectorRecord?.fullName || onboardingData.fullName || ''}</Text>
                <View style={styles.partnerCardRow}>
                  <View>
                    <Text style={styles.partnerCardLabel}>PARTNER CODE</Text>
                    <Text style={styles.partnerCardValue}>{dsaCode || connectorRecord?.connectorId || '—'}</Text>
                  </View>
                  <View>
                    <Text style={styles.partnerCardLabel}>STATUS</Text>
                    <Text style={styles.partnerCardValue}>{connectorRecord?.leadStatus || 'Onboarding'}</Text>
                  </View>
                </View>
                <View style={[styles.partnerCardRow, { marginTop: 12 }]}>
                  <View>
                    <Text style={styles.partnerCardLabel}>CONNECTOR TYPE</Text>
                    <Text style={styles.partnerCardValue}>{connectorRecord?.connectorType || 'DSA'}</Text>
                  </View>
                  <View style={styles.partnerCardBadge}>
                    <Text style={styles.partnerCardBadgeText}>{connectorRecord?.status?.toUpperCase() || 'ACTIVE DSA'}</Text>
                  </View>
                </View>
              </View>

              {/* Relationship Manager Section */}
              <Text style={styles.sheetSectionTitle}>Relationship Support</Text>
              <View style={styles.rmCard}>
                <View style={styles.rmAvatar}>
                  <Text style={styles.rmAvatarText}>RS</Text>
                </View>
                <View style={styles.rmInfo}>
                  <Text style={styles.rmName}>Support Desk</Text>
                  <Text style={styles.rmRole}>DSA Helpline</Text>
                  <Text style={styles.rmBranch}>India Shelter Support</Text>
                </View>
              </View>
              <View style={styles.rmContactButtons}>
                <TouchableOpacity 
                  style={[styles.rmContactBtn, { width: '100%' }]} 
                  onPress={() => {
                    Linking.openURL('tel:18005728888').catch(() => {
                      Alert.alert('Calling Support', 'India Shelter Helpline: 1800-572-8888');
                    });
                  }}
                  id="call-rm-support"
                >
                  <MaterialCommunityIcons name="phone" size={18} color="#DE1F26" style={{ marginRight: 6 }} />
                  <Text style={styles.rmContactBtnText}>Call: 1800-572-8888 (Toll Free)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.rmContactBtn, { width: '100%', marginTop: 8 }]} 
                  onPress={() => {
                    Linking.openURL('mailto:customer.care@indiashelter.in').catch(() => {
                      Alert.alert('Email Support', 'customer.care@indiashelter.in');
                    });
                  }}
                  id="email-rm-support"
                >
                  <MaterialCommunityIcons name="email-outline" size={18} color="#DE1F26" style={{ marginRight: 6 }} />
                  <Text style={styles.rmContactBtnText}>customer.care@indiashelter.in</Text>
                </TouchableOpacity>
              </View>

              {/* Empanelment Checklist */}
              <Text style={styles.sheetSectionTitle}>Empanelment Checklist</Text>
              <View style={styles.checklist}>
                {[
                  { label: 'PAN Verification Completed', desc: 'Verified against NSDL database' },
                  { label: 'Aadhaar e-KYC Done', desc: 'OTP matching completed successfully' },
                  { label: 'Selfie Liveness Check', desc: 'Matched with Aadhaar image' },
                  { label: 'Business Profile Registered', desc: 'Valid GST/Establishment details' },
                  { label: 'Bank Account Linked', desc: 'Penny drop verification successful' },
                  { label: 'DSA Agreement Digitally Signed', desc: 'Executed on 12 Jan 2026' },
                ].map((item, index) => (
                  <View key={index} style={styles.checklistItem}>
                    <View style={styles.checklistIcon}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checklistLabel}>{item.label}</Text>
                      <Text style={styles.checklistSub}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </View>
      )}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
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
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
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
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    zIndex: 999,
  },
  backdropPressable: {
    flex: 1,
  },
  sheetPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: {
    padding: 24,
  },
  partnerCard: {
    backgroundColor: '#B91C1C',
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  partnerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  partnerCardTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  partnerName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  partnerCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerCardLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  partnerCardValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  partnerCardBadge: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  partnerCardBadgeText: {
    color: '#DE1F26',
    fontSize: 10,
    fontWeight: '800',
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 16,
  },
  rmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  rmAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#FFEAEA',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  rmAvatarText: {
    color: '#DE1F26',
    fontSize: 16,
    fontWeight: '800',
  },
  rmInfo: {
    flex: 1,
  },
  rmName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  rmRole: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  rmBranch: {
    fontSize: 11,
    color: '#94A3B8',
  },
  rmContactButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  rmContactBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderWidth: 1.5,
    borderColor: '#DE1F26',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rmContactBtnText: {
    color: '#DE1F26',
    fontSize: 13,
    fontWeight: '700',
  },
  checklist: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checklistIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  checklistLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  checklistSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  heroDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  textDark: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
  dividerDark: {
    backgroundColor: '#334155',
  }
});
