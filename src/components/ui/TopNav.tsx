import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText as Text } from './AppText';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

interface TopNavProps {
  title: string;
  step?: string;
}

export function TopNav({ title, step }: TopNavProps) {
  const { darkModeEnabled } = useAuth();
  
  return (
    <View style={[styles.header, darkModeEnabled && styles.headerDark]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backText, darkModeEnabled && styles.textDark]}>←</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, darkModeEnabled && styles.textDark]}>{title}</Text>
      <View style={styles.rightContent}>
        {step ? (
          <Text style={styles.stepText}>{step}</Text>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 24,
    color: '#2D3134',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3134',
  },
  rightContent: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  stepText: {
    fontSize: 12,
    color: '#DE1F26',
    fontWeight: '600',
  },
  headerDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#334155',
  },
  textDark: {
    color: '#F8FAFC',
  },
});
