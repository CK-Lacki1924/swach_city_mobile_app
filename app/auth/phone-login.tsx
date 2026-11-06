import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Phone, ArrowRight, ShieldCheck, AlertCircle, Clock } from 'lucide-react-native';
import { api, extractErrorMessage } from '../../lib/api';
import { setToken } from '../../lib/auth';
import { colors } from '../../lib/colors';

type FormType = 'phone' | 'otp';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const [formType, setFormType] = useState<FormType>('phone');
  const [form, setForm] = useState({ phone: '', otp: '', name: '', role: 'citizen' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const ROLES = [
    { value: 'citizen', label: 'Citizen', description: 'Report garbage complaints' },
    { value: 'worker', label: 'Worker', description: 'Resolve assigned complaints' },
  ];

  const handleSendOTP = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/send-otp', { phone: form.phone });
      setOtpSent(true);
      setFormType('otp');
      Alert.alert('OTP Sent', res.data.data.otp ? `Your OTP is: ${res.data.data.otp}` : 'Check your phone for the OTP');
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to send OTP. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        phone: form.phone,
        otp: form.otp,
        name: form.name,
        role: form.role,
      });
      const token = res.data.data.token;
      await setToken(token);
      (globalThis as any).__mobileToken = token;
      router.replace('/(tabs)');
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (formType === 'phone') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <ShieldCheck size={32} color={colors.white} />
            </View>
            <Text style={styles.appName}>Swach City</Text>
            <Text style={styles.subtitle}>Sign in with your phone number</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Phone login</Text>
            <Text style={styles.cardSubtitle}>Enter your phone number to receive an OTP</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  autoCapitalize="none"
                  autoComplete="tel"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(text) => setForm({ ...form, phone: text })}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSendOTP} disabled={submitting}>
              <View style={styles.submitButtonContent}>
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Send OTP</Text>
                )}
                <ArrowRight size={18} color={styles.submitButtonText === undefined ? colors.white : colors.white} style={styles.submitArrow} />
              </View>
            </TouchableOpacity>

            {error && (
              <View style={styles.errorBanner}>
                <AlertCircle size={16} color={colors.critical} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.divider}>
              <Text style={styles.dividerText}>OR</Text>
            </View>

            <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/auth/signup')}>
              <MailIcon />{' '}
              <Text style={styles.signupText}>Sign up with email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
              <ArrowLeft size={16} color={colors.textSecondary} style={{ transform: [{ scaleX: -1 }] }} />
              <Text style={styles.loginText}>Email login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Clock size={32} color={colors.white} />
          </View>
          <Text style={styles.appName}>Swach City</Text>
          <Text style={styles.subtitle}>Enter the OTP sent to your phone</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verify OTP</Text>
          <Text style={styles.cardSubtitle}>We sent a 6-digit code to {form.phone}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>OTP code</Text>
            <View style={styles.inputWrapper}>
              <AlertCircle size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="123456"
                autoCapitalize="none"
                autoComplete="one-time-code"
                keyboardType="numeric"
                maxLength={6}
                value={form.otp}
                onChangeText={(text) => setForm({ ...form, otp: text })}
              />
            </View>
          </View>

          {!otpSent && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full name</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  autoCapitalize="words"
                  autoComplete="name"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Register as</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    form.role === role.value && styles.roleButtonSelected,
                  ]}
                  onPress={() => setForm({ ...form, role: role.value })}
                >
                  <Text style={[styles.roleLabel, form.role === role.value && styles.roleLabelSelected]}>
                    {role.label}
                  </Text>
                  <Text style={[styles.roleDesc, form.role === role.value && styles.roleDescSelected]}>
                    {role.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {form.role === 'worker' && (
            <Text style={styles.roleHint}>
              As a worker, you'll be able to resolve complaints assigned to you.
            </Text>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={colors.critical} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleVerifyOTP} disabled={submitting}>
            <View style={styles.submitButtonContent}>
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Verify &amp; Continue</Text>
              )}
              <ArrowRight size={18} color={colors.white} style={styles.submitArrow} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={() => setFormType('phone')}>
            <Text style={styles.loginText}>Change phone number</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const MailIcon = () => <Mail size={16} color={colors.textSecondary} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: 14,
    paddingLeft: 8,
    paddingRight: 30,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.criticalBg,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.critical,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 13,
    color: colors.critical,
    flex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  submitArrow: {
    marginLeft: 4,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  signupText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  loginText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  roleButton: {
    flex: 1,
    minWidth: '28%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    backgroundColor: colors.surface3,
    alignItems: 'center',
  },
  roleButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(27, 107, 58, 0.08)',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  roleLabelSelected: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  roleDescSelected: {
    color: colors.primary,
  },
  roleHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
