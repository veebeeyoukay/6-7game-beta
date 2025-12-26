import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function ChildProfile() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [grade, setGrade] = useState('');
    const [mollars, setMollars] = useState('');
    const [childData, setChildData] = useState<any>(null);

    useEffect(() => {
        if (id) fetchChildDetails();
    }, [id]);

    async function fetchChildDetails() {
        try {
            const { data, error } = await supabase
                .from('children')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            setChildData(data);
            setFirstName(data.first_name);
            setGrade(data.grade.toString());
            setMollars(data.mollars_balance.toString());
        } catch (error: any) {
            Alert.alert('Error', error.message);
            router.back();
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdate() {
        if (!firstName || !grade) {
            Alert.alert('Error', 'Name and Grade are required.');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('children')
                .update({
                    first_name: firstName,
                    grade: parseInt(grade),
                })
                .eq('id', id);

            if (error) throw error;
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit Profile</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Grade</Text>
                <TextInput
                    style={styles.input}
                    value={grade}
                    onChangeText={setGrade}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Stats</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>💰 Mollars Balance:</Text>
                    <Text style={styles.infoValue}>{mollars}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🟢 Status:</Text>
                    <Text style={[styles.infoValue, { color: childData?.is_paired ? '#4CD964' : '#FF3B30' }]}>
                        {childData?.is_paired ? 'Connected' : 'Not Paired'}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🗓️ Created:</Text>
                    <Text style={styles.infoValue}>
                        {new Date(childData?.created_at).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🔑 Pairing Code:</Text>
                    <Text style={styles.infoValue}>{childData?.pairing_code}</Text>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title={saving ? "Saving..." : "Save Changes"}
                    onPress={handleUpdate}
                    disabled={saving}
                    color="#4A90E2"
                />
            </View>

            <View style={{ marginTop: 15 }}>
                <Button
                    title="Cancel"
                    onPress={() => router.back()}
                    color="#FF3B30"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1A1A1A',
        paddingTop: 40,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 30,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#AAA',
        marginBottom: 8,
        fontSize: 16,
    },
    input: {
        backgroundColor: '#333',
        color: '#FFF',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#444',
    },
    infoCard: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 10,
        marginBottom: 30,
    },
    infoTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        paddingBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        color: '#AAA',
        fontSize: 14,
    },
    infoValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonContainer: {
        marginTop: 10,
    }
});
