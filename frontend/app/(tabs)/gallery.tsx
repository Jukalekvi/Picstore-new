import React, { useState, useCallback } from 'react';
import { Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert, Modal, ScrollView, TextInput } from "react-native";
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

type SortMode = 'newest' | 'oldest' | 'alphabetical';
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export default function Gallery() {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);
    const router = useRouter();

    const [observations, setObservations] = useState<Observation[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortMode, setSortMode] = useState<SortMode>('newest');

    const getFullImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        return imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;
    };

    const fetchObservations = useCallback(async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const response = await fetch(`${BASE_URL}/api/observations`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.status === 401) { router.replace('/(auth)/login' as any); return; }
            const data = await response.json();
            setObservations(Array.isArray(data) ? data : []);
        } catch (e) { console.error('Fetch error:', e); } finally { setLoading(false); }
    }, [router]);

    useFocusEffect(useCallback(() => { void fetchObservations(); }, [fetchObservations]));

    const deleteObservation = async (id: number) => {
        const token = await AsyncStorage.getItem('accessToken');
        Alert.alert("Delete", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                    const res = await fetch(`${BASE_URL}/api/observations/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    if (res.ok) setObservations(prev => prev.filter(o => o.id !== id));
                }}
        ]);
    };

    const updateObservation = async (formData: any) => {
        if (!editingObservation) return;
        const token = await AsyncStorage.getItem('accessToken');
        const res = await fetch(`${BASE_URL}/api/observations/${editingObservation.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ...editingObservation, ...formData }),
        });
        if (res.ok) { setEditingObservation(null); await fetchObservations(); }
    };

    const toggleSortMode = () => setSortMode(prev => prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'alphabetical' : 'newest');

    const processedObservations = observations
        .filter(o => selectedCategoryFilter === null || o.categoryId === selectedCategoryFilter)
        .filter(o => o.speciesName?.toLowerCase().includes(searchQuery.toLowerCase()) || o.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortMode === 'newest') return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
            if (sortMode === 'oldest') return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
            return (a.speciesName || '').localeCompare(b.speciesName || '');
        });

    const getSortIconAndLabel = () => {
        if (sortMode === 'newest') return { icon: 'sort-clock-descending', label: 'Newest first' };
        if (sortMode === 'oldest') return { icon: 'sort-clock-ascending', label: 'Oldest first' };
        return { icon: 'sort-alphabetical-variant', label: 'Alphabetical (A-Z)' };
    };

    if (loading) return <View style={styles.centeredContent}><ActivityIndicator size="large" color={colors.primary} /></View>;

    return (
        <View testID="gallery-screen" style={[styles.container, styles.screenPadding]}>
            <Text testID="gallery-title" style={styles.mainTitle}>Your Collection</Text>

            <View style={styles.searchSortContainer}>
                <TextInput
                    testID="gallery-search-input"
                    accessibilityLabel="Search observations"
                    style={styles.searchBarInput}
                    placeholder="Search..."
                    placeholderTextColor={colors.textMain + '60'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity
                    testID="gallery-sort-button"
                    accessibilityLabel="Toggle sort order"
                    style={styles.sortActionButton}
                    onPress={toggleSortMode}
                >
                    <MaterialCommunityIcons name={getSortIconAndLabel().icon as any} size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.sortInfoRow}><Text style={styles.sortInfoText}>Order: {getSortIconAndLabel().label}</Text></View>

            <View style={styles.filterBarContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
                    <TouchableOpacity
                        testID="gallery-filter-all"
                        accessibilityLabel="Filter All"
                        style={[styles.filterButton, selectedCategoryFilter === null ? styles.filterButtonActive : styles.filterButtonInactive]}
                        onPress={() => setSelectedCategoryFilter(null)}
                    >
                        <Text style={{ color: selectedCategoryFilter === null ? "#ffffff" : colors.textMain }}>All</Text>
                    </TouchableOpacity>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            testID={`gallery-filter-${cat.name}`}
                            accessibilityLabel={`Filter ${cat.name}`}
                            style={[styles.filterButton, selectedCategoryFilter === cat.id ? styles.filterButtonActive : styles.filterButtonInactive]}
                            onPress={() => setSelectedCategoryFilter(cat.id)}
                        >
                            <Text style={{ color: selectedCategoryFilter === cat.id ? "#ffffff" : colors.textMain }}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Modal visible={editingObservation !== null} animationType="slide">
                <View style={styles.modalContent}>
                    {editingObservation && <ObservationForm initialData={{ ...editingObservation, imagePath: getFullImageUrl(editingObservation.imagePath) }} onSave={updateObservation} onCancel={() => setEditingObservation(null)} saveButtonText="Update" />}
                </View>
            </Modal>

            <FlatList
                data={processedObservations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View testID={`observation-card-${item.id}`} accessibilityLabel={`Observation ${item.speciesName}`} style={styles.card}>
                        <Image source={{ uri: getFullImageUrl(item.imagePath) }} style={styles.cardImage} />
                        <View style={styles.cardInfoRow}>
                            <View style={styles.cardTextContainer}>
                                <View style={styles.cardHeaderRow}>
                                    <View style={styles.iconBadge}>
                                        <MaterialCommunityIcons name={(CATEGORIES.find(c => c.id === item.categoryId)?.icon || 'help-circle') as any} size={22} color="#000000" />
                                    </View>
                                    <View style={styles.cardTextWrapper}>
                                        <Text style={styles.speciesText}>{item.speciesName}</Text>
                                        {item.description && <Text style={[styles.descriptionText, { color: colors.textMain + 'A0' }]} numberOfLines={1}>{item.description}</Text>}
                                    </View>
                                </View>
                            </View>
                            <View style={styles.actionButtonRow}>
                                <TouchableOpacity
                                    testID={`edit-observation-${item.id}`}
                                    accessibilityLabel={`Edit ${item.speciesName}`}
                                    style={{ backgroundColor: colors.infoLight, padding: 8, borderRadius: 8 }}
                                    onPress={() => setEditingObservation(item)}
                                >
                                    <MaterialCommunityIcons name="pencil" size={18} color={colors.secondary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID={`delete-observation-${item.id}`}
                                    accessibilityLabel={`Delete ${item.speciesName}`}
                                    style={{ backgroundColor: colors.dangerLight, padding: 8, borderRadius: 8 }}
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
