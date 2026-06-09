import { Text, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { getGlobalStyles } from "@/styles/globalStyles";

/* This screen lets users choose their preferred theme - light, dark, or system default. Their choice is saved to the device. */
export default function Settings() {
    const { themeMode, setThemeMode, colors } = useTheme();
    const styles = getGlobalStyles(colors);

    /* A button that represents one theme option. It becomes highlighted when selected. */
    const Segment = ({ mode, label }: { mode: 'light' | 'device' | 'dark', label: string }) => {
        const isActive = themeMode === mode;

        return (
            <TouchableOpacity
                testID={`theme-${mode}-button`}
                accessibilityLabel={`Theme ${label}`}
                style={[styles.segment, isActive && styles.activeSegment]}
                onPress={() => setThemeMode(mode)}
                activeOpacity={0.7}
            >
                <Text style={[styles.segmentText, isActive && styles.activeSegmentText]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View testID="settings-screen" style={styles.centeredContent}>
            <Text testID="settings-title" style={styles.mainTitle}>Settings</Text>

            <View style={{ width: '100%', paddingHorizontal: 10 }}>
                <Text style={{ color: colors.textMain, marginBottom: 12, fontWeight: '600' }}>
                    Appearance
                </Text>

                <View style={styles.segmentedControlWrapper}>
                    <Segment mode="light" label="Light" />
                    <Segment mode="device" label="System" />
                    <Segment mode="dark" label="Dark" />
                </View>

                <Text style={{ color: colors.textMain, marginTop: 12, fontSize: 12, opacity: 0.6, textAlign: 'center' }}>
                    Currently using {themeMode} mode
                </Text>
            </View>
        </View>
    );
}
