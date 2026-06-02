import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, Text, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ObservationForm from '../../components/ObservationForm';
import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';

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

    const saveNewObservation = async (formData: { speciesName: string; description?: string; categoryId: number; country?: string; city?: string; latitude?: number | null; longitude?: number | null }) => {
        const token = await AsyncStorage.getItem('accessToken');
        const data = new FormData();

        data.append('speciesName', formData.speciesName || 'Unknown Species');
        data.append('categoryId', String(formData.categoryId ?? 8));

        if (formData.description && formData.description.trim() !== "") {
            data.append('description', formData.description);
        }

        const finalLat = formData.latitude !== undefined ? formData.latitude : latitude;
        const finalLng = formData.longitude !== undefined ? formData.longitude : longitude;

        if (finalLat !== null && finalLat !== undefined) data.append('latitude', String(finalLat));
        if (finalLng !== null && finalLng !== undefined) data.append('longitude', String(finalLng));
        if (formData.country) data.append('country', formData.country);
        if (formData.city) data.append('city', formData.city);

        if (image) {
            const filename = image.split('/').pop() || 'observation.png';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/png`;

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
            const response = await fetch('http://192.168.0.121:8080/api/observations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data,
            });

            if (response.ok) {
                Alert.alert("Success", "Observation saved!");
                resetForm();
            } else {
                const errorText = await response.text();
                console.log("[Backend Error Status]:", response.status);
                console.log("[Backend Error Body]:", errorText);
                Alert.alert("Error", `Failed to save observation. (Status: ${response.status})`);
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert("Error", "Could not connect to the server.");
        }
    };

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

    const resetForm = () => {
        setImage(null);
        setLatitude(null);
        setLongitude(null);
    };

    if (!permission) return <View style={styles.container} />;

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

    if (image) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.formWrapper}>
                    <Text style={styles.modalTitle}>New Observation</Text>
                    <ObservationForm
                        initialData={{
                            speciesName: '',
                            description: '',
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