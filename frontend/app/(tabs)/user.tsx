import { Text, View, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getGlobalStyles } from "@/styles/globalStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { setAuthToken } from "@/api/apiClient";
import { deleteToken } from "@/lib/tokenStorage";

export default function User() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'token']);
                            await setAuthToken(null);
                            await deleteToken();
                            router.replace('/(auth)/login' as any);
                        } catch (error) {
                            console.error("Logout error:", error);
                            Alert.alert("Error", "Failed to log out.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View testID="user-screen" style={styles.centeredContent}>
            <Text testID="user-title" style={styles.mainTitle}>User Profile</Text>

            <View style={{ marginVertical: 20, alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', color: colors.textMain, fontSize: 16 }}>
                    Here you can later view your user stats (total pictures taken, gallery-specific data).
                </Text>
            </View>

            <View style={styles.cameraButtonContainer}>
                <TouchableOpacity
                    testID="logout-button"
                    accessibilityLabel="Log Out"
                    style={[styles.buttonBase, styles.buttonDanger]}
                    onPress={handleLogout}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="logout" size={20} color={colors.textLight} style={{ marginRight: 8 }} />
                        <Text style={styles.buttonTextLight}>
                            Log Out
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
