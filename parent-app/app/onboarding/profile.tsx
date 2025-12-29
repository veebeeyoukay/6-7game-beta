import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState(''); // Changed to string for text input
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObj, setDateObj] = useState(new Date()); // Keep track against object for Picker

    const [state, setState] = useState('FL');
    const [zip, setZip] = useState('');
    const [referralCode, setReferralCode] = useState(''); // New State
    const [loading, setLoading] = useState(false);

    // Add validation helper
    const isValidDate = (dateString: string) => {
        const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
        if (!regex.test(dateString)) return false;
        const [mm, dd, yyyy] = dateString.split('/').map(Number);
        const date = new Date(yyyy, mm - 1, dd);
        return date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd;
    };

    const handleNext = async () => {
        if (!firstName || !lastName || !zip || !dob) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!isValidDate(dob)) {
            Alert.alert('Error', 'Please enter a valid date of birth (MM/DD/YYYY)');
            return;
        }

        // Convert MM/DD/YYYY to YYYY-MM-DD
        const [mm, dd, yyyy] = dob.split('/');
        const isoDate = `${yyyy}-${mm}-${dd}`;

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
                        date_of_birth: isoDate,
                        state: state,
                        zip_code: zip,
                        referred_by_code: referralCode.trim() || null
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

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateObj(selectedDate);
            // Format to MM/DD/YYYY
            const mm = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const dd = selectedDate.getDate().toString().padStart(2, '0');
            const yyyy = selectedDate.getFullYear();
            setDob(`${mm}/${dd}/${yyyy}`);
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
                    <View style={styles.dateRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 8 }]}
                            value={dob}
                            onChangeText={(text) => {
                                // Remove any non-numeric characters
                                const cleaned = text.replace(/[^0-9]/g, '');
                                let formatted = cleaned;

                                // Auto-insert slashes
                                if (cleaned.length > 2) {
                                    formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
                                }
                                if (cleaned.length > 4) {
                                    formatted = formatted.substring(0, 5) + '/' + cleaned.substring(4, 8);
                                }

                                setDob(formatted);
                            }}
                            placeholder="MM/DD/YYYY"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            maxLength={10}
                        />
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.iconText}>📅</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={dateObj}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
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
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    iconText: {
        fontSize: 20,
    },
});
