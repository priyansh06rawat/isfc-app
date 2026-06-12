import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { TopNav } from '../../components/ui/TopNav';

const PARTNERS = [
  {
    id: 'dsa',
    icon: '👔',
    title: 'DSA Partner',
    subtitle: 'Direct Selling Agent with full commission structure',
    bgColor: '#EEF2FF',
  },
  {
    id: 'connector',
    icon: '🔗',
    title: 'Connector',
    subtitle: 'Refer leads and earn flat referral fee',
    bgColor: '#ECFEFF',
  },
  {
    id: 'co-lender',
    icon: '🏛️',
    title: 'Co-Lending',
    subtitle: 'NBFC/Bank co-lending arrangement',
    bgColor: '#ECFDF5',
  },
  {
    id: 'builder',
    icon: '🏗️',
    title: 'Builder',
    subtitle: 'Real estate developer partnership',
    bgColor: '#FFFBEB',
  },
];

export default function PartnerTypeScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      router.push('/(auth)/personal-details' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title="Partner Type" />

      <ScrollView contentContainerStyle={styles.content}>
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
                <Text style={styles.icon}>{partner.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{partner.title}</Text>
              <Text style={styles.cardSubtitle}>{partner.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selected === 'dsa' && (
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>✨ DSA Partner Benefits</Text>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Earn up to 1.5% commission</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Real-time lead tracking dashboard</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Dedicated Relationship Manager</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Monthly payout on 15th</Text>
            </View>
          </View>
        )}

        <Button
          title="Continue →"
          onPress={handleContinue}
          disabled={!selected}
          style={styles.button}
        />
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
  icon: {
    fontSize: 24,
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
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#475569',
  },
  button: {
    marginTop: 8,
  },
});
