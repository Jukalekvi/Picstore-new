import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '@/api/apiClient';

/**
 * Loads authentication state from device storage
 * and restores JWT token into API client.
 *
 * Returns true if user has valid stored session.
 */
export async function loadAuthState(): Promise<boolean> {
    try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            return false;
        }

        setAuthToken(token);

        return true;
    } catch (error) {
        console.error('Failed to load auth state:', error);
        return false;
    }
}