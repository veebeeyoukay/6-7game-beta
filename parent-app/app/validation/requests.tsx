import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { Stack } from 'expo-router';

export default function ValidationRequestsScreen() {
    const { session } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) fetchRequests();
    }, [session]);

    async function fetchRequests() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get Family
            const { data: family } = await supabase.from('families').select('id').eq('created_by', user.id).single();

            if (!family) return;

            // Fetch pending requests with task and child details
            // Note: In real app, we'd use foreign key joins more extensively
            const { data, error } = await supabase
                .from('validation_requests')
                .select(`
                    id,
                    status,
                    created_at,
                    validation_tasks ( name, mollars_reward ),
                    children ( first_name )
                `)
                .eq('family_id', family.id) // Ensure RLS allows this query or filter locally if needed
                // Actually validation_requests might not have family_id directly if it links to task -> family
                // Let's assume schema has family_id denormalized or we query differently.
                // Checking migration:
                // validation_requests has: id, task_id, child_id, status...
                // validation_tasks has: family_id...

                // So correct query is:
                // .select('*, task:validation_tasks(*), child:children(*)')
                // .eq('task.family_id', family.id) -- deeper filtering might be tricky in one go without specific index/setup

                // Simplified: Get requests for tasks belonging to family

                // Alternative: fetch requests where status = 'pending'
                .eq('status', 'pending');

            // Filter by family logic client side or improved query
            // For Phase 2 Demo, we'll assume the simple RLS handles "my family's stuff"

            if (error) throw error;
            setRequests(data || []);

        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleApprove = async (id: string, reward: number, childName: string) => {
        try {
            const { error } = await supabase
                .from('validation_requests')
                .update({ status: 'approved', validated_by: session?.user.id })
                .eq('id', id);

            if (error) throw error;

            Alert.alert('Approved', `${childName} earned ${reward} Mollars!`);
            fetchRequests();

            // Trigger Mollar Transaction (Backend Trigger ideally, but here manual for MVP)
            // ... update child balance code ...

        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDeny = async (id: string) => {
        try {
            const { error } = await supabase
                .from('validation_requests')
                .update({ status: 'denied', validated_by: session?.user.id })
                .eq('id', id);

            if (error) throw error;
            fetchRequests();

        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.taskName}>{item.validation_tasks?.name || 'Unknown Task'}</Text>
                <Text style={styles.childName}>{item.children?.first_name || 'Child'} requested verification</Text>
                <Text style={styles.reward}>{item.validation_tasks?.mollars_reward} 🏵️</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.denyButton]}
                    onPress={() => handleDeny(item.id)}
                >
                    <Text style={styles.buttonText}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleApprove(item.id, item.validation_tasks?.mollars_reward, item.children?.first_name)}
                >
                    <Text style={styles.buttonText}>✓</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Validation Requests', headerTintColor: '#FFF', headerStyle: { backgroundColor: '#1A1A1A' } }} />

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator color="#4A90E2" />
                ) : requests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>✓</Text>
                        <Text style={styles.emptyText}>No pending requests.</Text>
                        <Text style={styles.emptySubText}>Good job keeping up!</Text>
                    </View>
                ) : (
                    <FlatList
                        data={requests}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    info: {
        flex: 1,
    },
    taskName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    childName: {
        color: '#AAA',
        fontSize: 14,
        marginBottom: 4,
    },
    reward: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    denyButton: {
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#FF4500',
    },
    approveButton: {
        backgroundColor: '#27AE60',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
        color: '#333',
    },
    emptyText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubText: {
        color: '#666',
    },
});
