import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react-native';
import { api, extractErrorMessage } from '../../lib/api';
import { colors } from '../../lib/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Request failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (err) {
      setError(extractErrorMessage(err, 'Resend failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.checkCircle}>
              <CheckCircle size={32} color={colors.success} />
            </View>
            <Text style={styles.appName}>CleaniCity</Text>
            <Text style={styles.subtitle}>Check your email</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reset link sent</Text>
            <Text style={styles.cardSubtitle}>
              If an account exists for {email}, a password reset link has been sent to your inbox.
            </Text>

            <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Mail size={20} color={colors.primary} />
              )}
              <Text style={[styles.resendText, submitting && styles.resendTextDisabled]}>
                {submitting ? 'Sending…' : 'Didn’t receive it? Resend'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
              <ArrowLeft size={16} color={colors.textSecondary} style={{ transform: [{ scaleX: -1 }] }} />
              <Text style={styles.loginText}>Back to sign in</Text>
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
            <ShieldCheck size={32} color={colors.white} />
          </View>
          <Text style={styles.appName}>CleaniCity</Text>
          <Text style={styles.subtitle}>Reset your password</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Forgot password?</Text>
          <Text style={styles.cardSubtitle}>
            Enter your email address and we’ll send you a link to reset your password.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={colors.critical} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <View style={styles.submitButtonContent}>
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Send reset link</Text>
              )}
              <ArrowRight size={18} color={colors.white} style={styles.submitArrow} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
            <ArrowLeft size={16} color={colors.textSecondary} style={{ transform: [{ scaleX: -1 }] }} />
            <Text style={styles.loginText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

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
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.successBg,
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
    lineHeight: 22,
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
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: colors.textSecondary,
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
});
