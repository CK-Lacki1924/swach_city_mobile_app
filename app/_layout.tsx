import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { getToken } from '../lib/auth';

export default function RootLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await getToken();
      if (!mounted) return;
      setChecking(false);
      if (!token) {
        router.replace('/auth/login');
      } else {
        (globalThis as any).__mobileToken = token;
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1B6B3A" />
        <Text style={styles.text}>Loading…</Text>
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
});
