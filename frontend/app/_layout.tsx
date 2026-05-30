import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { getToken } from '@/auth/tokenStorage';

function RootNavigator() {
    const { colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await getToken();

                if (token) {
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        void checkAuth();
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
            {/* Kaikki reitit rekisteröidään normaalisti */}
            <Stack.Screen name="loginscreen" />

            {/* Suojatut tabit */}
            <Stack.Screen
                name="(tabs)"
                options={{
                    gestureEnabled: false,
                }}
            />
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