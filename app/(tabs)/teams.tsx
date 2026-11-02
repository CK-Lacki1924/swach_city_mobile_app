import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Users, User, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { api, extractErrorMessage } from '../../lib/api';
import { colors } from '../../lib/colors';

interface Team {
  id: string;
  name: string;
  totalPoints: number;
  officer: { id: string; name: string; email: string };
  members: { id: string; name: string; email: string; points: number }[];
}

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data.data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load teams.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeams();
  }, []);

  const renderItem = ({ item }: { item: Team }) => {
    return (
      <TouchableOpacity style={styles.teamCard}>
        <View style={styles.teamHeader}>
          <Users size={26} color={colors.primary} />
          <View>
            <Text style={styles.teamTitle}>{item.name}</Text>
            <Text style={styles.teamOfficer}>Officer: {item.officer.name}</Text>
          </View>
          <ShieldCheck size={26} color={colors.primary} />
        </View>
        <Text style={styles.teamPoints}>
          {item.totalPoints} total points
        </Text>
        <View style={styles.memberList}>
          {item.members.map((m) => (
            <View key={m.id} style={styles.memberRow}>
              <User size={16} color={colors.textMuted} />
              <Text style={styles.memberName}>{m.name}</Text>
              <Text style={styles.memberPoints}>{m.points} pts</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No teams yet</Text>
            <Text style={styles.emptySubtitle}>Teams created by officers will appear here.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {loading && teams.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading teams…</Text>
        </View>
      )}

      {error && teams.length === 0 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTeams}>
            <AlertCircle size={18} color={colors.white} style={{ marginRight: 8 }} />
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
  teamCard: {
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
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  teamOfficer: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  teamPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
  },
  memberList: {
    gap: 8,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  memberName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  memberPoints: {
    fontSize: 13,
    color: colors.textMuted,
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
    flexDirection: 'row',
    alignItems: 'center',
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
