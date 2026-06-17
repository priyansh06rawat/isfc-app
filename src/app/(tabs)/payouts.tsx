import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function PayoutsScreen() {
  const insets = useSafeAreaInsets();
  const { payouts } = useAuth();

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
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payouts</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Earnings Hero Card */}
          <View style={styles.earningsHero}>
            <Text style={styles.heroSub}>Next Payout</Text>
            <Text style={styles.heroAmount}>₹84,200</Text>
            <Text style={styles.heroDate}>Due on 15 Jun 2026 · Bank: HDFC ***4521</Text>
            
            <View style={styles.heroMetrics}>
              <View>
                <Text style={styles.metricLabel}>This Month</Text>
                <Text style={styles.metricValue}>₹1.2L</Text>
              </View>
              <View>
                <Text style={styles.metricLabel}>Pending</Text>
                <Text style={styles.metricValue}>₹42K</Text>
              </View>
              <View>
                <Text style={styles.metricLabel}>YTD Total</Text>
                <Text style={styles.metricValue}>₹8.4L</Text>
              </View>
            </View>
          </View>

          {/* Commission Structure Rate Grid */}
          <Text style={styles.sectionTitle}>Your Commission Structure</Text>
          <View style={styles.rateGrid}>
            <View style={styles.rateCard}>
              <Text style={[styles.rateValue, { color: '#DE1F26' }]}>1.2%</Text>
              <Text style={styles.rateLabel}>Home Loan</Text>
            </View>
            <View style={styles.rateCard}>
              <Text style={[styles.rateValue, { color: '#10B981' }]}>1.5%</Text>
              <Text style={styles.rateLabel}>LAP</Text>
            </View>
            <View style={styles.rateCard}>
              <Text style={[styles.rateValue, { color: '#F59E0B' }]}>1.0%</Text>
              <Text style={styles.rateLabel}>MSME Loan</Text>
            </View>
            <View style={styles.rateCard}>
              <Text style={[styles.rateValue, { color: '#06B6D4' }]}>0.8%</Text>
              <Text style={styles.rateLabel}>Personal Loan</Text>
            </View>
          </View>

          {/* Transaction History list */}
          <Text style={styles.sectionTitle}>Transaction History</Text>
          
          {payouts.map((p) => {
            const isPaid = p.status === 'Paid';
            return (
              <View key={p.id} style={styles.payoutCard}>
                <View style={styles.payoutTop}>
                  <View style={[styles.iconWrapper, isPaid ? styles.iconPaid : styles.iconPending]}>
                    <MaterialCommunityIcons 
                      name={isPaid ? "check-circle-outline" : "clock-outline"} 
                      size={22} 
                      color={isPaid ? "#16A34A" : "#D97706"} 
                    />
                  </View>
                  <View style={styles.payoutInfo}>
                    <Text style={styles.month}>{p.month} Payout</Text>
                    <Text style={styles.details}>{p.leads} disbursed leads • {p.bank}</Text>
                    <Text style={styles.date}>Date: {p.date}</Text>
                  </View>
                  <View style={styles.payoutAmountMeta}>
                    <Text style={[styles.amount, { color: isPaid ? '#16A34A' : '#D97706' }]}>{p.amount}</Text>
                    <View style={[styles.statusBadge, isPaid ? styles.badgePaid : styles.badgePending]}>
                      <Text style={[styles.statusText, { color: isPaid ? '#16A34A' : '#D97706' }]}>{p.status}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  earningsHero: {
    backgroundColor: '#DE1F26',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroSub: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  heroMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  metricLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 12,
  },
  rateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  rateCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  rateLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  payoutTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconPaid: {
    backgroundColor: '#DCFCE7',
  },
  iconPending: {
    backgroundColor: '#FEF3C7',
  },
  payoutInfo: {
    flex: 1,
  },
  month: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  details: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: '#94A3B8',
  },
  payoutAmountMeta: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgePaid: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

