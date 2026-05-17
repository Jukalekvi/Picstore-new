/* Light theme color palette. Used when the app is in light mode or when the device is set to light theme. Colors are designed for good contrast and readability in bright environments. */
export const LIGHT_COLORS = {
    background: '#f5f5f5',      // Main background color for screens
    surface: '#ffffff',          // Surface color for cards, modals, and interactive elements
    textMain: '#333333',         // Primary text color
    textLight: '#ffffff',        // Light text color (usually on dark backgrounds)
    border: '#dddddd',           // Border and divider colors
    primary: '#4CAF50',          // Primary action color (buttons, active states)
    secondary: '#1976D2',        // Secondary action color (alternative actions)
    danger: '#f44336',           // Destructive action color (delete, remove)
    dangerLight: '#FFEBEE',      // Light background for danger/alert states
    infoLight: '#E3F2FD',        // Light background for info/secondary actions
    black: '#000000',            // Pure black for highest contrast elements
};

/* Dark theme color palette. Used when the app is in dark mode or when the device is set to dark theme. Colors are designed for readability and reduced eye strain in low-light environments. */
export const DARK_COLORS = {
    background: '#121212',       // Main background color for screens (very dark)
    surface: '#1e1e1e',          // Surface color for cards, modals, and interactive elements
    textMain: '#f5f5f5',         // Primary text color (light gray)
    textLight: '#ffffff',        // Light text color (pure white)
    border: '#333333',           // Border and divider colors (dark gray)
    primary: '#66BB6A',          // Primary action color (lighter green for dark mode)
    secondary: '#42A5F5',        // Secondary action color (lighter blue for dark mode)
    danger: '#EF5350',           // Destructive action color (lighter red for dark mode)
    dangerLight: '#311b1b',      // Dark background for danger/alert states
    infoLight: '#0d1a26',        // Dark background for info/secondary actions
    black: '#000000',            // Pure black for contrast elements
};

/* Spacing constants for consistent layout and padding throughout the app. Uses semantic naming for common spacing sizes. */
export const SPACING = {
    s: 10,        // Small spacing (gaps between elements)
    m: 15,        // Medium spacing (default padding)
    l: 20,        // Large spacing (section padding)
    xl: 30,       // Extra large spacing (major sections)
    header: 50,   // Header top padding
    modalTop: 60, // Top padding for modal content
};

/* Font size and border radius constants for consistent typography and component styling. Used for text sizing and rounded corners throughout the app. */
export const SIZES = {
    fontSmall: 14,      // Small text (labels, captions)
    fontMedium: 16,     // Medium text (body text)
    fontLarge: 18,      // Large text (section headers)
    fontTitle: 22,      // Title text (screen titles)
    fontMainTitle: 24,  // Main title text (app name, prominent headings)
    radiusCard: 15,     // Border radius for cards
    radiusButton: 25,   // Border radius for buttons (pill-shaped)
    radiusSmall: 8,     // Small border radius (subtle rounding)
};