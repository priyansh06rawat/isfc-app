import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

interface TopNavProps {
  title: string;
  step?: string;
}

export function TopNav({ title, step }: TopNavProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
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
});
