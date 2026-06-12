import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PayoutsScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payouts</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Payout Card 1 */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutTop}>
            <View>
              <Text style={styles.month}>May 2026</Text>
              <Text style={styles.amount}>₹45,000</Text>
            </View>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="bank-outline" size={24} color="#DE1F26" />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.payoutBottom}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#16A34A" />
            <Text style={styles.statusText}>Paid to HDFC Bank ****1234</Text>
          </View>
        </View>

        {/* Payout Card 2 */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutTop}>
            <View>
              <Text style={styles.month}>April 2026</Text>
              <Text style={styles.amount}>₹32,500</Text>
            </View>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="bank-outline" size={24} color="#DE1F26" />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.payoutBottom}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#16A34A" />
            <Text style={styles.statusText}>Paid to HDFC Bank ****1234</Text>
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
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
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  payoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  month: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  payoutBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    color: '#16A34A',
    marginLeft: 6,
    fontWeight: '500',
  },
});
