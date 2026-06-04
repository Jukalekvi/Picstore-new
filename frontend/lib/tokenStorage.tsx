import * as SecureStore from 'expo-secure-store';

/* Key used to store JWT token securely on device */
const TOKEN_KEY = 'picstore_token';

/* Saves JWT token after login */
export async function saveToken(token: string) {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
        console.error('[TokenStorage] Failed to save token:', error);
    }
}

/* Retrieves JWT token for API requests */
export async function getToken() {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('[TokenStorage] Failed to get token:', error);
        return null;
    }
}

/* Deletes token on logout */
export async function deleteToken() {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('[TokenStorage] Failed to delete token:', error);
    }
}