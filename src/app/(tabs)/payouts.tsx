import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Animated, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../components/ui/AppText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { TouchableScale } from '../../components/ui/TouchableScale';

export default function PayoutsScreen() {
  const insets = useSafeAreaInsets();
  const { payouts, darkModeEnabled } = useAuth();

  const [selectedProduct, setSelectedProduct] = useState('Home Loan');
  const [sourcingAmt, setSourcingAmt] = useState(25); // in Lakhs

  // Animation hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const calcScaleAnim = useRef(new Animated.Value(1)).current;

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

  const getCommissionRate = (product: string) => {
    switch (product) {
      case 'Home Loan': return 0.012;
      case 'LAP': return 0.015;
      case 'MSME Loan': return 0.01;
      case 'Personal Loan': return 0.008;
      default: return 0.012;
    }
  };

  const currentRate = getCommissionRate(selectedProduct);
  const estimatedPayout = sourcingAmt * 100000 * currentRate;

  useEffect(() => {
    calcScaleAnim.setValue(0.92);
    Animated.spring(calcScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 8,
    }).start();
  }, [selectedProduct, sourcingAmt]);
  
  // Calculate dynamic stats from payouts array
  const totalYtd = payouts.reduce((sum, p) => sum + (Number(p.amount.replace(/[^0-9.-]+/g, '')) || 0), 0);
  const pendingAmount = payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (Number(p.amount.replace(/[^0-9.-]+/g, '')) || 0), 0);
  
  const nextPayout = payouts.find(p => p.status === 'Pending');
  const nextPayoutAmount = nextPayout ? nextPayout.amount : '₹0';
  const nextPayoutDate = nextPayout && nextPayout.date 
    ? `Due on ${nextPayout.date} · Bank: ${nextPayout.bank}` 
    : 'No pending payouts';

  return (
    <View style={[styles.container, darkModeEnabled && styles.containerDark, { paddingTop: insets.top }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={[styles.header, darkModeEnabled && styles.headerDark]}>
          <Text style={[styles.headerTitle, darkModeEnabled && styles.textDark]}>Payouts</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Earnings Hero Card */}
          <View style={[styles.earningsHero, darkModeEnabled && styles.cardDark]}>
            <Text style={[styles.heroSub, darkModeEnabled && styles.textMutedDark]}>Next Payout</Text>
            <Text style={styles.heroAmount}>{nextPayoutAmount}</Text>
            <Text style={[styles.heroDate, darkModeEnabled && styles.textMutedDark]}>{nextPayoutDate}</Text>
            
            <View style={[styles.heroMetrics, darkModeEnabled && { borderTopColor: '#334155' }]}>
              <View>
                <Text style={[styles.metricLabel, darkModeEnabled && styles.textMutedDark]}>This Month</Text>
                <Text style={[styles.metricValue, darkModeEnabled && styles.textDark]}>₹{totalYtd > 0 ? (totalYtd/1000).toFixed(1) + 'K' : '0'}</Text>
              </View>
              <View>
                <Text style={[styles.metricLabel, darkModeEnabled && styles.textMutedDark]}>Pending</Text>
                <Text style={[styles.metricValue, darkModeEnabled && styles.textDark]}>₹{pendingAmount > 0 ? pendingAmount.toLocaleString('en-IN') : '0'}</Text>
              </View>
              <View>
                <Text style={[styles.metricLabel, darkModeEnabled && styles.textMutedDark]}>YTD Total</Text>
                <Text style={[styles.metricValue, darkModeEnabled && styles.textDark]}>₹{totalYtd > 0 ? totalYtd.toLocaleString('en-IN') : '0'}</Text>
              </View>
            </View>
          </View>

          {/* Commission Structure & Calculator disabled for production until real logic is added */}
          <Text style={[styles.sectionTitle, darkModeEnabled && styles.textDark]}>Transaction History</Text>
          
          {payouts.map((p) => {
            const isPaid = p.status === 'Paid';
            return (
              <TouchableScale key={p.id} style={[styles.payoutCard, darkModeEnabled && styles.cardDark]}>
                <View style={styles.payoutTop}>
                  <View style={[styles.iconWrapper, isPaid ? styles.iconPaid : styles.iconPending]}>
                    <MaterialCommunityIcons 
                      name={isPaid ? "check-circle-outline" : "clock-outline"} 
                      size={22} 
                      color={isPaid ? "#16A34A" : "#D97706"} 
                    />
                  </View>
                  <View style={styles.payoutInfo}>
                    <Text style={[styles.month, darkModeEnabled && styles.textDark]}>{p.month} Payout</Text>
                    <Text style={[styles.details, darkModeEnabled && styles.textMutedDark]}>{p.leads} disbursed leads • {p.bank}</Text>
                    <Text style={[styles.date, darkModeEnabled && styles.textMutedDark]}>Date: {p.date}</Text>
                  </View>
                  <View style={styles.payoutAmountMeta}>
                    <Text style={[styles.amount, { color: isPaid ? '#16A34A' : '#D97706' }]}>{p.amount}</Text>
                    <View style={[styles.statusBadge, isPaid ? styles.badgePaid : styles.badgePending]}>
                      <Text style={[styles.statusText, { color: isPaid ? '#16A34A' : '#D97706' }]}>{p.status}</Text>
                    </View>
                  </View>
                </View>
              </TouchableScale>
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
    backgroundColor: '#B91C1C',
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  calcInstruction: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    fontWeight: '600',
  },
  calcAdjusterSection: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 18,
  },
  adjusterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  amountDisplay: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  amountDisplaySub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  presetText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  calcResultArea: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    marginTop: 6,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 4,
  },
  resultSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  headerDark: {
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
});

