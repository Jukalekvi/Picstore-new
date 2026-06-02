import { Text, View, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getGlobalStyles } from "@/styles/globalStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
                            await AsyncStorage.removeItem('token');
                            router.replace('/loginscreen' as any);
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
        <View style={styles.centeredContent}>
            <Text style={styles.mainTitle}>User Profile</Text>

            <View style={{ marginVertical: 20, alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', color: colors.textMain, fontSize: 16 }}>
                    Here you can later view your user stats (total pictures taken, gallery-specific data).
                </Text>
            </View>

            {/* Käytetään cameraButtonContainer-tyyliä napin kääreenä, jotta se on samanlainen kuin kamerassa */}
            <View style={styles.cameraButtonContainer}>
                <TouchableOpacity
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