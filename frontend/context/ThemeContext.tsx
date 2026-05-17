import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS } from '@/styles/theme';

/* Available theme options that users can choose from */
type ThemeMode = 'light' | 'dark' | 'device';

/* Shape of the data provided by the theme context */
interface ThemeContextType {
    themeMode: ThemeMode;
    colors: typeof LIGHT_COLORS;
    setThemeMode: (mode: ThemeMode) => void;
}

/* The context object that holds theme information */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/* This component wraps the entire app and provides theme colors and settings to all screens. */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const deviceScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('device');

    /* When the app first loads, check if the user previously saved a theme preference. */
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('userTheme');
                if (savedTheme) setThemeModeState(savedTheme as ThemeMode);
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        };
        void loadTheme();
    }, []);

    /* This function changes the theme and saves the user's choice to the device. */
    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await AsyncStorage.setItem('userTheme', mode);
    };

    /* Choose which colors to use based on the user's theme selection. */
    const activeColors = themeMode === 'device'
        ? (deviceScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS)
        : (themeMode === 'dark' ? DARK_COLORS : LIGHT_COLORS);

    return (
        <ThemeContext.Provider value={{ themeMode, colors: activeColors, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

/* This hook lets any component access the theme settings. */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};