import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

type Child = {
    id: string;
    first_name: string;
    mollars_balance: number;
    is_paired: boolean;
    pairing_code: string;
};

export default function Dashboard() {
    const { session } = useAuth();
    const [children, setChildren] = useState<Child[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (session) getChildren();
    }, [session]);

    async function getChildren() {
        try {
            // 1. Get family associated with user
            const { data: families, error: familyError } = await supabase
                .from('families')
                .select('id')
                .eq('created_by', session?.user.id)
                .single();

            if (familyError && familyError.code !== 'PGRST116') throw familyError;

            if (!families) {
                // Create family if not exists (Auto-create for MVP)
                const { data: newFamily, error: createError } = await supabase
                    .from('families')
                    .insert([{ name: 'My Family', created_by: session?.user.id }])
                    .select()
                    .single();
                if (createError) throw createError;
                // fetch children for new family (empty)
                return;
            }

            // 2. Get children
            const { data: kids, error: childrenError } = await supabase
                .from('children')
                .select('*')
                .eq('family_id', families.id);

            if (childrenError) throw childrenError;
            setChildren(kids || []);
        } catch (error: any) {
            Alert.alert('Error loading dashboard', error.message);
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
            onPress={() => router.push(`/dashboard/child/${item.id}`)}
        >
            <View>
                <Text style={styles.childName}>{item.first_name}</Text>
                <Text style={styles.childStatus}>{item.is_paired ? '🟢 Connected' : '🔴 Not Paired'}</Text>
            </View>
            <View style={styles.balanceContainer}>
                <Text style={styles.balanceText}>{item.mollars_balance} 💰</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Family Dashboard</Text>

            <View style={styles.listContainer}>
                {children.length === 0 ? (
                    <Text style={styles.emptyText}>No children added yet.</Text>
                ) : (
                    <FlatList
                        data={children}
                        renderItem={renderChildItem}
                        keyExtractor={(item) => item.id}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                )}
            </View>

            <View style={styles.footer}>
                <Button
                    title="Add Child"
                    onPress={() => router.push('/dashboard/add-child')}
                    color="#4A90E2"
                />
                <View style={{ marginTop: 10 }} >
                    <Button
                        title="Sign Out"
                        onPress={() => supabase.auth.signOut()}
                        color="#FF4500"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1A1A1A',
        paddingTop: 60,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
    },
    listContainer: {
        flex: 1,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    childCard: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    childName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    childStatus: {
        fontSize: 12,
        color: '#AAA',
        marginTop: 4,
    },
    balanceContainer: {
        backgroundColor: '#444',
        padding: 8,
        borderRadius: 8,
    },
    balanceText: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 20,
        marginBottom: 20,
    },
});
