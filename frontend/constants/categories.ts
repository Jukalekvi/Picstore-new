/**
 * Type definition for a species observation category.
 * Each category has a unique ID, display name, and icon identifier for Material Community Icons.
 */
export interface Category {
    id: number;
    name: string;
    icon: string;
}

/**
 * Array of predefined species observation categories.
 * Users can select one of these 8 categories when creating or editing observations.
 * The "Undefined" category (id=8) is used as default when no specific category matches.
 */
export const CATEGORIES: Category[] = [
    { id: 1, name: 'Mammals', icon: 'paw' },
    { id: 2, name: 'Birds', icon: 'feather' },
    { id: 3, name: 'Reptiles', icon: 'turtle' },
    { id: 4, name: 'Insects', icon: 'bug' },
    { id: 5, name: 'Plants', icon: 'flower' },
    { id: 6, name: 'Trees', icon: 'tree' },
    { id: 7, name: 'Mushrooms', icon: 'mushroom' },
    { id: 8, name: 'Undefined', icon: 'help-circle' },
];

/**
 * Retrieves a category object by its ID.
 * Returns the matching category or the "Undefined" category if ID is not found.
 * @param id the category ID to look up
 * @returns the Category object matching the ID, or Undefined category if not found
 */
export const getCategoryById = (id: number) =>
    CATEGORIES.find(cat => cat.id === id) || CATEGORIES[7];