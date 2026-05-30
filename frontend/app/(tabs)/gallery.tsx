import React, { useState, useCallback } from 'react';
import { Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert, Modal, ScrollView, TextInput } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import ObservationForm from '../../components/ObservationForm';
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

/* Sorting modes configuration type */
type SortMode = 'newest' | 'oldest' | 'alphabetical';

// Base URL targeting the workstation server IP address for asset rendering fallback
const BASE_URL = 'http://192.168.0.121:8080';

export default function Gallery() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);

    const [observations, setObservations] = useState<Observation[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);

    /* New States for Search queries and Sorting behaviors */
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortMode, setSortMode] = useState<SortMode>('newest');

    // Helper function to dynamically prepend backend base URL if the path is relative
    const getFullImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        return imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;
    };

    const fetchObservations = () => {
        fetch(`${BASE_URL}/api/observations`)
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
                            const response = await fetch(`${BASE_URL}/api/observations/${id}`, {
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
            const response = await fetch(`${BASE_URL}/api/observations/${editingObservation.id}`, {
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

    /* Cycles through the available sorting options when clicked */
    const toggleSortMode = () => {
        if (sortMode === 'newest') setSortMode('oldest');
        else if (sortMode === 'oldest') setSortMode('alphabetical');
        else setSortMode('newest');
    };

    /* Master processing pipeline: Category filter -> Search text query filter -> Sort rules executor */
    const processedObservations = observations
        /* Step 1: Category filtering */
        .filter(obs => selectedCategoryFilter === null || obs.categoryId === selectedCategoryFilter)
        /* Step 2: Text search matching against both species name and description fields */
        .filter(obs => {
            const query = searchQuery.toLowerCase();
            const nameMatch = obs.speciesName?.toLowerCase().includes(query);
            const descMatch = obs.description?.toLowerCase().includes(query);
            return nameMatch || descMatch;
        })
        /* Step 3: Array sorting based on selected rules context */
        .sort((a, b) => {
            if (sortMode === 'newest') {
                return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
            }
            if (sortMode === 'oldest') {
                return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
            }
            if (sortMode === 'alphabetical') {
                return (a.speciesName || '').localeCompare(b.speciesName || '');
            }
            return 0;
        });

    /* Helper mapper for visual feedback on sorting label states */
    const getSortIconAndLabel = () => {
        if (sortMode === 'newest') return { icon: 'sort-clock-descending', label: 'Newest first' };
        if (sortMode === 'oldest') return { icon: 'sort-clock-ascending', label: 'Oldest first' };
        return { icon: 'sort-alphabetical-variant', label: 'Alphabetical (A-Z)' };
    };

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

            {/* NEW: Search Bar & Sorting Action Hub Layout Block */}
            <View style={styles.searchSortContainer}>
                <TextInput
                    style={styles.searchBarInput}
                    placeholder="Search by name or description..."
                    placeholderTextColor={colors.textMain + '60'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    clearButtonMode="while-editing"
                />
                <TouchableOpacity
                    style={styles.sortActionButton}
                    onPress={toggleSortMode}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name={getSortIconAndLabel().icon as any}
                        size={22}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* NEW: Info label display indicating active order conditions */}
            <View style={styles.sortInfoRow}>
                <Text style={styles.sortInfoText}>
                    Order: {getSortIconAndLabel().label}
                </Text>
            </View>

            {/* Horizontal Filter Bar Widget */}
            <View style={styles.filterBarContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
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
                                // Dynamically unpack full URI string layout for the editing preview layout context
                                imagePath: getFullImageUrl(editingObservation.imagePath),
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

            {/* Render processed (filtered and sorted) observations */}
            <FlatList
                data={processedObservations}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                    <Text style={styles.emptyListText}>
                        No results match your search parameters.
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {/* Dynamic absolute link resolution targeting local server system configurations */}
                        <Image source={{ uri: getFullImageUrl(item.imagePath) }} style={styles.cardImage} />
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