import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

export default function ReviewScreen() {
  const { onboardingData } = useAuth();

  // Animation hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleConfirm = () => {
    router.push('/(auth)/success' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Review Application" />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <Text style={styles.title}>Application Summary</Text>
            <Text style={styles.subtitle}>Please review all details before final submission</Text>
          </View>

          {/* Section 1: Personal Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="account" size={20} color="#DE1F26" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionHeader}>Personal Details</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{onboardingData.fullName || 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{onboardingData.email || 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>DOB</Text>
                <Text style={styles.value}>{onboardingData.dob || 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>City</Text>
                <Text style={styles.value}>{onboardingData.city ? `${onboardingData.city}, ${onboardingData.state}` : 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Section 2: Partner details */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="briefcase" size={20} color="#DE1F26" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionHeader}>Partner Details</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Partner Type</Text>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgePrimaryText}>
                    {onboardingData.partnerType === 'dsa' ? 'DSA Partner' : onboardingData.partnerType || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Experience</Text>
                <Text style={styles.value}>{onboardingData.experience ? `${onboardingData.experience} Years` : 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Products</Text>
                <Text style={styles.value}>{onboardingData.product || 'Home Loan, LAP'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Est. Volume</Text>
                <Text style={styles.value}>{onboardingData.volume || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Section 3: KYC status checks */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="file-check-outline" size={20} color="#DE1F26" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionHeader}>KYC Verification Status</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>PAN Card</Text>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#059669" style={styles.statusIcon} />
                  <Text style={styles.statusSuccess}>Verified</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Aadhaar Card</Text>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#059669" style={styles.statusIcon} />
                  <Text style={styles.statusSuccess}>Verified</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Selfie & Face Match</Text>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#059669" style={styles.statusIcon} />
                  <Text style={styles.statusSuccess}>Face Match 98.4%</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Business Document</Text>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#059669" style={styles.statusIcon} />
                  <Text style={styles.statusSuccess}>Verified</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Bank A/C Details</Text>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#059669" style={styles.statusIcon} />
                  <Text style={styles.statusSuccess}>Penny Drop Done</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>DSA Empanelment Agreement</Text>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#059669" style={styles.statusIcon} />
                  <Text style={styles.statusSuccess}>e-Signed</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Expected Timeline Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoTitleRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#DE1F26" style={styles.infoTitleIcon} />
              <Text style={styles.infoTitle}>Expected Timeline</Text>
            </View>
            <Text style={styles.infoText}>
              Your onboarding application will be reviewed by India Shelter's partner team within <Text style={styles.infoHighlight}>1–2 working days</Text>. You will receive verification updates via SMS and email.
            </Text>
          </View>

          <Button
            title="Submit Application"
            onPress={handleConfirm}
            style={styles.submitBtn}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3134',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D3134',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#2D3134',
    fontWeight: '700',
  },
  badgePrimary: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  badgePrimaryText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusSuccess: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoTitleIcon: {
    marginRight: 6,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DE1F26',
  },
  infoText: {
    fontSize: 12,
    color: '#7B2C2C',
    lineHeight: 18,
  },
  infoHighlight: {
    fontWeight: '700',
    color: '#DE1F26',
  },
  submitBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    marginBottom: 24,
  },
});
