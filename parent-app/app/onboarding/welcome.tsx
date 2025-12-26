import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.emoji}>👋</Text>
                <Text style={styles.title}>Welcome to The 6-7 Game</Text>
                <Text style={styles.subtitle}>
                    Let&apos;s set up your family profile to get started with battles, validation, and learning.
                </Text>

                <View style={styles.stepsContainer}>
                    <Step number="1" text="Create your parent profile" />
                    <Step number="2" text="Verify your identity (KYC)" />
                    <Step number="3" text="Set up your family" />
                    <Step number="4" text="Add your children" />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/onboarding/profile')}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

function Step({ number, text }: { number: string, text: string }) {
    return (
        <View style={styles.step}>
            <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>{number}</Text>
            </View>
            <Text style={styles.stepText}>{text}</Text>
        </View>
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
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 64,
        marginBottom: 20,
        textAlign: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#A0A0A0',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    stepsContainer: {
        marginBottom: 48,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stepNumber: {
        color: '#4A90E2',
        fontWeight: 'bold',
        fontSize: 16,
    },
    stepText: {
        color: '#E0E0E0',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4A90E2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
