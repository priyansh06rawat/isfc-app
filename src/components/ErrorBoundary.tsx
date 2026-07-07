import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FallbackProps } from 'react-error-boundary';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#DE1F26" />
        <Text style={styles.title}>Oops, something went wrong</Text>
        <Text style={styles.subtitle}>
          The application encountered an unexpected error. Please try restarting the app.
        </Text>
        <Text style={styles.errorText} numberOfLines={3}>
          {error instanceof Error ? error.message : String(error)}
        </Text>
        <TouchableOpacity style={styles.button} onPress={resetErrorBoundary}>
          <Text style={styles.buttonText}>Restart App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3134',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 12,
    color: '#DE1F26',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#DE1F26',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
