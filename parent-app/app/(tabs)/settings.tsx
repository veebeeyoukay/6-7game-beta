import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function SettingsScreen() {
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Error', error.message);
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Settings</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.item} onPress={() => { }}>
                        <Text style={styles.itemText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item} onPress={() => { }}>
                        <Text style={styles.itemText}>Manage Family</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item} onPress={() => router.push('/settings/referrals')}>
                        <Text style={[styles.itemText, { color: '#FFD700' }]}>Refer & Earn 🏵️</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
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
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 32,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: 'bold',
    },
    item: {
        backgroundColor: '#333',
        padding: 16,
        borderRadius: 10,
        marginBottom: 8,
    },
    itemText: {
        color: '#FFF',
        fontSize: 16,
    },
    signOutButton: {
        backgroundColor: '#2A2A2A',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF4500',
    },
    signOutText: {
        color: '#FF4500',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
