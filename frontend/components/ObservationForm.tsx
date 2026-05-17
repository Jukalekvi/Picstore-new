import React, { useState } from 'react';
import { View, TextInput, Image, TouchableOpacity, Text, FlatList, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { getGlobalStyles } from '@/styles/globalStyles';
import { CATEGORIES } from '@/constants/categories';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/* This form is used to enter details about a species observation. It displays the photo, lets you type the species name, and choose a category. */
export default function ObservationForm({ initialData, onSave, onCancel, saveButtonText = "Save" }: any) {
    const { colors } = useTheme();
    const styles = getGlobalStyles(colors);

    const [name, setName] = useState(initialData.speciesName);
    /* If no category is provided, default to category 8 which is "Undefined" */
    const [selectedCategory, setSelectedCategory] = useState(initialData.categoryId || 8);

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

                {/* Text box to type the species name */}
                <TextInput
                    style={styles.input}
                    placeholder="Species name"
                    placeholderTextColor={colors.textMain + '80'}
                    value={name}
                    onChangeText={setName}
                />

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
                        onPress={() => onSave({ ...initialData, speciesName: name, categoryId: selectedCategory })}
                    >
                        <Text style={styles.buttonTextLight}>{saveButtonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}