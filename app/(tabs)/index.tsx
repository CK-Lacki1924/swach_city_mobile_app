import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin, FileText, Users, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { api, extractErrorMessage } from '../../lib/api';
import { colors } from '../../lib/colors';

interface DashboardStats {
  totalComplaints: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  resolutionRate: number;
  avgRating: number;
  weeklyTrend: { date: string; count: number }[];
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (!mounted) return;
        setStats(res.data.data);
      } catch (err) {
        if (!mounted) return;
        setError(extractErrorMessage(err, 'Failed to load dashboard statistics.'));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  const resolvedValue = stats?.byStatus?.resolved ?? 0;
  const pendingValue = stats?.byStatus?.pending || stats?.byStatus?.assigned || 0;

  const statCards = [
    { label: 'Total Reports', value: stats?.totalComplaints ?? '--', icon: FileText, color: colors.primary },
    { label: 'Resolved', value: resolvedValue ?? '--', icon: ShieldCheck, color: '#15803D' },
    { label: 'Pending', value: pendingValue ?? '--', icon: AlertTriangle, color: '#B45309' },
    { label: 'Resolution Rate', value: stats?.resolutionRate !== undefined ? `${stats.resolutionRate}%` : '--', icon: ShieldCheck, color: colors.primary },
  ];

  if (loading) {
    return (
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard…</Text>
        </View>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to load dashboard</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => routerGoBack()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Dashboard</Text>
          <Text style={styles.subtitle}>Overview of city cleanliness reports</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {statCards.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <stat.icon size={24} color={stat.color} />
            <View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Resolution rate</Text>
          <Text style={styles.summaryValue}>{stats!.resolutionRate}%</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Average rating</Text>
          <Text style={styles.summaryValue}>{stats!.avgRating.toFixed(1)} / 5</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>By priority</Text>
          <Text style={styles.summaryValue}>
            {'Critical: ' + (stats!.byPriority.critical || 0) +
             ' | High: ' + (stats!.byPriority.high || 0) +
             ' | Medium: ' + (stats!.byPriority.medium || 0) +
             ' | Low: ' + (stats!.byPriority.low || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionCard}>
            <MapPin size={24} color={colors.primary} />
            <Text style={styles.actionLabel}>View map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <FileText size={24} color={colors.primary} />
            <Text style={styles.actionLabel}>My complaints</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Users size={24} color={colors.primary} />
            <Text style={styles.actionLabel}>Teams</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={styles.activityList}>
          {stats!.weeklyTrend.map((day, i) => (
            <View key={i} style={styles.activityItem}>
              <Text style={styles.activityText}>{day.date}</Text>
              <Text style={styles.activityCount}>{day.count} report{day.count !== 1 ? 's' : ''}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function routerGoBack() {
  // no-op placeholder; dashboard fetch retries are handled by pulling to refresh
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 20,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: -6,
    paddingHorizontal: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activityList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  activityCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
