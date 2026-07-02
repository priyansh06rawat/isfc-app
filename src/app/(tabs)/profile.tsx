import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, Switch, Animated, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
  const { 
    logout, 
    onboardingData, 
    notificationsEnabled, 
    setNotificationsEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
    leads
  } = useAuth();

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

  const handleLogout = () => {
    logout();
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:1234567890').catch(() => {
      Alert.alert('Call Support', 'Dialing Support: 1234567890...');
    });
  };

  const handleViewAgreement = () => {
    Alert.alert('DSA Agreement', 'Opening DSA Empanelment Agreement (PDF)...');
  };

  return (
    <SafeAreaView style={[styles.container, darkModeEnabled && styles.containerDark]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={[styles.header, darkModeEnabled && styles.headerDark]}>
          <Text style={[styles.headerTitle, darkModeEnabled && styles.textDark]}>My Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Hero Section */}
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RK</Text>
            </View>
            <Text style={[styles.name, darkModeEnabled && styles.textDark]}>
              {onboardingData.fullName || 'Rajesh Kumar'}
            </Text>
            <Text style={styles.subtitle}>
              DSA Partner • Code: DSA-08421
            </Text>
            <View style={styles.verifiedBadge}>
              <View style={styles.verifiedDot} />
              <Text style={styles.verifiedText}>KYC Verified</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, darkModeEnabled && styles.cardDark]}>
              <Text style={[styles.statValue, { color: '#DE1F26' }]}>{leads.length}</Text>
              <Text style={styles.statLabel}>Total Leads</Text>
            </View>
            <View style={[styles.statBox, darkModeEnabled && styles.cardDark]}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>₹4.2Cr</Text>
              <Text style={styles.statLabel}>Disbursed</Text>
            </View>
            <View style={[styles.statBox, darkModeEnabled && styles.cardDark]}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>₹8.4L</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
          </View>

          {/* Section 1: Personal Info */}
          <View style={[styles.sectionCard, darkModeEnabled && styles.cardDark]}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="cellphone" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>Mobile</Text>
              </View>
              <Text style={[styles.rowValue, darkModeEnabled && styles.textDark]}>+91 98XXXXXXXX</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="email-outline" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>Email</Text>
              </View>
              <Text style={[styles.rowValue, darkModeEnabled && styles.textDark]}>
                {onboardingData.email || 'rajesh@example.com'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="city-variant-outline" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>City</Text>
              </View>
              <Text style={[styles.rowValue, darkModeEnabled && styles.textDark]}>
                {onboardingData.city || 'Mumbai, Maharashtra'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="cake-variant-outline" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>DOB</Text>
              </View>
              <Text style={[styles.rowValue, darkModeEnabled && styles.textDark]}>
                {onboardingData.dob || '15 Mar 1988'}
              </Text>
            </View>
          </View>

          {/* Section 2: Professional Info */}
          <View style={[styles.sectionCard, darkModeEnabled && styles.cardDark]}>
            <Text style={styles.sectionTitle}>Professional Info</Text>
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="briefcase-outline" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>Occupation</Text>
              </View>
              <Text style={[styles.rowValue, darkModeEnabled && styles.textDark]}>
                {onboardingData.occupation || 'Financial Advisor'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="calendar-range" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>Partner Since</Text>
              </View>
              <Text style={[styles.rowValue, darkModeEnabled && styles.textDark]}>Jan 2024</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="bank-outline" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>Bank</Text>
              </View>
              <Text style={[styles.rowValue, darkModeEnabled && styles.textDark]}>
                {onboardingData.ifsc ? `HDFC ***${onboardingData.accNumber.slice(-4)}` : 'HDFC ***4521'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="card-account-details-outline" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>PAN</Text>
              </View>
              <Text style={[styles.rowValue, darkModeEnabled && styles.textDark]}>
                {onboardingData.pan || 'ABCDE1234F'}
              </Text>
            </View>
          </View>

          {/* Section 3: App Settings */}
          <View style={[styles.sectionCard, darkModeEnabled && styles.cardDark]}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.rowAction}>
              <Text style={styles.rowLabel}>Notifications</Text>
              <View style={styles.actionRight}>
                <Text style={[styles.statusText, notificationsEnabled ? styles.statusActive : styles.statusInactive]}>
                  {notificationsEnabled ? 'ON' : 'OFF'}
                </Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#E2E8F0', true: '#FED7D7' }}
                  thumbColor={notificationsEnabled ? '#DE1F26' : '#94A3B8'}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowAction}>
              <Text style={styles.rowLabel}>Dark Mode</Text>
              <View style={styles.actionRight}>
                <Text style={[styles.statusText, darkModeEnabled ? styles.statusActive : styles.statusInactive]}>
                  {darkModeEnabled ? 'ON' : 'OFF'}
                </Text>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: '#E2E8F0', true: '#FED7D7' }}
                  thumbColor={darkModeEnabled ? '#DE1F26' : '#94A3B8'}
                />
              </View>
            </View>
          </View>

          {/* Section 4: Support Actions */}
          <View style={[styles.sectionCard, darkModeEnabled && styles.cardDark]}>
            <TouchableOpacity style={styles.rowClick} onPress={handleCallSupport}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="phone-outline" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>Support: 1234567890</Text>
              </View>
              <Text style={styles.arrowText}>Call</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.rowClick} onPress={handleViewAgreement}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="file-document-outline" size={16} color="#DE1F26" style={styles.iconMargin} />
                <Text style={styles.rowLabel}>DSA Agreement</Text>
              </View>
              <Text style={styles.arrowText}>View</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <Button
            title="Log Out"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutBtn}
            textStyle={{ color: '#DE1F26' }}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  textDark: {
    color: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DE1F26',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DE1F26',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMargin: {
    marginRight: 8,
  },
  rowAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowClick: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusActive: {
    color: '#10B981',
  },
  statusInactive: {
    color: '#64748B',
  },
  arrowText: {
    fontSize: 13,
    color: '#DE1F26',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  logoutBtn: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
    marginTop: 8,
  },
});
