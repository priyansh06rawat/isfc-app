import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { darkModeEnabled } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // We have a custom header in the screens
        tabBarActiveTintColor: '#DE1F26',
        tabBarInactiveTintColor: darkModeEnabled ? '#94A3B8' : '#64748B',
        tabBarStyle: {
          backgroundColor: darkModeEnabled ? '#0F172A' : '#FFFFFF',
          borderTopColor: darkModeEnabled ? '#1E293B' : '#F1F5F9',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 95 : 75,
          paddingBottom: Platform.OS === 'ios' ? 35 : 20,
          paddingTop: 10,
          position: 'absolute',
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: darkModeEnabled ? 0.2 : 0.05, shadowRadius: 12 },
            android: { elevation: 8 },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'My Leads',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'clipboard-text' : 'clipboard-text-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payouts"
        options={{
          title: 'Payouts',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'cash-multiple' : 'cash'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-lead"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="lead/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
