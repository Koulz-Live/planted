/**
 * Recipe Storage Service
 * Comprehensive Firestore integration for recipe generation
 * 
 * Stores:
 * - Uploaded pantry/fridge photos (Base64 in Firestore)
 * - OpenAI Vision analyzed ingredients
 * - Complete form data with geolocation
 * - Generated recipes
 * - Session metadata and timestamps
 * - User analytics data
 * 
 * Note: Images stored as base64 directly in Firestore
 * OpenAI Vision API can analyze base64 images directly
 */

import { 
  collection, 
  addDoc, 
  Timestamp,
  GeoPoint,
  DocumentReference 
} from 'firebase/firestore';
import { getDb } from '../lib/firebase';

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

export interface StoredImage {
  base64: string;            // Base64 data URL (stored in Firestore)
  fileName: string;          // Unique filename
  uploadedAt: Timestamp;     // Upload timestamp
  size?: number;             // File size in bytes
  mimeType?: string;         // e.g., 'image/jpeg'
  index: number;             // Original upload order
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
  pantryPhotoUrls: string[];            // Base64 data URLs
  storedImages?: StoredImage[];         // Processed images with metadata
  
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
  images?: string[];                // Array of 4 web-searched images for carousel
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
    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.log('📍 Geolocation request timed out');
      resolve(null);
    }, 5000); // 5 second timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
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
        clearTimeout(timeoutId);
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
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Remove undefined values from an object (Firestore doesn't support undefined)
 * @param obj - Object to clean
 * @returns New object without undefined values
 */
export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue; // Skip undefined values
    }
    
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Timestamp) && !(value instanceof GeoPoint)) {
      // Recursively clean nested objects
      cleaned[key] = removeUndefined(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
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
 * Process base64 images for Firestore storage
 * @param base64Images - Array of base64 data URLs
 * @param userId - User ID for organizing storage
 * @returns Array of StoredImage objects with metadata
 * 
 * Note: OpenAI Vision API can analyze base64 images directly:
 * const response = await openai.chat.completions.create({
 *   model: "gpt-4o",
 *   messages: [{
 *     role: "user",
 *     content: [
 *       { type: "text", text: "What's in this image?" },
 *       { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }
 *     ]
 *   }]
 * });
 */
export function processImagesForStorage(
  base64Images: string[],
  userId: string
): StoredImage[] {
  if (!base64Images || base64Images.length === 0) {
    return [];
  }

  console.log(`� Processing ${base64Images.length} image(s) for Firestore storage...`);
  
  const storedImages: StoredImage[] = base64Images.map((base64, index) => {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `pantry-${userId}-${timestamp}-${index}.jpg`;
    
    // Extract file size and mime type from base64
    const sizeMatch = base64.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = sizeMatch ? sizeMatch[1] : 'image/jpeg';
    const base64Data = sizeMatch ? sizeMatch[2] : base64;
    const size = Math.round((base64Data.length * 3) / 4); // Approximate size in bytes
    
    return {
      base64,
      fileName,
      uploadedAt: Timestamp.now(),
      size,
      mimeType,
      index
    };
  });
  
  const totalSizeKB = Math.round(storedImages.reduce((sum, img) => sum + (img.size || 0), 0) / 1024);
  console.log(`✅ ${storedImages.length} image(s) processed (total ~${totalSizeKB}KB)`);
  return storedImages;
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
  
  // Step 1: Process images for Firestore storage (base64)
  let storedImages: StoredImage[] = [];
  if (params.formData.pantryPhotoUrls && params.formData.pantryPhotoUrls.length > 0) {
    storedImages = processImagesForStorage(
      params.formData.pantryPhotoUrls,
      params.userId
    );
    console.log(`✅ ${storedImages.length} images prepared for Firestore`);
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
    storedImages,
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
  
  // Step 6: Remove undefined values (Firestore doesn't support them)
  const cleanedSessionData = removeUndefined(sessionData);
  
  // Step 7: Save to Firestore
  const sessionRef = await addDoc(collection(db, 'recipe-sessions'), cleanedSessionData);
  console.log(`✅ Session saved to Firestore: ${sessionRef.id}`);
  
  // Step 8: Save individual recipes for easier querying
  const individualRecipeSaves = params.recipes.map(async (recipe) => {
    const individualRecipe: IndividualRecipe = {
      userId: params.userId,
      sessionId: sessionRef.id,
      recipe,
      formDataSummary: {
        dietaryNeeds: params.formData.dietaryNeeds,
        culturalPreferences: params.formData.culturalPreferences,
        season: params.formData.season,
        hadPhotos: storedImages.length > 0,
        hadVisionAnalysis: !!params.analyzedIngredients && !params.analyzedIngredients.fallbackUsed,
        ingredientCount: params.formData.parsedIngredients.length
      },
      timestamp: Timestamp.now(),
      isFavorite: false,
      tags: [
        ...params.formData.dietaryNeeds,
        ...params.formData.culturalPreferences,
        params.formData.season,
        storedImages.length > 0 ? 'with-photos' : 'text-only',
        params.analyzedIngredients && !params.analyzedIngredients.fallbackUsed ? 'vision-analyzed' : ''
      ].filter(Boolean)
    };
    
    // Clean undefined values before saving
    const cleanedRecipe = removeUndefined(individualRecipe);
    return addDoc(collection(db, 'recipes'), cleanedRecipe);
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
