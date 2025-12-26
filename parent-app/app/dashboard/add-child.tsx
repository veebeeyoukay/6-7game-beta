import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

export default function AddChild() {
    const [firstName, setFirstName] = useState('');
    const [grade, setGrade] = useState('3');
    const [loading, setLoading] = useState(false);
    const { session } = useAuth();
    const router = useRouter();

    async function handleAddChild() {
        if (!firstName) {
            Alert.alert('Please enter a name');
            return;
        }
        setLoading(true);

        try {
            // 1. Get User's Family
            const { data: family, error: familyError } = await supabase
                .from('families')
                .select('id')
                .eq('created_by', session?.user.id)
                .single();

            if (familyError) throw familyError;

            // 2. Generate random 6-digit code
            const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
            // Set expiry to 24 hours from now
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

            // 3. Insert Child
            const { error: insertError } = await supabase
                .from('children')
                .insert([{
                    family_id: family.id,
                    first_name: firstName,
                    grade: parseInt(grade),
                    pairing_code: pairingCode,
                    pairing_code_expires: expiresAt,
                    is_paired: false,
                }]);

            if (insertError) throw insertError;

            Alert.alert('Success', `Child added! Pairing Code: ${pairingCode}`, [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error: any) {
            Alert.alert('Error adding child', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Add New Child</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="e.g. Leo"
                    placeholderTextColor="#666"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Grade (2-5)</Text>
                <TextInput
                    style={styles.input}
                    value={grade}
                    onChangeText={setGrade}
                    keyboardType="numeric"
                />
            </View>

            <Button title={loading ? "Saving..." : "Create & Generate Code"} onPress={handleAddChild} disabled={loading} color="#4A90E2" />
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
});
