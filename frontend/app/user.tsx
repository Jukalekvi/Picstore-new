import { Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getGlobalStyles } from "@/styles/globalStyles";

/* User profile screen component. Displays user account information and placeholder text for future features. */
export default function User() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);

    return (
        <View style={styles.centeredContent}>
            <Text style={[styles.mainTitle, { fontSize: 28 }]}>User</Text>
            <Text style={{ textAlign: 'center', color: colors.textMain, fontSize: 16 }}>
                Here you can later view your user stats (total pictures taken, gallery-specific data)
            </Text>
            <Text style={{ textAlign: 'center', color: colors.textMain, fontSize: 16 }}>
                You will be also able to change your credentials (username, password, age and country)
            </Text>
        </View>
    );
}