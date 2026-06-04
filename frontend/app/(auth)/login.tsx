import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';
import { apiPost, setAuthToken } from '@/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function LoginScreen() {

    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiPost('/auth/login', {
                email,
                password,
            });

            const { accessToken, refreshToken } = response;

            if (!accessToken) {
                setError('No access token received');
                setLoading(false);
                return;
            }

            // Persistence
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);

            // Memory
            await setAuthToken(accessToken);

            // Navigation
            router.replace('/(tabs)');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, styles.screenPadding, { justifyContent: 'center' }]}>

            <Text style={[styles.mainTitle, { marginBottom: 30 }]}>
                Picstore Login
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textMain + '80'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMain + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {error && (
                <Text style={{ color: colors.danger, marginBottom: 10, textAlign: 'center' }}>
                    {error}
                </Text>
            )}

            <TouchableOpacity
                style={[
                    styles.buttonBase,
                    styles.buttonPrimary,
                    { maxHeight: 64 }
                ]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.textLight} />
                ) : (
                    <Text style={styles.buttonTextLight}>Login</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={{ marginTop: 20, alignItems: 'center' }}
                onPress={() => router.push('/(auth)/register')}
            >
                <Text style={{ color: colors.textMain }}>
                    Need an account? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Register</Text>
                </Text>
            </TouchableOpacity>

        </View>
    );
}