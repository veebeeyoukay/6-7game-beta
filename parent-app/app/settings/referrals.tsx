import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { Stack } from 'expo-router';

export default function ReferralScreen() {
    const { session } = useAuth();
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [stats, setStats] = useState({ signups: 0, earned: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) fetchReferralData();
    }, [session]);

    async function fetchReferralData() {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('referral_code')
                .eq('id', session?.user.id)
                .single();

            if (error) throw error;

            if (!user?.referral_code) {
                // Generate one if missing (should be done on trigger, but client fallback)
                const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                await supabase.from('users').update({ referral_code: code }).eq('id', session?.user.id);
                setReferralCode(code);
            } else {
                setReferralCode(user.referral_code);
            }

            // Fetch stats (mock for phase 2E initial)
            setStats({ signups: 3, earned: 150 });

        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join me on The 6-7 Game! Use my code ${referralCode} to get 50 bonus Mollars!`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Refer & Earn', headerTintColor: '#FFF', headerStyle: { backgroundColor: '#1A1A1A' } }} />

            <View style={styles.content}>
                <Text style={styles.title}>Invite Friends</Text>
                <Text style={styles.subtitle}>Get 50 Mollars for every family that joins!</Text>

                <View style={styles.codeCard}>
                    <Text style={styles.codeLabel}>YOUR CODE</Text>
                    {loading ? <ActivityIndicator color="#4A90E2" /> : (
                        <Text style={styles.code}>{referralCode || '...'}</Text>
                    )}
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Text style={styles.shareButtonText}>Share Code</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Your Impact</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.signups}</Text>
                        <Text style={styles.statLabel}>Signups</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.earned}</Text>
                        <Text style={styles.statLabel}>Mollars Earned</Text>
                    </View>
                </View>

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
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#AAA',
        textAlign: 'center',
        marginBottom: 32,
    },
    codeCard: {
        width: '100%',
        backgroundColor: '#2A2A2A',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#4A90E2',
    },
    codeLabel: {
        color: '#666',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1,
    },
    code: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 24,
        letterSpacing: 2,
    },
    shareButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    shareButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        alignSelf: 'flex-start',
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    statCard: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 4,
    },
    statLabel: {
        color: '#AAA',
        fontSize: 12,
    },
});
