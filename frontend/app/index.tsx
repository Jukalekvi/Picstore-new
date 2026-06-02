import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { getToken } from '@/auth/tokenStorage';
import { initAuthToken } from '@/api/apiClient';

export default function Index() {
    const router = useRouter();
    const { colors } = useTheme();

    useEffect(() => {
        const bootstrap = async () => {
            await initAuthToken();

            const token = await getToken();

            if (token) {
                router.replace('/(tabs)');
            } else {
                router.replace('/loginscreen');
            }
        };

        bootstrap();
    }, []);

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