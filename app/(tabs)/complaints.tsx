import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin, Clock, ShieldCheck } from 'lucide-react-native';
import { api, extractErrorMessage } from '../../lib/api';
import { colors } from '../../lib/colors';

interface Complaint {
  id: string;
  title: string;
  description: string;
  address: string;
  priority: string;
  status: string;
  createdAt: string;
  citizen?: { id: string; name: string; email: string };
}

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  pending: { color: '#B45309', bg: '#FDDECD' },
  assigned: { color: '#2563EB', bg: '#DBEAFE' },
  in_progress: { color: '#2563EB', bg: '#DBEAFE' },
  resolved: { color: '#15803D', bg: '#DCFCE7' },
  reviewed: { color: '#15803D', bg: '#DCFCE7' },
};

const PRIORITY_STYLES: Record<string, { color: string }> = {
  critical: { color: '#DC2626' },
  high: { color: '#EA580C' },
  medium: { color: '#D97706' },
  low: { color: '#15803D' },
};

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.data.complaints || res.data.data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load complaints.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints();
  }, []);

  const renderItem = ({ item }: { item: Complaint }) => {
    const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
    const priorityStyle = PRIORITY_STYLES[item.priority] || { color: colors.textMuted };
    return (
      <TouchableOpacity style={styles.complaintCard}>
        <View style={styles.complaintHeader}>
          <MapPin size={16} color={priorityStyle.color} />
          <Text style={styles.complaintTitle}>{item.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: (priorityStyle.color as string) + '20' }]}>
            <Text style={[styles.priorityText, { color: priorityStyle.color }]}>{item.priority}</Text>
          </View>
        </View>
        <Text style={styles.complaintAddress}>{item.address}</Text>
        <View style={styles.complaintMeta}>
          <Clock size={14} color={colors.textMuted} />
          <Text style={styles.complaintTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={complaints}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShieldCheck size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No complaints yet</Text>
            <Text style={styles.emptySubtitle}>Reports will appear here.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {loading && complaints.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading complaints…</Text>
        </View>
      )}

      {error && complaints.length === 0 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchComplaints}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 90,
  },
  complaintCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  complaintTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 8,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  complaintAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  complaintMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 6,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.critical,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
