import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, Text, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import ObservationForm from '../components/ObservationForm';
import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';

/* Camera screen component for capturing species observations. Manages camera access, location retrieval, image capture, and submission of observations to the backend. Displays either the camera interface for capturing images or a form for entering species details, now supporting 200-character description strings. */
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

    /* Saves a new observation to the backend API using Multipart FormData to support binary image uploads. */
    const saveNewObservation = async (formData: { speciesName: string; description?: string; categoryId: number; country?: string; city?: string; latitude?: number | null; longitude?: number | null }) => {

        // Initialize a new FormData object for the multipart request layout required by the updated backend
        const data = new FormData();

        // Append mandatory textual parameters
        data.append('speciesName', formData.speciesName || 'Unknown Species');
        data.append('categoryId', String(formData.categoryId ?? 8));

        // Only append optional strings if they actually contain data (avoids sending "undefined" as string)
        if (formData.description && formData.description.trim() !== "") {
            data.append('description', formData.description);
        }

        // Resolve location data based on current form states or fallback parameters
        const finalLat = formData.latitude !== undefined ? formData.latitude : latitude;
        const finalLng = formData.longitude !== undefined ? formData.longitude : longitude;

        if (finalLat !== null && finalLat !== undefined) {
            data.append('latitude', String(finalLat));
        }
        if (finalLng !== null && finalLng !== undefined) {
            data.append('longitude', String(finalLng));
        }

        if (formData.country) data.append('country', formData.country);
        if (formData.city) data.append('city', formData.city);

        // Prepare and append the binary image asset if it exists locally inside temporary execution caches
        if (image) {
            const filename = image.split('/').pop() || 'observation.png';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/png`;

            // Enforce the specific object abstraction required by React Native to stream actual files via fetch
            data.append('image', {
                uri: image,
                name: filename,
                type: type
            } as any);
        } else {
            Alert.alert("Error", "No image captured to upload.");
            return;
        }

        try {
            /* Forward the processed multipart stream payload containing textual strings and binary attachments */
            const response = await fetch('http://192.168.0.121:8080/api/observations', {
                method: 'POST',
                body: data,
                headers: {
                    // MUST BE EMPTY: Let fetch set the boundary automatically for multipart data
                },
            });

            if (response.ok) {
                Alert.alert("Success", "Observation saved!");
                resetForm();
            } else {
                // Let's print the error status code to help debug what the backend didn't like
                console.log("[Backend Error Status]:", response.status);
                Alert.alert("Error", `Failed to save observation. (Status: ${response.status})`);
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
                    {/* Integrated description initialization and shared raw coordinates layout parameters safely */}
                    <ObservationForm
                        initialData={{
                            speciesName: '',
                            description: '', /* Initialize description string as empty for new creation forms */
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