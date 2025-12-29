import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Picker } from '@react-native-picker/picker'; // You might need to install this or use a simple modal
// Note: using simple list for validation to avoid dependency hell in MVP if picker missing
// But plan said (2-5).

export default function ChildrenScreen() {
    const insets = useSafeAreaInsets();
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [familyId, setFamilyId] = useState<string | null>(null);

    // New child form
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('4');
    const [birthMonth, setBirthMonth] = useState('1');
    const [birthYear, setBirthYear] = useState('2015');

    useEffect(() => {
        fetchFamily();
    }, []);

    const fetchFamily = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user?.id);
        if (user) {
            const { data, error } = await supabase
                .from('families')
                .select('id')
                .eq('created_by', user.id)
                .single();

            console.log('Family fetch result:', { data, error });

            if (data) setFamilyId(data.id);
            if (error) Alert.alert('Error', 'Could not fetch family: ' + error.message);
        }
    };

    const addChild = async () => {
        if (!name) {
            Alert.alert('Required', 'Please enter child name');
            return;
        }
        if (!familyId) {
            console.error('No familyId found');
            Alert.alert('Error', 'Family not found. Please try creating a family again.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('children')
                .insert({
                    family_id: familyId,
                    first_name: name,
                    grade: parseInt(grade),
                    birth_month: parseInt(birthMonth),
                    birth_year: parseInt(birthYear),
                    state: 'FL', // Inherit from parent in real app
                    pairing_code: Math.random().toString(36).substring(2, 8).toUpperCase()
                })
                .select()
                .single();

            if (error) throw error;

            setChildren([...children, data]);
            setName(''); // Reset form
            Alert.alert('Success', 'Child added!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleComplete = async () => {
        if (children.length === 0) {
            Alert.alert('Wait', 'Please add at least one child before continuing.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('users')
                    .update({ onboarding_completed: true })
                    .eq('id', user.id);

                if (error) throw error;
                router.replace('/dashboard'); // Go to main app
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Add your Children</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>New Child</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Name"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Grade</Text>
                            <View style={styles.pickerContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={grade}
                                    onChangeText={setGrade}
                                    keyboardType="numeric"
                                    placeholder="2-5"
                                />
                            </View>
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Year</Text>
                            <TextInput
                                style={styles.input}
                                value={birthYear}
                                onChangeText={setBirthYear}
                                keyboardType="numeric"
                                placeholder="YYYY"
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={addChild}>
                        <Text style={styles.addButtonText}>+ Add Child</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listContainer}>
                    <Text style={styles.sectionTitle}>Added Children:</Text>
                    {children.map((child, index) => (
                        <ChildListItem key={index} child={child} />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleComplete}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Finishing...' : 'Complete Setup'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function ChildListItem({ child }: { child: any }) {
    const [revealCode, setRevealCode] = useState(false);

    return (
        <View style={styles.childCard}>
            <View>
                <Text style={styles.childName}>{child.first_name}</Text>
                <Text style={styles.childDetail}>Grade {child.grade}</Text>
            </View>
            <View style={styles.pairingContainer}>
                <Text style={styles.pairingLabel}>Pairing Code:</Text>
                <View style={styles.codeRow}>
                    <Text style={styles.pairingCode}>
                        {revealCode ? (child.pairing_code || 'N/A') : '******'}
                    </Text>
                    <TouchableOpacity onPress={() => setRevealCode(!revealCode)} style={styles.eyeButton}>
                        <Text>{revealCode ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#2A2A2A',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    cardTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#A0A0A0',
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#333333',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#444',
    },
    row: {
        flexDirection: 'row',
    },
    pickerContainer: {
        backgroundColor: '#333',
        borderRadius: 8,
    },
    addButton: {
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4A90E2',
        marginTop: 8,
    },
    addButtonText: {
        color: '#4A90E2',
        fontWeight: 'bold',
    },
    listContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#A0A0A0',
        marginBottom: 12,
    },
    childCard: {
        backgroundColor: '#333',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    childName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    childDetail: {
        color: '#888',
    },
    button: {
        backgroundColor: '#27AE60', // Green for completion
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 0,
    },
    backButton: {
        paddingVertical: 8,
    },
    backButtonText: {
        color: '#A0A0A0',
        fontSize: 16,
    },
    pairingContainer: {
        alignItems: 'flex-end',
    },
    pairingLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 2,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pairingCode: {
        color: '#4A90E2',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    eyeButton: {
        padding: 4,
    },
});
