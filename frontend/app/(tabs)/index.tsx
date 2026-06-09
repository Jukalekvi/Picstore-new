import { Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getGlobalStyles } from "@/styles/globalStyles";

/* Home screen displaying the Picstore app welcome message. Serves as the landing page for users and displays the app title and welcome text. Will contain feed/updates of other users in the future */
export default function Index() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);

    return (
        <View testID="home-screen" style={styles.centeredContent}>
            <Text testID="home-title" style={[styles.mainTitle, { fontSize: 28 }]}>Picstore</Text>
            <Text style={{ textAlign: 'center', color: colors.textMain, fontSize: 16 }}>
                Welcome to Picstore, the application for filling galleries with pictures you have taken and sharing them with.
            </Text>
            <Text style={{ textAlign: 'center', color: colors.textMain, fontSize: 16 }}>
                Later this page will also show your feed (activities of your friends & followed people )
            </Text>
        </View>
    );
}
