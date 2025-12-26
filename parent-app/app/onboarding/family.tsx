import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function FamilyScreen() {
    const [familyName, setFamilyName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!familyName) {
            Alert.alert('Required', 'Please enter a family name');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Check if user already has a family created
                const { data: existingFamily } = await supabase
                    .from('families')
                    .select('id')
                    .eq('created_by', user.id)
                    .single();

                if (existingFamily) {
                    // Update exisiting
                    await supabase
                        .from('families')
                        .update({ name: familyName })
                        .eq('id', existingFamily.id);
                } else {
                    // Create new
                    const { error } = await supabase
                        .from('families')
                        .insert({
                            name: familyName,
                            created_by: user.id,
                            adults_count: 1 // Default, can be updated later
                        });
                    if (error) throw error;
                }

                router.push('/onboarding/children');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create your Family</Text>
                <Text style={styles.subtitle}>
                    Give your team a name! This will be displayed on the leaderboard and in battles.
                </Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Family Name</Text>
                    <TextInput
                        style={styles.input}
                        value={familyName}
                        onChangeText={setFamilyName}
                        placeholder="e.g. The Incredibles"
                        placeholderTextColor="#666"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleNext}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Next'}</Text>
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
        padding: 24,
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#A0A0A0',
        marginBottom: 32,
        lineHeight: 22,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#A0A0A0',
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#333333',
        borderRadius: 8,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 18,
    },
    button: {
        backgroundColor: '#4A90E2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
