import React, { useState, useCallback } from 'react';
import { Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert, Modal, ScrollView } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import ObservationForm from '../components/ObservationForm';
import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';
import { CATEGORIES } from "@/constants/categories";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

export default function Gallery() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);

    const [observations, setObservations] = useState<Observation[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);

    const fetchObservations = () => {
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
                    description: formData.description,
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

    useFocusEffect(
        useCallback(() => {
            fetchObservations();
        }, [])
    );

    const filteredObservations = selectedCategoryFilter === null
        ? observations
        : observations.filter(obs => obs.categoryId === selectedCategoryFilter);

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

            {/* Filter Bar Widget connected to global universal stylesheet properties */}
            <View style={styles.filterBarContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    {/* "All" button */}
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            selectedCategoryFilter === null ? styles.filterButtonActive : styles.filterButtonInactive
                        ]}
                        onPress={() => setSelectedCategoryFilter(null)}
                    >
                        <MaterialCommunityIcons
                            name="image-multiple"
                            size={16}
                            color={selectedCategoryFilter === null ? "#ffffff" : colors.textMain}
                        />
                        <Text style={[
                            styles.filterButtonText,
                            { color: selectedCategoryFilter === null ? "#ffffff" : colors.textMain }
                        ]}>
                            All
                        </Text>
                    </TouchableOpacity>

                    {/* Dynamic categories mappings */}
                    {CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.filterButton,
                                selectedCategoryFilter === category.id ? styles.filterButtonActive : styles.filterButtonInactive
                            ]}
                            onPress={() => setSelectedCategoryFilter(category.id)}
                        >
                            <MaterialCommunityIcons
                                name={category.icon as any}
                                size={16}
                                color={selectedCategoryFilter === category.id ? "#ffffff" : colors.textMain}
                            />
                            <Text style={[
                                styles.filterButtonText,
                                { color: selectedCategoryFilter === category.id ? "#ffffff" : colors.textMain }
                            ]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Modal visible={editingObservation !== null} animationType="slide">
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Observation</Text>
                    {editingObservation && (
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

            <FlatList
                data={filteredObservations}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                    <Text style={styles.emptyListText}>
                        No observations found in this category.
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.imagePath }} style={styles.cardImage} />
                        <View style={styles.cardInfoRow}>
                            <View style={styles.cardTextContainer}>
                                <View style={styles.cardHeaderRow}>
                                    <View style={styles.iconBadge}>
                                        <MaterialCommunityIcons
                                            name={(CATEGORIES.find(c => c.id === item.categoryId)?.icon || 'help-circle') as any}
                                            size={22}
                                            color="#000000"
                                        />
                                    </View>
                                    <View style={styles.cardTextWrapper}>
                                        <Text style={styles.speciesText}>{item.speciesName}</Text>
                                        {item.description && (
                                            <Text style={[styles.descriptionText, { color: colors.textMain + 'A0' }]} numberOfLines={1}>
                                                {item.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            <View style={styles.actionButtonRow}>
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