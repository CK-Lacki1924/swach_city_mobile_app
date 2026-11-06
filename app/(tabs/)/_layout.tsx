import { Tabs } from 'expo-router';
import { Home, MapPin, FileText, Users, AlertTriangle } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from 'lib/colors';
import { clearToken } from 'lib/auth';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTitleStyle: {
          color: colors.white,
          fontWeight: '700',
          fontSize: 18,
        },
        headerTintColor: colors.white,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="(tabs)/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Home size={24} color={focused ? colors.primary : colors.textMuted} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <MapPin size={24} color={focused ? colors.primary : colors.textMuted} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/complaints"
        options={{
          title: 'Complaints',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <FileText size={24} color={focused ? colors.primary : colors.textMuted} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/report"
        options={{
          title: 'Report',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <AlertTriangle size={24} color={focused ? colors.primary : colors.textMuted} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/teams"
        options={{
          title: 'Teams',
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Users size={24} color={focused ? colors.primary : colors.textMuted} />
          ),
        }}
      />
    </Tabs>
  );
}

function SignOutButton() {
  const handlePress = async () => {
    await clearToken();
    (globalThis as any).__mobileToken = null;
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.signOutButton}
    >
      <Text style={styles.signOutText}>Logout</Text>
    </TouchableOpacity>
  );
}

export { SignOutButton };

const styles = StyleSheet.create({
  signOutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  signOutText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
