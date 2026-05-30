import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';
import { apiPost, setAuthToken } from '@/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

/*
    Login screen for Picstore application.
    Handles authentication using JWT and stores token locally.
*/
export default function LoginScreen() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /*
        Handles login request to backend.
        Stores JWT token and navigates user to main app.
    */
    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiPost('/auth/login', {
                username,
                password,
            });

            const token = response.token;

            // Save token permanently
            await AsyncStorage.setItem('token', token);

            // Set token for API client
            setAuthToken(token);

            // Navigate to main app
            router.replace('/');

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

            {/* Username input */}
            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.textMain + '80'}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            {/* Password input */}
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMain + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {/* Error message */}
            {error && (
                <Text style={{ color: colors.danger, marginBottom: 10 }}>
                    {error}
                </Text>
            )}

            {/* Login button */}
            <TouchableOpacity
                style={[
                    styles.buttonBase,
                    styles.buttonPrimary,
                    {
                        marginTop: 10,
                        height: 64,
                        maxHeight: 64,
                    }
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

            {/* Register hint */}
            <TouchableOpacity style={{ marginTop: 20 }}>
                <Text style={{ color: colors.primary, textAlign: 'center' }}>
                    Don&apos;t have an account?
                </Text>
            </TouchableOpacity>
        </View>
    );
}