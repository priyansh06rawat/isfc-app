import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>
          India<Text style={styles.highlight}>Shelter</Text>
        </Text>
        <Text style={styles.subtitle}>HOME LOANS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2D3134',
    letterSpacing: -0.5,
  },
  highlight: {
    color: '#DE1F26',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    letterSpacing: 2,
    marginTop: 4,
  },
});
