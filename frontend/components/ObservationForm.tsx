import React, { useState, useEffect } from 'react';
import { View, TextInput, Image, TouchableOpacity, Text, FlatList, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';
import { CATEGORIES } from '@/constants/categories';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

/* This form is used to enter or edit details about a species observation. It displays the photo, location details with a privacy toggle, and handles metadata updates including a 200-character description. */
export default function ObservationForm({ initialData, onSave, onCancel, saveButtonText = "Save" }: any) {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);

    const [name, setName] = useState(initialData.speciesName);
    /* State to hold the description string */
    const [description, setDescription] = useState(initialData.description || '');
    /* If no category is provided, default to category 8 which is "Undefined" */
    const [selectedCategory, setSelectedCategory] = useState(initialData.categoryId || 8);

    /* Dedicated states for human-readable location data initialized with existing data if present */
    const [resolvedCountry, setResolvedCountry] = useState(initialData.country || "Resolving country...");
    const [resolvedCity, setResolvedCity] = useState(initialData.city || "Resolving city...");
    const [isGeocoding, setIsGeocoding] = useState(false);

    /* Privacy Toggle: Controls whether location data is attached to the observation record */
    const [shareLocation, setShareLocation] = useState(initialData.country !== "Private Location");

    /* Automatically trigger reverse-geocoding only if existing location data is missing but raw coordinates exist */
    useEffect(() => {
        const fetchLocationDetails = async () => {
            /* If the observation already has resolved city/country from backend, skip the API call */
            if (initialData.country && initialData.city && initialData.country !== "Private Location") {
                setResolvedCountry(initialData.country);
                setResolvedCity(initialData.city);
                return;
            }

            setIsGeocoding(true);
            try {
                if (initialData.latitude && initialData.longitude) {
                    const geoResponse = await Location.reverseGeocodeAsync({
                        latitude: Number(initialData.latitude),
                        longitude: Number(initialData.longitude)
                    });

                    if (geoResponse.length > 0) {
                        const country = geoResponse[0].country || "Unknown Country";
                        const city = geoResponse[0].city || geoResponse[0].subregion || "Unknown City";

                        setResolvedCountry(country);
                        setResolvedCity(city);
                        console.log(`[Geocoding Success] Found location: ${city}, ${country}`);
                    }
                } else {
                    setResolvedCountry("No GPS data");
                    setResolvedCity("No GPS data");
                }
            } catch (error) {
                console.error("[Geocoding Error] Failed to resolve location for UI:", error);
                setResolvedCountry("Unknown Country");
                setResolvedCity("Unknown City");
            } finally {
                setIsGeocoding(false);
            }
        };

        /* Invoke the async method safely inside useEffect hook */
        void fetchLocationDetails();
    }, [initialData.latitude, initialData.longitude, initialData.country, initialData.city]);

    /* Package and forward the enriched observation entity, respecting the user's privacy choices and including the description */
    const handleSave = () => {
        onSave({
            ...initialData,
            speciesName: name,
            description: description,
            categoryId: selectedCategory,
            /* If user disabled location sharing, save as Private, otherwise use resolved values */
            country: shareLocation ? resolvedCountry : "Private Location",
            city: shareLocation ? resolvedCity : "Private Location",
            /* Nullify raw coordinates if privacy toggle is turned off */
            latitude: shareLocation ? initialData.latitude : null,
            longitude: shareLocation ? initialData.longitude : null
        });
    };

    /* Displays one category option as a selectable item in the list. */
    const renderCategoryItem = ({ item }: any) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                selectedCategory === item.id && styles.categoryItemActive
            ]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <MaterialCommunityIcons
                name={item.icon}
                size={30}
                color={selectedCategory === item.id ? colors.primary : colors.textMain}
            />
            <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.formContainer}>
                {/* Shows the photo that was taken */}
                <Image source={{ uri: initialData.imagePath }} style={styles.imagePreview} />

                {/* Privacy Settings Control Panel Widget */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    backgroundColor: colors.textMain + '08',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10
                }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="shield-account" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                        <Text style={{ color: colors.textMain, fontSize: 14, fontWeight: '500' }}>
                            Include location tags
                        </Text>
                    </View>
                    <Switch
                        value={shareLocation}
                        onValueChange={setShareLocation}
                        trackColor={{ false: '#767577', true: colors.primary + '80' }}
                        thumbColor={shareLocation ? colors.primary : '#f4f3f4'}
                    />
                </View>

                {/* UI Location Display Widget: Conditional rendering based on the privacy switch state */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    backgroundColor: shareLocation ? colors.primary + '15' : colors.textMain + '10',
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 15
                }}>
                    <MaterialCommunityIcons
                        name={shareLocation ? "map-marker-radius" : "map-marker-off"}
                        size={20}
                        color={shareLocation ? colors.primary : colors.textMain + '60'}
                        style={{ marginRight: 8 }}
                    />
                    {isGeocoding ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Text style={{
                            color: shareLocation ? colors.textMain : colors.textMain + '60',
                            fontSize: 14,
                            fontWeight: '500',
                            textDecorationLine: shareLocation ? 'none' : 'line-through'
                        }}>
                            Location: {shareLocation ? `${resolvedCity}, ${resolvedCountry}` : "Hidden by user"}
                        </Text>
                    )}
                </View>

                {/* Text box to type the species name */}
                <TextInput
                    style={styles.input}
                    placeholder="Species name"
                    placeholderTextColor={colors.textMain + '80'}
                    value={name}
                    onChangeText={setName}
                />

                {/* Text box to type the short description with length validation character counter */}
                <View style={{ alignSelf: 'stretch', marginBottom: 15 }}>
                    <TextInput
                        style={[styles.input, { height: 80, paddingTop: 10, textAlignVertical: 'top' }]}
                        placeholder="Description / notes (max 200 chars)"
                        placeholderTextColor={colors.textMain + '80'}
                        value={description}
                        onChangeText={setDescription}
                        maxLength={200}
                        multiline={true}
                    />
                    <Text style={{ alignSelf: 'flex-end', color: colors.textMain + '60', fontSize: 11, marginTop: 2 }}>
                        {description.length} / 200
                    </Text>
                </View>

                {/* Label for the category selection */}
                <Text style={{ alignSelf: 'flex-start', color: colors.textMain, fontWeight: 'bold', marginBottom: 10 }}>
                    Select category:
                </Text>

                {/* List of category icons you can scroll through */}
                <FlatList
                    data={CATEGORIES}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryList}
                />

                {/* Cancel and Save buttons at the bottom */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.buttonBase, styles.buttonDanger]} onPress={onCancel}>
                        <Text style={styles.buttonTextLight}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buttonBase, styles.buttonPrimary]}
                        onPress={handleSave}
                    >
                        <Text style={styles.buttonTextLight}>{saveButtonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}