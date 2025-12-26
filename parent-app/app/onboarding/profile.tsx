import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [state, setState] = useState('FL');
    const [zip, setZip] = useState('');
    const [referralCode, setReferralCode] = useState(''); // New State
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!firstName || !lastName || !zip) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`
                }
            });

            if (error) throw error;

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error: dbError } = await supabase
                    .from('users')
                    .update({
                        first_name: firstName,
                        last_name: lastName,
                        date_of_birth: dob.toISOString().split('T')[0],
                        state: state,
                        zip_code: zip,
                        referred_by_code: referralCode.trim() || null // Save if present
                    })
                    .eq('id', user.id);

                if (dbError) throw dbError;
                router.push('/onboarding/kyc');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Your Profile</Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="e.g. Jane"
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="e.g. Doe"
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={[styles.inputText, { color: '#FFF' }]}>
                            {dob.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={dob}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDob(selectedDate);
                        }}
                        maximumDate={new Date()}
                    />
                )}

                <View style={[styles.row, { marginBottom: 20 }]}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>State</Text>
                        <TextInput
                            style={styles.input}
                            value={state}
                            onChangeText={setState}
                            maxLength={2}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={[styles.formGroup, { flex: 2 }]}>
                        <Text style={styles.label}>ZIP Code</Text>
                        <TextInput
                            style={styles.input}
                            value={zip}
                            onChangeText={setZip}
                            keyboardType="numeric"
                            maxLength={5}
                            placeholder="12345"
                            placeholderTextColor="#666"
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Referral Code (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={referralCode}
                        onChangeText={setReferralCode}
                        placeholder="e.g. FRIEND123"
                        placeholderTextColor="#666"
                        autoCapitalize="characters"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleNext}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Next'}</Text>
                </TouchableOpacity>
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
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 32,
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
        fontSize: 16,
    },
    inputText: {
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
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
