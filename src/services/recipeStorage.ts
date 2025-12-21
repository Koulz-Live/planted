/**
 * Recipe Storage Service
 * Comprehensive Firestore + Firebase Storage integration for recipe generation
 * 
 * Stores:
 * - Uploaded pantry/fridge photos (Firebase Storage)
 * - OpenAI Vision analyzed ingredients
 * - Complete form data with geolocation
 * - Generated recipes
 * - Session metadata and timestamps
 * - User analytics data
 */

import { 
  collection, 
  addDoc, 
  Timestamp,
  GeoPoint,
  DocumentReference 
} from 'firebase/firestore';
import { 
  ref, 
  uploadString, 
  getDownloadURL,
  UploadResult 
} from 'firebase/storage';
import { getDb, getStorage } from '../lib/firebase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface UploadedImage {
  originalBase64?: string;  // Base64 data URL (stored temporarily)
  storagePath: string;       // Firebase Storage path
  downloadUrl: string;       // Public download URL
  fileName: string;          // Unique filename
  uploadedAt: Timestamp;     // Upload timestamp
  size?: number;             // File size in bytes
  mimeType?: string;         // e.g., 'image/jpeg'
}

export interface AnalyzedIngredients {
  raw: string;                          // Raw OpenAI response
  parsed: string[];                     // Parsed ingredient list
  detectionConfidence?: 'high' | 'medium' | 'low';
  visionModel: string;                  // e.g., 'gpt-4o'
  analysisTimestamp: Timestamp;
  analysisDurationMs?: number;          // Time taken for analysis
  fallbackUsed: boolean;                // True if generic fallback was used
  errorMessage?: string;                // Error if vision failed
}

export interface RecipeFormData {
  // User inputs
  availableIngredients: string;         // Raw text input
  parsedIngredients: string[];          // Split and trimmed
  dietaryNeeds: string[];
  culturalPreferences: string[];
  season: string;
  
  // Photos
  pantryPhotoUrls: string[];            // Base64 data URLs (temporary)
  uploadedImages?: UploadedImage[];     // Firebase Storage references
  
  // Vision analysis
  analyzedIngredients?: AnalyzedIngredients;
  
  // Geolocation
  geolocation?: GeoLocation;
  geoPoint?: GeoPoint;                  // Firestore GeoPoint
  
  // Device & browser info
  userAgent?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions?: string[];          // Main instructions field
  steps?: string[];                 // Alternative field name
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  difficulty?: string;
  category?: string;
  nutritionHighlights?: string[];
  culturalNotes?: string;
  tips?: string[];
  tags?: string[];
  imageUrl?: string;
}

export interface RecipeGenerationSession {
  // Core data
  userId: string;
  sessionId?: string;                   // Auto-generated document ID
  
  // Form data
  formData: RecipeFormData;
  
  // Generated recipes
  recipes: Recipe[];
  spotlightRecipe?: Recipe;             // Featured recipe
  alternateRecipes?: Recipe[];          // Additional options
  
  // AI metadata
  aiModel: string;                      // e.g., 'gpt-4o-2024-08-06'
  temperature: number;
  maxTokens: number;
  generationDurationMs?: number;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  
  // Timestamps
  timestamp: Timestamp;                 // Creation time
  createdAt: Date;                      // ISO date
  
  // Analytics
  type: 'generation-session';
  source: 'web-app' | 'mobile-app';
  version: string;                      // App version
  
  // Optional metadata
  sessionDurationMs?: number;           // Total time from form load to submit
  errorOccurred?: boolean;
  errorMessage?: string;
}

export interface IndividualRecipe {
  userId: string;
  sessionId: string;                    // Reference to parent session
  recipe: Recipe;
  
  // Subset of form data for quick querying
  formDataSummary: {
    dietaryNeeds: string[];
    culturalPreferences: string[];
    season: string;
    hadPhotos: boolean;
    hadVisionAnalysis: boolean;
    ingredientCount: number;
  };
  
  timestamp: Timestamp;
  isFavorite: boolean;
  tags: string[];                       // For filtering/searching
}

// ============================================================================
// GEOLOCATION HELPERS
// ============================================================================

/**
 * Get user's geolocation (if permitted)
 */
export async function getUserGeolocation(): Promise<GeoLocation | null> {
  if (!navigator.geolocation) {
    console.log('📍 Geolocation not supported');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const geo: GeoLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
          timestamp: position.timestamp
        };
        console.log('📍 Geolocation obtained:', geo);
        resolve(geo);
      },
      (error) => {
        console.log('📍 Geolocation denied or failed:', error.message);
        resolve(null);
      },
      {
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
        enableHighAccuracy: false
      }
    );
  });
}

/**
 * Convert GeoLocation to Firestore GeoPoint
 */
export function geoLocationToGeoPoint(geo: GeoLocation): GeoPoint {
  return new GeoPoint(geo.latitude, geo.longitude);
}

// ============================================================================
// DEVICE & BROWSER INFO
// ============================================================================

/**
 * Get device and browser metadata
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  };
}

// ============================================================================
// IMAGE STORAGE
// ============================================================================

/**
 * Upload base64 images to Firebase Storage
 * @param base64Images - Array of base64 data URLs
 * @param userId - User ID for organizing storage
 * @returns Array of UploadedImage objects with storage references
 */
export async function uploadImagesToStorage(
  base64Images: string[],
  userId: string
): Promise<UploadedImage[]> {
  if (!base64Images || base64Images.length === 0) {
    return [];
  }

  console.log(`📤 Uploading ${base64Images.length} image(s) to Firebase Storage...`);
  const storage = getStorage();
  const uploadPromises = base64Images.map(async (base64, index) => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `pantry-${userId}-${timestamp}-${index}.jpg`;
      const storagePath = `pantry-photos/${userId}/${fileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, storagePath);
      
      // Upload base64 string
      const uploadResult: UploadResult = await uploadString(
        storageRef, 
        base64, 
        'data_url'
      );
      
      // Get download URL
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      
      // Extract file size and mime type from base64
      const sizeMatch = base64.match(/^data:([^;]+);base64,(.+)$/);
      const mimeType = sizeMatch ? sizeMatch[1] : 'image/jpeg';
      const base64Data = sizeMatch ? sizeMatch[2] : '';
      const size = Math.round((base64Data.length * 3) / 4); // Approximate size
      
      const uploadedImage: UploadedImage = {
        storagePath,
        downloadUrl,
        fileName,
        uploadedAt: Timestamp.now(),
        size,
        mimeType
      };
      
      console.log(`✅ Image uploaded: ${fileName}`);
      return uploadedImage;
      
    } catch (error) {
      console.error(`❌ Failed to upload image ${index}:`, error);
      throw error;
    }
  });

  const results = await Promise.all(uploadPromises);
  console.log(`✅ All ${results.length} images uploaded successfully`);
  return results;
}

// ============================================================================
// RECIPE STORAGE
// ============================================================================

/**
 * Save complete recipe generation session to Firestore
 * 
 * Stores:
 * 1. Session document in 'recipe-sessions' collection
 * 2. Individual recipes in 'recipes' collection
 * 3. Uploads images to Firebase Storage
 * 4. Captures geolocation and device info
 * 
 * @param params - All data needed to save the session
 * @returns Session document reference
 */
export async function saveRecipeGenerationSession(params: {
  userId: string;
  formData: RecipeFormData;
  recipes: Recipe[];
  spotlightRecipe?: Recipe;
  alternateRecipes?: Recipe[];
  aiMetadata?: {
    model: string;
    temperature: number;
    maxTokens: number;
    generationDurationMs?: number;
    tokensUsed?: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
  analyzedIngredients?: AnalyzedIngredients;
  sessionDurationMs?: number;
  errorOccurred?: boolean;
  errorMessage?: string;
}): Promise<DocumentReference> {
  
  console.log('💾 Saving recipe generation session to Firestore...');
  const startTime = Date.now();
  
  const db = getDb();
  
  // Step 1: Upload images to Firebase Storage (if any)
  let uploadedImages: UploadedImage[] = [];
  if (params.formData.pantryPhotoUrls && params.formData.pantryPhotoUrls.length > 0) {
    try {
      uploadedImages = await uploadImagesToStorage(
        params.formData.pantryPhotoUrls,
        params.userId
      );
      console.log(`✅ ${uploadedImages.length} images uploaded to Storage`);
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      // Continue anyway - don't block on image upload failure
    }
  }
  
  // Step 2: Get geolocation (non-blocking)
  let geolocation: GeoLocation | null = null;
  let geoPoint: GeoPoint | undefined;
  
  try {
    geolocation = await getUserGeolocation();
    if (geolocation) {
      geoPoint = geoLocationToGeoPoint(geolocation);
    }
  } catch (error) {
    console.log('📍 Could not get geolocation:', error);
  }
  
  // Step 3: Gather device info
  const deviceInfo = getDeviceInfo();
  
  // Step 4: Prepare enhanced form data
  const enhancedFormData: RecipeFormData = {
    ...params.formData,
    uploadedImages,
    analyzedIngredients: params.analyzedIngredients,
    geolocation: geolocation ?? undefined,
    geoPoint,
    ...deviceInfo
  };
  
  // Step 5: Create session document
  const sessionData: Omit<RecipeGenerationSession, 'sessionId'> = {
    userId: params.userId,
    formData: enhancedFormData,
    recipes: params.recipes,
    spotlightRecipe: params.spotlightRecipe,
    alternateRecipes: params.alternateRecipes,
    aiModel: params.aiMetadata?.model || 'gpt-4o-2024-08-06',
    temperature: params.aiMetadata?.temperature || 0.7,
    maxTokens: params.aiMetadata?.maxTokens || 3000,
    generationDurationMs: params.aiMetadata?.generationDurationMs,
    tokensUsed: params.aiMetadata?.tokensUsed,
    timestamp: Timestamp.now(),
    createdAt: new Date(),
    type: 'generation-session',
    source: 'web-app',
    version: '1.0.0',
    sessionDurationMs: params.sessionDurationMs,
    errorOccurred: params.errorOccurred,
    errorMessage: params.errorMessage
  };
  
  // Step 6: Save to Firestore
  const sessionRef = await addDoc(collection(db, 'recipe-sessions'), sessionData);
  console.log(`✅ Session saved to Firestore: ${sessionRef.id}`);
  
  // Step 7: Save individual recipes for easier querying
  const individualRecipeSaves = params.recipes.map(async (recipe) => {
    const individualRecipe: IndividualRecipe = {
      userId: params.userId,
      sessionId: sessionRef.id,
      recipe,
      formDataSummary: {
        dietaryNeeds: params.formData.dietaryNeeds,
        culturalPreferences: params.formData.culturalPreferences,
        season: params.formData.season,
        hadPhotos: uploadedImages.length > 0,
        hadVisionAnalysis: !!params.analyzedIngredients && !params.analyzedIngredients.fallbackUsed,
        ingredientCount: params.formData.parsedIngredients.length
      },
      timestamp: Timestamp.now(),
      isFavorite: false,
      tags: [
        ...params.formData.dietaryNeeds,
        ...params.formData.culturalPreferences,
        params.formData.season,
        uploadedImages.length > 0 ? 'with-photos' : 'text-only',
        params.analyzedIngredients && !params.analyzedIngredients.fallbackUsed ? 'vision-analyzed' : ''
      ].filter(Boolean)
    };
    
    return addDoc(collection(db, 'recipes'), individualRecipe);
  });
  
  await Promise.all(individualRecipeSaves);
  console.log(`✅ ${params.recipes.length} individual recipes saved`);
  
  const totalTime = Date.now() - startTime;
  console.log(`✅ Complete session save took ${totalTime}ms`);
  
  return sessionRef;
}

/**
 * Quick save function for backward compatibility
 * Automatically structures data for comprehensive storage
 */
export async function quickSaveRecipeSession(
  userId: string,
  formData: any,
  recipes: Recipe[],
  analyzedIngredients?: AnalyzedIngredients
): Promise<DocumentReference> {
  
  // Parse ingredients from form data
  const parsedIngredients = formData.availableIngredients
    ? formData.availableIngredients.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];
  
  const enhancedFormData: RecipeFormData = {
    availableIngredients: formData.availableIngredients || '',
    parsedIngredients,
    dietaryNeeds: formData.dietaryNeeds || [],
    culturalPreferences: formData.culturalPreferences || [],
    season: formData.season || 'Any',
    pantryPhotoUrls: formData.pantryPhotoUrls || []
  };
  
  return saveRecipeGenerationSession({
    userId,
    formData: enhancedFormData,
    recipes,
    spotlightRecipe: recipes[0],
    alternateRecipes: recipes.slice(1),
    analyzedIngredients
  });
}
