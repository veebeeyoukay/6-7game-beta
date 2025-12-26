import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { BrandColors, SemanticColors, BorderRadius, Spacing } from '../../constants/brand';

type Child = {
  id: string;
  first_name: string;
  mollars_balance: number;
  is_paired: boolean;
  pairing_code: string;
};

export default function HomeScreen() {
  const { session } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [familyMollars, setFamilyMollars] = useState(0);

  useEffect(() => {
    if (session) getChildren();
  }, [session]);

  async function getChildren() {
    try {
      // 1. Get family
      const { data: families, error: familyError } = await supabase
        .from('families')
        .select('id')
        .eq('created_by', session?.user.id)
        .single();

      if (!families) return;

      // 2. Get children
      const { data: kids, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', families.id);

      if (childrenError) throw childrenError;
      setChildren(kids || []);

      // Calculate totals
      const total = (kids || []).reduce((acc: number, child: any) => acc + (child.mollars_balance || 0), 0);
      setFamilyMollars(total);

    } catch (error: any) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getChildren();
  }, [session]);

  const renderChildItem = ({ item }: { item: Child }) => (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => {
        // Navigate to detail view
        router.push(`/child/${item.id}`);
      }}
    >
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{item.first_name[0]}</Text>
      </View>
      <View style={styles.childInfo}>
        <Text style={styles.childName}>{item.first_name}</Text>
        <Text style={styles.childStatus}>{item.is_paired ? '🟢 Connected' : '🔴 Tap to Pair'}</Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>{item.mollars_balance} 💰</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.familyName}>The Family</Text>
        </View>
        <View style={styles.totalBalance}>
          <Text style={styles.totalLabel}>Family Bank</Text>
          <Text style={styles.totalAmount}>{familyMollars} 🏵️</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Battles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Your Squad</Text>
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No kids added yet.</Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/children')}><Text style={{ color: BrandColors.electricBlue, marginTop: 10 }}>Add Child</Text></TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={children}
            renderItem={renderChildItem}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* Quick Action FABs */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, styles.fabSecondary]} onPress={() => router.push('/validation/requests')}>
          <Text style={styles.fabIcon}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/dashboard/create-battle')}>
          <Text style={styles.fabIcon}>⚔️</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.deepNavy,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  greeting: {
    color: SemanticColors.textSecondary,
    fontSize: 14,
  },
  familyName: {
    color: BrandColors.softWhite,
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalBalance: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    color: SemanticColors.textSecondary,
    fontSize: 12,
  },
  totalAmount: {
    color: BrandColors.warmGold,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: SemanticColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    color: BrandColors.softWhite,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: SemanticColors.textMuted,
    fontSize: 12,
  },
  sectionTitle: {
    color: BrandColors.softWhite,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: SemanticColors.textMuted,
  },
  childCard: {
    backgroundColor: SemanticColors.backgroundCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  avatarInitial: {
    color: BrandColors.softWhite,
    fontSize: 20,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    color: BrandColors.softWhite,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  childStatus: {
    color: SemanticColors.textSecondary,
    fontSize: 12,
  },
  balanceContainer: {
    backgroundColor: SemanticColors.backgroundInput,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  balanceText: {
    color: BrandColors.warmGold,
    fontWeight: 'bold',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BrandColors.magenta,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabSecondary: {
    backgroundColor: BrandColors.brightTeal,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  fabIcon: {
    fontSize: 24,
    color: BrandColors.softWhite,
  },
});
