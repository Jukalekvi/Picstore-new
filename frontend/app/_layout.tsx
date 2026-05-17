import { Tabs } from 'expo-router';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/* TabRoot component that defines the bottom tab navigation structure. Renders 5 main navigation tabs: Camera, Gallery, Home, Settings, and User. Uses the current theme colors for styling the tab bar. */
function TabRoot() {
    const { colors } = useTheme();
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMain,
        }}>
            <Tabs.Screen
                name="camera"
                options={{
                    title: 'Camera',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="camera" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="gallery"
                options={{
                    title: 'Gallery',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="image-multiple" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="user"
                options={{
                    title: 'User',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    );
}

/* Main layout component for the entire app. Wraps the tab navigation with ThemeProvider to enable theme support throughout the app. Exported as the default layout for the Expo Router navigation system. */
export default function TabLayout() {
    return (
        <ThemeProvider>
            <TabRoot />
        </ThemeProvider>
    );
}