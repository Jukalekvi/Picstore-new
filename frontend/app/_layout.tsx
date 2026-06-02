import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RootNavigator() {
    const { colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');

                if (token) {
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch (e) {
                console.error('Auth check failed', e);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colors.background,
                }}
            >
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {!authenticated ? (
                <Stack.Screen name="loginscreen" />
            ) : (
                <Stack.Screen name="(tabs)" />
            )}
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootNavigator />
        </ThemeProvider>
    );
}