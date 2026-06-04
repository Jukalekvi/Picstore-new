import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';
import { apiPost } from '@/api/apiClient';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            await apiPost('/auth/register', {
                username,
                email,
                password
            });
            Alert.alert("Success", "Account created! You can now log in.");
            router.back();
        } catch (err: any) {
            console.error(err);
            Alert.alert("Error", err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, styles.screenPadding, { justifyContent: 'center' }]}>
            <Text style={[styles.mainTitle, { marginBottom: 30 }]}>
                Create Account
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.textMain + '80'}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

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

            <TouchableOpacity
                style={[styles.buttonBase, styles.buttonPrimary, { maxHeight: 64 }]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.textLight} />
                ) : (
                    <Text style={styles.buttonTextLight}>Register</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={{ marginTop: 20, alignItems: 'center' }}
                onPress={() => router.back()}
            >
                <Text style={{ color: colors.textMain }}>
                    Already have an account? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Login</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}