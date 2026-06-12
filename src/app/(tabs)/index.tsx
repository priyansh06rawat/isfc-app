import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { logout } = useAuth();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Hero Area */}
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.greeting}>Good Evening, <Text style={styles.greetingHighlight}>Rajesh!</Text> 👋</Text>
              <Text style={styles.greetingSub}>DSA Partner · Code: DSA-08421</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.avatar}>
              <Text style={styles.avatarText}>RK</Text>
            </TouchableOpacity>
          </View>

          {/* KYC Status Banner */}
          <View style={styles.statusBanner}>
            <Text style={styles.statusIcon}>🟢</Text>
            <View>
              <Text style={styles.statusTitle}>KYC Approved</Text>
              <Text style={styles.statusSub}>Your account is active and verified</Text>
            </View>
          </View>

          {/* Push Notification Banner */}
          {showNotificationPrompt && (
            <View style={styles.notificationBanner}>
              <View style={styles.notificationBannerContent}>
                <Text style={styles.notificationIcon}>🔔</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>Enable Push Notifications</Text>
                  <Text style={styles.notificationSub}>Stay updated on your lead statuses</Text>
                </View>
              </View>
              <View style={styles.notificationActions}>
                <TouchableOpacity onPress={() => setShowNotificationPrompt(false)}>
                  <Text style={styles.notificationDismiss}>Later</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.notificationEnableBtn} onPress={() => setShowNotificationPrompt(false)}>
                  <Text style={styles.notificationEnableText}>Enable Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#DE1F26' }]}>28</Text>
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
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(108,99,255,0.15)' }]}>
                <Text style={styles.actionIcon}>➕</Text>
              </View>
              <Text style={styles.actionLabel}>New Lead</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/leads')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(0,212,255,0.12)' }]}>
                <Text style={styles.actionIcon}>📊</Text>
              </View>
              <Text style={styles.actionLabel}>My Leads</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/payouts')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(0,229,160,0.12)' }]}>
                <Text style={styles.actionIcon}>💰</Text>
              </View>
              <Text style={styles.actionLabel}>Payouts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(255,184,48,0.12)' }]}>
                <Text style={styles.actionIcon}>🖥️</Text>
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
              <Text style={styles.payoutIcon}>💸</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Leads</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/leads')}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.leadCard}>
            <View style={styles.leadHeader}>
              <Text style={styles.leadName}>Anita Desai</Text>
              <View style={styles.badgeSuccess}>
                <Text style={styles.badgeSuccessText}>Sanctioned</Text>
              </View>
            </View>
            <View style={styles.leadDetailsRow}>
              <Text style={styles.leadDetailText}>L-2844</Text>
              <Text style={styles.leadDetailText}>·</Text>
              <Text style={styles.leadDetailText}>₹68 Lakhs</Text>
              <Text style={styles.leadDetailText}>·</Text>
              <Text style={styles.leadDetailText}>Home Loan</Text>
            </View>
          </View>

          <View style={styles.leadCard}>
            <View style={styles.leadHeader}>
              <Text style={styles.leadName}>Rahul Verma</Text>
              <View style={styles.badgeWarning}>
                <Text style={styles.badgeWarningText}>In Progress</Text>
              </View>
            </View>
            <View style={styles.leadDetailsRow}>
              <Text style={styles.leadDetailText}>L-2845</Text>
              <Text style={styles.leadDetailText}>·</Text>
              <Text style={styles.leadDetailText}>₹25 Lakhs</Text>
              <Text style={styles.leadDetailText}>·</Text>
              <Text style={styles.leadDetailText}>LAP</Text>
            </View>
          </View>
        </View>
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
  statusIcon: {
    fontSize: 20,
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
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3134',
    marginBottom: 16,
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
  actionIcon: {
    fontSize: 24,
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
  payoutIcon: {
    fontSize: 40,
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
