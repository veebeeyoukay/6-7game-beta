import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { BrandColors, SemanticColors, BorderRadius, Spacing } from '../../constants/brand';

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
                        <Text style={[styles.itemText, { color: BrandColors.warmGold }]}>Refer & Earn 🏵️</Text>
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
        backgroundColor: BrandColors.deepNavy,
    },
    content: {
        flex: 1,
        padding: Spacing['2xl'],
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: BrandColors.softWhite,
        marginBottom: Spacing['3xl'],
    },
    section: {
        marginBottom: Spacing['3xl'],
    },
    sectionTitle: {
        color: SemanticColors.textMuted,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: 'bold',
    },
    item: {
        backgroundColor: SemanticColors.backgroundCard,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    itemText: {
        color: BrandColors.softWhite,
        fontSize: 16,
    },
    signOutButton: {
        backgroundColor: SemanticColors.backgroundCard,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BrandColors.magenta,
    },
    signOutText: {
        color: BrandColors.magenta,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
