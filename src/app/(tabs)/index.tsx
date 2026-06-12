import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerBrand}>India<Text style={styles.headerBrandHighlight}>Shelter</Text></Text>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good Evening, Rajesh!</Text>
          <Text style={styles.subtitle}>Welcome back to your dashboard.</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardBg} />
          <View style={styles.profileContent}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>RK</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Rajesh Kumar</Text>
              <Text style={styles.profileId}>DSA ID: ISH-2026-849</Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Disbursed</Text>
              <Text style={styles.statValue}>₹1.5 Cr</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Active Leads</Text>
              <Text style={styles.statValue}>12</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
              <MaterialCommunityIcons name="account-plus-outline" size={24} color="#DE1F26" />
            </View>
            <Text style={styles.gridText}>New Lead</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#0284C7" />
            </View>
            <Text style={styles.gridText}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={24} color="#16A34A" />
            </View>
            <Text style={styles.gridText}>Payouts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
              <MaterialCommunityIcons name="school-outline" size={24} color="#9333EA" />
            </View>
            <Text style={styles.gridText}>Training</Text>
          </TouchableOpacity>
        </View>

        {/* Target Progress */}
        <View style={styles.targetCard}>
          <View style={styles.targetHeader}>
            <Text style={styles.targetTitle}>Monthly Target</Text>
            <Text style={styles.targetAmount}>₹1.5Cr / ₹2Cr</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '75%' }]} />
          </View>
          <Text style={styles.targetDesc}>75% achieved. ₹50L remaining!</Text>
        </View>

        <View style={{ height: 100 }} /> {/* Padding for bottom nav */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 10,
  },
  headerBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerBrandHighlight: {
    color: '#DE1F26',
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  profileCardBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#DE1F26',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DE1F26',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileId: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  targetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  targetAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DE1F26',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#DE1F26',
    borderRadius: 4,
  },
  targetDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '500',
  },
});
