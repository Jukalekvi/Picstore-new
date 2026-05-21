import React, { useState, useCallback } from 'react';
import { Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert, Modal } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import ObservationForm from '../components/ObservationForm';
import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';
import { CATEGORIES } from "@/constants/categories";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/* Type definition for an observation record displayed in the gallery, now extended with short description string. */
interface Observation {
    id: number;
    speciesName: string;
    description: string | null;
    imagePath: string;
    latitude: number | null;
    longitude: number | null;
    country: string | null;
    city: string | null;
    timestamp: string | null;
    categoryId: number;
}

/* Gallery screen component for displaying and managing user's species observations. Allows users to view their collection of captured observations, edit species names/categories, and delete records. Fetches data from backend API when screen is focused. */
export default function Gallery() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);

    const [observations, setObservations] = useState<Observation[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingObservation, setEditingObservation] = useState<Observation | null>(null);

    /* Fetches all observations from the backend API and updates the local state. Sets loading state during fetch and handles errors gracefully. */
    const fetchObservations = () => {
        // Remember to use your updated school/home network IP address here
        fetch('http://192.168.0.121:8080/api/observations')
            .then(response => response.json())
            .then(data => {
                setObservations(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    };

    /* Deletes an observation record after user confirmation. Shows an alert dialog to confirm before sending DELETE request to backend. */
    const deleteObservation = (id: number) => {
        Alert.alert(
            "Delete Observation",
            "Are you sure you want to delete this species from your collection?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`http://192.168.0.121:8080/api/observations/${id}`, {
                                method: 'DELETE',
                            });

                            if (response.ok) {
                                setObservations(prev => prev.filter(obs => obs.id !== id));
                            } else {
                                Alert.alert("Error", "Server failed to delete the item.");
                            }
                        } catch (error) {
                            console.error('Error deleting data:', error);
                            Alert.alert("Error", "Could not connect to server.");
                        }
                    }
                }
            ]
        );
    };

    /* Updates an observation record with new descriptive metadata and location privacy selections. Sends PUT request to backend with updated dataset payload. */
    const updateObservation = async (formData: {
        speciesName: string,
        description?: string,
        categoryId: number,
        country?: string,
        city?: string,
        latitude?: number | null,
        longitude?: number | null
    }) => {
        if (!editingObservation) return;

        try {
            const response = await fetch(`http://192.168.0.121:8080/api/observations/${editingObservation.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editingObservation,
                    speciesName: formData.speciesName,
                    description: formData.description, /* Forward description string updates directly to the backend API */
                    categoryId: formData.categoryId,
                    country: formData.country,
                    city: formData.city,
                    latitude: formData.latitude,
                    longitude: formData.longitude
                }),
            });

            if (response.ok) {
                Alert.alert("Success", "Observation updated!");
                setEditingObservation(null);
                fetchObservations();
            } else {
                Alert.alert("Error", "Failed to update.");
            }
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert("Error", "Could not connect to server.");
        }
    };

    // Fetch observations when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchObservations();
        }, [])
    );

    // Show loading spinner while fetching observations
    if (loading) {
        return (
            <View style={styles.centeredContent}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, styles.screenPadding]}>
            <Text style={styles.mainTitle}>Your Collection</Text>

            {/* Modal for editing observations */}
            <Modal visible={editingObservation !== null} animationType="slide">
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Observation</Text>
                    {editingObservation && (
                        /* Enriched initialData wrapper object mapping layout properties safely including description */
                        <ObservationForm
                            initialData={{
                                speciesName: editingObservation.speciesName,
                                description: editingObservation.description,
                                imagePath: editingObservation.imagePath,
                                categoryId: editingObservation.categoryId,
                                latitude: editingObservation.latitude,
                                longitude: editingObservation.longitude,
                                country: editingObservation.country,
                                city: editingObservation.city
                            }}
                            onSave={updateObservation}
                            onCancel={() => setEditingObservation(null)}
                            saveButtonText="Update"
                        />
                    )}
                </View>
            </Modal>

            {/* List of observation cards */}
            <FlatList
                data={observations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.imagePath }} style={styles.cardImage} />
                        <View style={styles.cardInfoRow}>
                            <View style={styles.cardTextContainer}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    {/* Category icon with background styling */}
                                    <View style={{
                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                        padding: 6,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <MaterialCommunityIcons
                                            name={(CATEGORIES.find(c => c.id === item.categoryId)?.icon || 'help-circle') as any}
                                            size={22}
                                            color="#000000"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.speciesText}>{item.speciesName}</Text>
                                        {/* Optional visual sub-text rendering for description values directly within list items if present */}
                                        {item.description && (
                                            <Text style={{ fontSize: 12, color: colors.textMain + 'A0', marginTop: 2 }} numberOfLines={1}>
                                                {item.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Edit and delete action buttons */}
                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={{ backgroundColor: colors.infoLight, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}
                                    onPress={() => setEditingObservation(item)}
                                >
                                    <MaterialCommunityIcons name="pencil" size={18} color={colors.secondary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ backgroundColor: colors.dangerLight, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}
                                    onPress={() => deleteObservation(item.id)}
                                >
                                    <MaterialCommunityIcons name="trash-can" size={18} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}