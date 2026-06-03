import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { getToken } from '@/lib/tokenStorage';
import { setAuthToken } from '@/api/apiClient';

export default function Index() {
    const router = useRouter();
    const { colors } = useTheme();

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const token = await getToken();
                if (token) {
                    await setAuthToken(token);
                    router.replace('/(tabs)');
                } else {
                    router.replace('/(auth)/login');
                }
            } catch (error) {
                console.error('Bootstrap failed', error);
                router.replace('/(auth)/login');
            }
        };

        bootstrap();
    }, [router]);

    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}