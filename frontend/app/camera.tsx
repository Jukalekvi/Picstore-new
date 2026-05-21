import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, Text, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import ObservationForm from '../components/ObservationForm';
import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';

/* Camera screen component for capturing species observations. Manages camera access, location retrieval, image capture, and submission of observations to the backend. Displays either the camera interface for capturing images or a form for entering species details. */
export default function CameraScreen() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);

    const [facing, setFacing] = useState<CameraType>('back');
    const [image, setImage] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const isFocused = useIsFocused();

    /* Saves a new observation to the backend API. Combines form data, captured image URI, and resolved country/city location info into a single request payload. */
    const saveNewObservation = async (formData: { speciesName: string; categoryId: number; country?: string; city?: string }) => {
        const observationData = {
            speciesName: formData.speciesName,
            categoryId: formData.categoryId,
            imagePath: image,
            latitude: latitude,
            longitude: longitude,
            country: formData.country || "Unknown Country", /* Enriched field from reverse geocoding */
            city: formData.city || "Unknown City"          /* Enriched field from reverse geocoding */
        };

        try {
            const response = await fetch('http://192.168.0.121:8080/api/observations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(observationData),
            });

            if (response.ok) {
                Alert.alert("Success", "Observation saved!");
                resetForm();
            } else {
                Alert.alert("Error", "Failed to save observation.");
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert("Error", "Could not connect to the server.");
        }
    };

    /* Captures a photo using the camera and retrieves GPS location data. Requests location permission if not already granted and fetches current position. Updates the image state with the captured photo URI for preview in the form. */
    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    setLatitude(loc.coords.latitude);
                    setLongitude(loc.coords.longitude);
                }

                const photo = await cameraRef.current.takePictureAsync();
                if (photo) setImage(photo.uri);
            } catch (e) {
                console.error("Camera error:", e);
                Alert.alert("Error", "Failed to capture image.");
            }
        }
    };

    /* Resets the form state to clear the captured image and location data. Called after successful observation submission or when user cancels the form. */
    const resetForm = () => {
        setImage(null);
        setLatitude(null);
        setLongitude(null);
    };

    // Show permission request if camera permission hasn't been determined
    if (!permission) return <View style={styles.container} />;

    // Show permission denied message and grant button
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', paddingTop: 100, color: colors.textMain }}>
                    We need your permission to show the camera
                </Text>
                <Button onPress={requestPermission} title="Grant Permission" color={colors.primary} />
            </View>
        );
    }

    // Show form after taking a picture (allows user to enter species details and select category)
    if (image) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.formWrapper}>
                    <Text style={styles.modalTitle}>New Observation</Text>
                    {/* Integrated latitude and longitude into initialData so that ObservationForm can execute reverse-geocoding */}
                    <ObservationForm
                        initialData={{
                            speciesName: '',
                            imagePath: image,
                            latitude: latitude,
                            longitude: longitude
                        }}
                        onSave={saveNewObservation}
                        onCancel={resetForm}
                        saveButtonText="Save Observation"
                    />
                </View>
            </ScrollView>
        );
    }

    // Show camera interface for capturing pictures
    return (
        <View style={styles.container}>
            <View style={styles.formWrapper}>
                <Text style={styles.modalTitle}>Capture Species</Text>

                <View style={styles.cameraWrapper}>
                    {isFocused && (
                        <CameraView
                            ref={cameraRef}
                            style={{ flex: 1 }}
                            facing={facing}
                        />
                    )}
                </View>

                <View style={styles.cameraButtonContainer}>
                    <TouchableOpacity
                        style={[styles.buttonBase, styles.buttonSecondary]}
                        onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
                    >
                        <Text style={styles.buttonTextDark}>Flip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buttonBase, styles.buttonPrimary]}
                        onPress={takePicture}
                    >
                        <Text style={styles.buttonTextLight}>Capture</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}