import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Alert, Animated, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { notifyManagers } from '../../services/notifications';

export default function SuccessScreen() {
  const { onboardingData, dsaCode } = useAuth();
  const displayDsaCode = dsaCode || 'DSA' + new Date().getFullYear().toString().slice(-2) + '08421';
  const applicationId = 'APP-2026-' + Math.floor(10000 + Math.random() * 90000);

  // Animation hooks
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Notify managers that a new DSA has been onboarded
    notifyManagers({
      event: 'new_dsa_onboarded',
      roles: ['CHANNEL_MANAGER', 'ABM', 'RBM'],
      title: 'New DSA Onboarded',
      body: `${onboardingData.fullName || 'A new partner'} has completed DSA onboarding.`,
    });
  }, []);

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleCopyCode = () => {
    Alert.alert('Copied!', `DSA Code ${displayDsaCode} copied to clipboard.`);
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `My India Shelter DSA Code is: ${displayDsaCode}\nStart referring clients today!`,
        title: 'My DSA Code',
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Animated Check Ring */}
        <View style={styles.checkRing}>
          <MaterialCommunityIcons name="check" size={42} color="#00E5A0" />
        </View>

        <Text style={styles.title}>
          Application{"\n"}
          <Text style={styles.titleHighlight}>Submitted!</Text>
        </Text>

        <Text style={styles.subtitle}>
          Your DSA onboarding is complete. Your code is active from today.
        </Text>

        {/* DSA Code Card — Prominent */}
        <View style={styles.dsaCodeCard}>
          <View style={styles.dsaCodeBadge}>
            <MaterialCommunityIcons name="identifier" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.dsaCodeBadgeText}>YOUR DSA CODE</Text>
          </View>
          <Text style={styles.dsaCodeValue}>{displayDsaCode}</Text>
          <Text style={styles.dsaCodeSub}>Active from {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
          <View style={styles.dsaCodeActions}>
            <TouchableOpacity style={styles.dsaCodeAction} onPress={handleCopyCode} id="copy-dsa-code">
              <MaterialCommunityIcons name="content-copy" size={16} color="#DE1F26" />
              <Text style={styles.dsaCodeActionText}>Copy</Text>
            </TouchableOpacity>
            <View style={styles.dsaCodeActionDivider} />
            <TouchableOpacity style={styles.dsaCodeAction} onPress={handleShareCode} id="share-dsa-code">
              <MaterialCommunityIcons name="share-variant" size={16} color="#DE1F26" />
              <Text style={styles.dsaCodeActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Rows */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#DE1F26" style={styles.detailIcon} />
            <Text style={styles.detailText}>
              Confirmation sent to <Text style={styles.boldText}>{onboardingData.email || 'your email'}</Text>
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="whatsapp" size={18} color="#10B981" style={styles.detailIcon} />
            <Text style={styles.detailText}>
              WhatsApp updates activated on <Text style={styles.boldText}>+91 {onboardingData.accName || '98XXXXXXXX'}</Text>
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="bell-check" size={18} color="#F59E0B" style={styles.detailIcon} />
            <Text style={styles.detailText}>
              Channel Manager & ABM <Text style={styles.boldText}>notified</Text>
            </Text>
          </View>
        </View>

        {/* Go Home Button */}
        <Button
          title="Go to Dashboard"
          style={styles.successBtn}
          onPress={handleGoHome}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  content: { padding: 24, alignItems: 'center' },
  checkRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E6FDF4', borderWidth: 2, borderColor: '#00E5A0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#2D3134', textAlign: 'center', marginBottom: 12, lineHeight: 34 },
  titleHighlight: { color: '#10B981' },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 16 },
  // DSA Code Card
  dsaCodeCard: {
    width: '100%', backgroundColor: '#1E293B',
    borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: '#DE1F26', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  dsaCodeBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#DE1F26', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 12,
  },
  dsaCodeBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.2 },
  dsaCodeValue: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3, marginBottom: 6 },
  dsaCodeSub: { fontSize: 11, color: '#94A3B8', marginBottom: 16 },
  dsaCodeActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#334155', width: '100%', paddingTop: 16 },
  dsaCodeAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dsaCodeActionText: { fontSize: 13, fontWeight: '700', color: '#DE1F26' },
  dsaCodeActionDivider: { width: 1, backgroundColor: '#334155' },
  // Details
  detailsContainer: { width: '100%', gap: 10, marginBottom: 32 },
  detailRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12,
  },
  detailIcon: { marginRight: 12 },
  detailText: { fontSize: 12, color: '#475569', flex: 1 },
  boldText: { fontWeight: '700', color: '#1E293B' },
  successBtn: { backgroundColor: '#10B981', shadowColor: '#10B981', width: '100%' },
});
