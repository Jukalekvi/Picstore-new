import { StyleSheet } from 'react-native';
import { SPACING, SIZES } from './theme';

/* Creates a dynamic StyleSheet containing all global app styles. This function takes the current theme colors and generates responsive styles for all components. Styles are organized into logical sections: layouts, cards, forms, buttons, camera, modals, and controls. */
export const getGlobalStyles = (colors: any) => StyleSheet.create({
    // --- LAYOUTS: Basic container and positioning styles ---
    /* Main screen container with flexible layout */
    container: {
        flex: 1,
        backgroundColor: colors.background
    },

    /* Centered content layout for screens with centered content */
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        backgroundColor: colors.background,
    },

    /* Adds horizontal and top padding to screen content */
    screenPadding: {
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.header
    },

    /* Main title text styling for screen headers */
    mainTitle: {
        fontSize: SIZES.fontMainTitle,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: SPACING.l,
        color: colors.textMain,
    },

    // --- CARDS (Gallery): Card display styles for observation items ---
    /* Container for observation cards in the gallery */
    card: {
        backgroundColor: colors.surface,
        borderRadius: SIZES.radiusCard,
        marginBottom: SPACING.m,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },

    /* Image display area within cards */
    cardImage: {
        width: '100%',
        height: 200
    },

    /* Row layout for card information and action buttons */
    cardInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: SPACING.m
    },

    /* Container for card text content */
    cardTextContainer: {
        padding: SPACING.m,
        flex: 1
    },

    /* Species name text styling within cards */
    speciesText: {
        fontSize: SIZES.fontLarge,
        fontWeight: 'bold',
        color: colors.textMain
    },

    // --- FORMS & INPUTS: Form control styles ---
    /* Container for form elements with top padding */
    formWrapper: {
        width: '100%',
        paddingTop: SPACING.modalTop,
        alignItems: 'center'
    },

    /* Main form container with padding */
    formContainer: {
        width: '100%',
        alignItems: 'center',
        padding: SPACING.l
    },

    /* Text input field styling */
    input: {
        backgroundColor: colors.surface,
        width: '100%',
        padding: 15,
        borderRadius: 10,
        fontSize: SIZES.fontLarge,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.textMain,
    },

    /* Image preview in forms (aspect ratio 1:1) */
    imagePreview: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: SIZES.radiusCard,
        marginBottom: 20
    },

    // --- BUTTONS: Button styling across the app ---
    /* Container for multiple buttons in a row */
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.m
    },

    /* Base button styling (used for all button types) */
    buttonBase: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.radiusButton,
        paddingVertical: 15,
        elevation: 3,
    },

    /* Primary action button (positive actions like Save) */
    buttonPrimary: {
        backgroundColor: colors.primary
    },

    /* Secondary action button (alternative actions) */
    buttonSecondary: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border
    },

    /* Danger action button (destructive actions like Delete) */
    buttonDanger: {
        backgroundColor: colors.danger
    },

    /* Text color for light-colored buttons */
    buttonTextLight: {
        color: colors.textLight,
        fontWeight: 'bold',
        fontSize: 16
    },

    /* Text color for dark-colored buttons */
    buttonTextDark: {
        color: colors.textMain,
        fontWeight: 'bold',
        fontSize: 16
    },

    // --- CAMERA SPECIFIC: Camera view styles ---
    /* Container for the camera view display */
    cameraWrapper: {
        width: '90%',
        aspectRatio: 1,
        borderRadius: SIZES.radiusCard,
        overflow: 'hidden',
        backgroundColor: colors.black,
        elevation: 5
    },

    /* Container for camera control buttons (Flip, Capture) */
    cameraButtonContainer: {
        flexDirection: 'row',
        width: '90%',
        gap: SPACING.m,
        marginTop: 20
    },

    // --- MODALS: Modal and overlay styles ---
    /* Container for modal content (full screen) */
    modalContent: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: SPACING.modalTop
    },

    /* Modal title text styling */
    modalTitle: {
        fontSize: SIZES.fontTitle,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: colors.textMain
    },

    // --- SEGMENTED CONTROL: Theme switcher styles ---
    /* Container for segmented control buttons (Light, System, Dark) */
    segmentedControlWrapper: {
        flexDirection: 'row',
        backgroundColor: colors.border,
        borderRadius: SIZES.radiusSmall,
        padding: 4,
        width: '100%',
        height: 50,
    },

    /* Individual segment button styling */
    segment: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: SIZES.radiusSmall - 2,
    },

    /* Active segment button styling */
    activeSegment: {
        backgroundColor: colors.surface,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },

    /* Segment button text styling */
    segmentText: {
        fontSize: SIZES.fontSmall,
        fontWeight: '600',
        color: colors.textMain,
    },

    /* Active segment button text styling */
    activeSegmentText: {
        color: colors.primary,
    },

    // --- Category switcher (for species selection) ---
    /* Container for horizontal scrollable category list */
    categoryList: {
        marginVertical: 15,
        height: 100,
    },

    /* Individual category item styling */
    categoryItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginRight: 15,
        borderRadius: 15,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: 'transparent',
        width: 90,
        height: 80,
    },

    /* Active category item styling (selected state) */
    categoryItemActive: {
        borderColor: colors.primary,
        backgroundColor: colors.infoLight,
    },

    /* Category name text styling */
    categoryText: {
        fontSize: 10,
        marginTop: 5,
        color: colors.textMain,
        textAlign: 'center',
    },
});