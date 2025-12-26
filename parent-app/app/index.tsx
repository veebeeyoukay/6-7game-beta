import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, Text, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    async function handleAuth() {
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (error) throw error;

                // Check onboarding status
                const { data: user } = await supabase
                    .from('users')
                    .select('onboarding_completed')
                    .eq('id', (await supabase.auth.getUser()).data.user?.id)
                    .single();

                if (user && user.onboarding_completed) {
                    router.replace('/dashboard');
                } else {
                    router.replace('/onboarding/welcome');
                }
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                Alert.alert('Please check your inbox for email verification!');
            }
        } catch (error: any) {
            Alert.alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>The 6-7 Game</Text>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TextInput
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#999"
                />
            </View>
            <View style={styles.verticallySpaced}>
                <TextInput
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#999"
                />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button title={isLogin ? "Sign in" : "Sign up"} disabled={loading} onPress={handleAuth} color="#4A90E2" />
            </View>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchContainer}>
                <Text style={styles.switchText}>
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#1A1A1A', // Dark mode background
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#E0E0E0',
        textAlign: 'center',
        marginBottom: 40,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
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
    switchContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: '#4A90E2',
    }
});
