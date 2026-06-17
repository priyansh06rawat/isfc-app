import React from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function SuccessScreen() {
  const { verifyOtp, onboardingData } = useAuth();

  const handleGoHome = () => {
    // Authenticate user so they can access protected dashboard tabs
    verifyOtp();
    router.replace('/(tabs)');
  };

  const handleTrack = () => {
    Alert.alert('Tracking Status', 'Application ID: DSA-2026-08421\nStatus: Under Review\nETA: 24–48 Hours');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Check Ring */}
        <View style={styles.checkRing}>
          <Text style={styles.checkMark}>✓</Text>
        </View>

        <Text style={styles.title}>
          Application{"\n"}
          <Text style={styles.titleHighlight}>Submitted!</Text>
        </Text>

        <Text style={styles.subtitle}>
          Your DSA onboarding application has been received. Our team will review and activate your account shortly.
        </Text>

        {/* Info Card */}
        <View style={styles.idCard}>
          <Text style={styles.idLabel}>APPLICATION ID</Text>
          <Text style={styles.idValue}>DSA-2026-08421</Text>
          <Text style={styles.idSubtext}>Save this for reference</Text>
        </View>

        {/* Status Rows */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📧</Text>
            <Text style={styles.detailText}>
              Confirmation sent to <Text style={styles.boldText}>{onboardingData.email || 'rajesh@example.com'}</Text>
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📱</Text>
            <Text style={styles.detailText}>
              SMS alerts activated on <Text style={styles.boldText}>+91 98XXXXXXXX</Text>
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Button
            title="Go Home"
            variant="outline"
            style={styles.halfBtn}
            onPress={handleGoHome}
          />
          <Button
            title="Track Status"
            style={[styles.halfBtn, styles.successBtn]}
            onPress={handleTrack}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  checkRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6FDF4',
    borderWidth: 2,
    borderColor: '#00E5A0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  checkMark: {
    fontSize: 42,
    color: '#00E5A0',
    fontWeight: '800',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D3134',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  titleHighlight: {
    color: '#10B981',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  idCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  idValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 1.5,
  },
  idSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  detailsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: '#1E293B',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  halfBtn: {
    flex: 1,
  },
  successBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
});
