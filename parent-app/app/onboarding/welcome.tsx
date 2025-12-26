import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandColors, SemanticColors, BorderRadius, Spacing } from '../../constants/brand';

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
        backgroundColor: BrandColors.deepNavy,
    },
    content: {
        flex: 1,
        padding: Spacing['2xl'],
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 64,
        marginBottom: Spacing.xl,
        textAlign: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: BrandColors.softWhite,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    subtitle: {
        fontSize: 18,
        color: SemanticColors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing['5xl'],
        lineHeight: 24,
    },
    stepsContainer: {
        marginBottom: Spacing['5xl'],
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: SemanticColors.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.lg,
    },
    stepNumber: {
        color: BrandColors.electricBlue,
        fontWeight: 'bold',
        fontSize: 16,
    },
    stepText: {
        color: BrandColors.softWhite,
        fontSize: 16,
    },
    button: {
        backgroundColor: BrandColors.magenta,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    buttonText: {
        color: BrandColors.softWhite,
        fontSize: 18,
        fontWeight: '600',
    },
});
