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

            console.log('LOGIN RESPONSE:', response);

            const accessToken = response.accessToken;
            const refreshToken = response.refreshToken;

            if (!accessToken) {
                throw new Error('No accessToken in response');
            }

            // 1. persist storage
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);

            // 2. memory token (API client)
            setAuthToken(accessToken);

            // 3. IMPORTANT: direct navigation (DO NOT go through index)
            router.replace('/(tabs)');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { justifyContent: 'center', padding: 20 }]}>

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
                <Text style={{ color: colors.danger, marginBottom: 10 }}>
                    {error}
                </Text>
            )}

            <TouchableOpacity
                style={[
                    styles.buttonBase,
                    styles.buttonPrimary,
                    { marginTop: 10, height: 64, maxHeight: 64 }
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

        </View>
    );
}