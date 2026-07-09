import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { AppText as Text } from '../../components/ui/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { TopNav } from '../../components/ui/TopNav';
import { useAuth } from '../../context/AuthContext';

const PARTNERS = [
  {
    id: 'dsa',
    icon: 'briefcase-outline',
    title: 'DSA Partner',
    subtitle: 'Direct Selling Agent with full commission structure',
    bgColor: '#EEF2FF',
    iconColor: '#4F46E5',
  },
  {
    id: 'connector',
    icon: 'link-variant',
    title: 'Connector',
    subtitle: 'Refer leads and earn flat referral fee',
    bgColor: '#ECFEFF',
    iconColor: '#0891B2',
  },
  {
    id: 'co-lender',
    icon: 'bank-outline',
    title: 'Co-Lending',
    subtitle: 'NBFC/Bank co-lending arrangement',
    bgColor: '#ECFDF5',
    iconColor: '#059669',
  },
  {
    id: 'builder',
    icon: 'office-building',
    title: 'Builder',
    subtitle: 'Real estate developer partnership',
    bgColor: '#FFFBEB',
    iconColor: '#D97706',
  },
];

export default function PartnerTypeScreen() {
  const { onboardingData, updateOnboardingData } = useAuth();
  const selected = onboardingData.partnerType;

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

  const setSelected = (type: string | null) => {
    updateOnboardingData({ partnerType: type });
  };

  const handleContinue = () => {
    if (selected) {
      router.push('/(auth)/personal-details' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Partner Type" />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>Select the type of partner you want to register as</Text>
          </View>

          <View style={styles.grid}>
            {PARTNERS.map((partner) => (
              <TouchableOpacity
                key={partner.id}
                style={[
                  styles.card,
                  selected === partner.id && styles.cardSelected,
                ]}
                onPress={() => setSelected(partner.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: partner.bgColor }]}>
                  <MaterialCommunityIcons name={partner.icon as any} size={24} color={partner.iconColor} />
                </View>
                <Text style={styles.cardTitle}>{partner.title}</Text>
                <Text style={styles.cardSubtitle}>{partner.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selected === 'dsa' && (
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>DSA Partner Benefits</Text>
              <View style={styles.benefitRow}>
                <MaterialCommunityIcons name="check-circle" size={14} color="#0284C7" style={{ marginRight: 8 }} />
                <Text style={styles.benefitText}>Earn up to 1.5% commission</Text>
              </View>
              <View style={styles.benefitRow}>
                <MaterialCommunityIcons name="check-circle" size={14} color="#0284C7" style={{ marginRight: 8 }} />
                <Text style={styles.benefitText}>Real-time lead tracking dashboard</Text>
              </View>
              <View style={styles.benefitRow}>
                <MaterialCommunityIcons name="check-circle" size={14} color="#0284C7" style={{ marginRight: 8 }} />
                <Text style={styles.benefitText}>Dedicated Relationship Manager</Text>
              </View>
              <View style={styles.benefitRow}>
                <MaterialCommunityIcons name="check-circle" size={14} color="#0284C7" style={{ marginRight: 8 }} />
                <Text style={styles.benefitText}>Monthly payout on 15th</Text>
              </View>
            </View>
          )}

          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
            style={styles.button}
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
  },
  titleContainer: {
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#DE1F26',
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3134',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#475569',
  },
  button: {
    marginTop: 8,
  },
});
