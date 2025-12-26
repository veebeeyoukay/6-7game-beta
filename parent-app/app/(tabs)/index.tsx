import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

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
            <TouchableOpacity onPress={() => router.push('/onboarding/children')}><Text style={{ color: '#4A90E2', marginTop: 10 }}>Add Child</Text></TouchableOpacity>
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
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  familyName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalBalance: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  totalAmount: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
  },
  childCard: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  childStatus: {
    color: '#AAA',
    fontSize: 12,
  },
  balanceContainer: {
    backgroundColor: '#444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  balanceText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    gap: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabSecondary: {
    backgroundColor: '#27AE60',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFF',
  },
});
