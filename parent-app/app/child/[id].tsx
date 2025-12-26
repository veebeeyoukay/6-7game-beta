import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

export default function ChildDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [child, setChild] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ battles: 0, winRate: 0, tasks: 0 });

    useEffect(() => {
        fetchChildDetails();
    }, [id]);

    async function fetchChildDetails() {
        try {
            const { data, error } = await supabase
                .from('children')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setChild(data);

            // Fetch Mock Stats for now (Phase 2A)
            // specific queries will be added in Phase 2C
            setStats({
                battles: 12,
                winRate: 75,
                tasks: 5
            });

        } catch (error: any) {
            Alert.alert('Error', error.message);
            router.back();
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </SafeAreaView>
        );
    }

    if (!child) return null;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{
                headerShown: true,
                title: child.first_name,
                headerStyle: { backgroundColor: '#1A1A1A' },
                headerTintColor: '#FFF'
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Profile Section */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTextLarge}>{child.first_name[0]}</Text>
                    </View>
                    <Text style={styles.name}>{child.first_name}</Text>
                    <Text style={styles.grade}>Grade {child.grade}</Text>

                    <View style={styles.pairingContainer}>
                        <Text style={styles.pairingLabel}>Pairing Code:</Text>
                        <TouchableOpacity onPress={() => Alert.alert('Copied', 'Code copied to clipboard')}>
                            <Text style={styles.pairingCode}>{child.pairing_code || 'generate'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Balance Card */}
                <View style={[styles.card, styles.balanceCard]}>
                    <View>
                        <Text style={styles.cardLabel}>Current Balance</Text>
                        <Text style={styles.balanceAmount}>{child.mollars_balance} 🏵️</Text>
                    </View>
                    <TouchableOpacity style={styles.topUpButton} onPress={() => Alert.alert('Coming Soon', 'Manual adjustment feature coming soon.')}>
                        <Text style={styles.topUpText}>Manage</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <Text style={styles.sectionTitle}>Performance</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.battles}</Text>
                        <Text style={styles.statLabel}>Battles</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.winRate}%</Text>
                        <Text style={styles.statLabel}>Win Rate</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.tasks}</Text>
                        <Text style={styles.statLabel}>Tasks Done</Text>
                    </View>
                </View>

                {/* Settings / Actions */}
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.actionList}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => { }}>
                        <Text style={styles.actionText}>Edit Profile</Text>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={() => { }}>
                        <Text style={styles.actionText}>View Question History</Text>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={() => { }}>
                        <Text style={styles.actionText}>Manage Schedule</Text>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    content: {
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#2A2A2A',
    },
    avatarTextLarge: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFF',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    grade: {
        fontSize: 16,
        color: '#888',
        marginBottom: 16,
    },
    pairingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    pairingLabel: {
        color: '#888',
        marginRight: 8,
    },
    pairingCode: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#2A2A2A',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    balanceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    cardLabel: {
        color: '#AAA',
        marginBottom: 4,
    },
    balanceAmount: {
        color: '#FFD700',
        fontSize: 32,
        fontWeight: 'bold',
    },
    topUpButton: {
        backgroundColor: '#444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    topUpText: {
        color: '#FFF',
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statNumber: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: '#666',
        fontSize: 12,
    },
    actionList: {
        backgroundColor: '#2A2A2A',
        borderRadius: 16,
    },
    actionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    actionText: {
        color: '#FFF',
        fontSize: 16,
    },
    chevron: {
        color: '#666',
        fontSize: 18,
    },
});
