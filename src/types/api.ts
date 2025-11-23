// API Types for Planted App
export interface PlantCareRequest {
  plantName: string;
  plantType: string;
  location: string;
  observations: Array<{
    date: string;
    notes: string;
    photoUrl?: string;
  }>;
  plantPhotoUrls?: string[];
}

export interface RecipeRequest {
  availableIngredients: string[];
  dietaryRestrictions: string[];
  cuisinePreference: string;
  skillLevel: string;
  pantryPhotoUrls?: string[];
}

export interface NutritionCoachRequest {
  goal: string;
  dietaryRestrictions: string[];
  culturalPreferences: string;
  householdSize: number;
  mealPhotoUrls?: string[];
}

export interface StorytellingRequest {
  dishName: string;
  region: string;
  foodPhotoUrls?: string[];
}
