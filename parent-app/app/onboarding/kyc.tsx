import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function KYCScreen() {
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async (side: 'front' | 'back') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            if (side === 'front') setFrontImage(result.assets[0].uri);
            else setBackImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string, path: string) => {
        // In a real app, upload to Supabase Storage
        // For MVP/Demo, we just store the URI or a dummy URL if it's local
        return `https://dummy-storage.com/${path}`;
    };

    const handleNext = async () => {
        if (!frontImage || !backImage) {
            Alert.alert('Required', 'Please upload both front and back of your ID');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Mock upload for now
                const frontUrl = await uploadImage(frontImage, `${user.id}/kyc_front.jpg`);
                const backUrl = await uploadImage(backImage, `${user.id}/kyc_back.jpg`);

                const { error } = await supabase
                    .from('users')
                    .update({
                        kyc_front_url: frontUrl,
                        kyc_back_url: backUrl,
                        kyc_submitted_at: new Date().toISOString(),
                        kyc_status: 'pending' // pending manual review or simulation
                    })
                    .eq('id', user.id);

                if (error) throw error;
                router.push('/onboarding/family');
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
                <Text style={styles.title}>Parental Verification</Text>
                <Text style={styles.subtitle}>
                    We need to verify you&apos;re an adult to comply with COPPA (Children&apos;s Online Privacy Protection Act). Please upload a driver&apos;s license or government ID.
                </Text>

                <View style={styles.uploadContainer}>
                    <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('front')}>
                        {frontImage ? (
                            <Image source={{ uri: frontImage }} style={styles.previewImage} />
                        ) : (
                            <>
                                <Text style={styles.uploadIcon}>🆔</Text>
                                <Text style={styles.uploadText}>Front of ID</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('back')}>
                        {backImage ? (
                            <Image source={{ uri: backImage }} style={styles.previewImage} />
                        ) : (
                            <>
                                <Text style={styles.uploadIcon}>🔄</Text>
                                <Text style={styles.uploadText}>Back of ID</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleNext}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Submit & Continue'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/onboarding/family')} style={styles.skipButton}>
                    <Text style={styles.skipText}>Skip for now (Demo Mode)</Text>
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
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#A0A0A0',
        marginBottom: 32,
        lineHeight: 22,
    },
    uploadContainer: {
        flex: 1,
        gap: 20,
    },
    uploadBox: {
        flex: 1,
        backgroundColor: '#333333',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#444',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 150,
        overflow: 'hidden',
    },
    uploadIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    uploadText: {
        color: '#E0E0E0',
        fontSize: 16,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
    skipButton: {
        padding: 16,
        alignItems: 'center',
    },
    skipText: {
        color: '#666',
    }
});
