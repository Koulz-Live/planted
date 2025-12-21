# 🗄️ Comprehensive Recipe Storage System

## Overview

The Planted app now stores **complete recipe generation data** in Firestore with:
- ✅ Uploaded pantry/fridge images (Firebase Storage)
- ✅ OpenAI Vision analyzed ingredients
- ✅ User geolocation (latitude/longitude)
- ✅ Device & browser metadata
- ✅ Complete form data
- ✅ Generated recipes
- ✅ AI model metadata (tokens, timing, etc.)
- ✅ Timestamps for analytics

This enables comprehensive data analysis for admin dashboards and insights.

## 🏗️ Database Schema

### Collections

#### 1. `recipe-sessions` (Main session storage)
Stores complete recipe generation sessions with all metadata.

```typescript
{
  // Core identifiers
  sessionId: string;              // Auto-generated document ID
  userId: string;                 // User identifier
  
  // Form data with enhancements
  formData: {
    // User inputs
    availableIngredients: string;           // Raw text
    parsedIngredients: string[];            // Split array
    dietaryNeeds: string[];
    culturalPreferences: string[];
    season: string;
    
    // Images
    pantryPhotoUrls: string[];              // Original base64 (temporary)
    uploadedImages: [                        // Firebase Storage refs
      {
        storagePath: string;                 // 'pantry-photos/user123/...'
        downloadUrl: string;                 // Public URL
        fileName: string;                    // Unique filename
        uploadedAt: Timestamp;
        size: number;                        // Bytes
        mimeType: string;                    // 'image/jpeg'
      }
    ],
    
    // Vision analysis
    analyzedIngredients: {
      raw: string;                           // Raw OpenAI response
      parsed: string[];                      // Detected ingredients
      detectionConfidence: 'high' | 'medium' | 'low';
      visionModel: string;                   // 'gpt-4o'
      analysisTimestamp: Timestamp;
      analysisDurationMs: number;
      fallbackUsed: boolean;                 // True if generic used
      errorMessage?: string;                 // If analysis failed
    },
    
    // Geolocation
    geolocation: {
      latitude: number;
      longitude: number;
      accuracy: number;
      altitude?: number;
      heading?: number;
      speed?: number;
      timestamp: number;                     // GPS timestamp
    },
    geoPoint: GeoPoint;                      // Firestore GeoPoint
    
    // Device metadata
    userAgent: string;
    screenResolution: string;                // '1920x1080'
    timezone: string;                        // 'America/New_York'
    language: string;                        // 'en-US'
  },
  
  // Generated recipes
  recipes: Recipe[];                         // All recipes
  spotlightRecipe: Recipe;                   // Featured recipe
  alternateRecipes: Recipe[];                // Additional options
  
  // AI metadata
  aiModel: string;                           // 'gpt-4o-2024-08-06'
  temperature: number;                       // 0.7
  maxTokens: number;                         // 3000
  generationDurationMs: number;              // Time taken
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  },
  
  // Timestamps
  timestamp: Timestamp;                      // Creation time
  createdAt: Date;                          // ISO date
  
  // Analytics
  type: 'generation-session';
  source: 'web-app' | 'mobile-app';
  version: string;                          // App version
  sessionDurationMs: number;                // Form load to submit
  
  // Error tracking
  errorOccurred: boolean;
  errorMessage?: string;
}
```

**Firestore Indexes Required:**
```
userId (asc), timestamp (desc)
userId (asc), type (asc), timestamp (desc)
geoPoint (geohash), timestamp (desc)
```

#### 2. `recipes` (Individual recipe storage)
Each recipe saved separately for easier querying and filtering.

```typescript
{
  // References
  userId: string;
  sessionId: string;                       // Links to parent session
  recipe: Recipe;                          // Full recipe object
  
  // Summary for quick filtering
  formDataSummary: {
    dietaryNeeds: string[];
    culturalPreferences: string[];
    season: string;
    hadPhotos: boolean;
    hadVisionAnalysis: boolean;
    ingredientCount: number;
  },
  
  // Metadata
  timestamp: Timestamp;
  isFavorite: boolean;
  tags: string[];                          // For search/filter
}
```

**Firestore Indexes Required:**
```
userId (asc), timestamp (desc)
userId (asc), isFavorite (asc), timestamp (desc)
userId (asc), tags (array-contains), timestamp (desc)
```

#### 3. `favorite-recipes` (User favorites)
Quick access to saved favorites.

```typescript
{
  userId: string;
  recipe: Recipe;
  timestamp: Timestamp;
  source: 'generated' | 'community' | 'curated';
  sessionId?: string;                      // If from generation
}
```

## 📸 Firebase Storage Structure

```
gs://your-bucket/
├── pantry-photos/
│   ├── user-abc123/
│   │   ├── pantry-abc123-1703174400000-0.jpg
│   │   ├── pantry-abc123-1703174400000-1.jpg
│   │   └── pantry-abc123-1703174401000-0.jpg
│   └── user-def456/
│       └── pantry-def456-1703174500000-0.jpg
└── recipe-images/
    └── (future: user-uploaded recipe photos)
```

**Naming Convention:**
```
pantry-{userId}-{timestamp}-{index}.{ext}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pantry-photos/{userId}/{fileName} {
      // Allow read for authenticated users
      allow read: if request.auth != null;
      
      // Allow write for the user's own photos
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024;  // 5MB limit
    }
  }
}
```

## 🔧 Usage Examples

### Save Recipe Session (Frontend)

```typescript
import { quickSaveRecipeSession } from '../services/recipeStorage';

// After recipe generation
const sessionRef = await quickSaveRecipeSession(
  'user-123',           // userId
  formData,             // Complete form data
  recipesArray,         // Generated recipes
  analyzedIngredients   // Optional: Vision analysis results
);

console.log('Saved session:', sessionRef.id);
```

### Advanced Save with Full Control

```typescript
import { saveRecipeGenerationSession } from '../services/recipeStorage';

const sessionRef = await saveRecipeGenerationSession({
  userId: 'user-123',
  formData: enhancedFormData,
  recipes: recipesArray,
  spotlightRecipe: recipesArray[0],
  alternateRecipes: recipesArray.slice(1),
  aiMetadata: {
    model: 'gpt-4o-2024-08-06',
    temperature: 0.7,
    maxTokens: 3000,
    generationDurationMs: 5000,
    tokensUsed: {
      prompt: 500,
      completion: 1500,
      total: 2000
    }
  },
  analyzedIngredients: {
    raw: 'tomatoes, pasta, basil, garlic',
    parsed: ['tomatoes', 'pasta', 'basil', 'garlic'],
    detectionConfidence: 'high',
    visionModel: 'gpt-4o',
    analysisTimestamp: Timestamp.now(),
    analysisDurationMs: 2500,
    fallbackUsed: false
  },
  sessionDurationMs: 45000
});
```

### Query Recent Sessions

```typescript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getDb } from '../lib/firebase';

const db = getDb();

// Get user's recent sessions
const q = query(
  collection(db, 'recipe-sessions'),
  where('userId', '==', 'user-123'),
  orderBy('timestamp', 'desc'),
  limit(10)
);

const snapshot = await getDocs(q);
const sessions = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### Query by Geolocation

```typescript
import { GeoPoint } from 'firebase/firestore';

// Find sessions near a location (requires geohash library)
const center = new GeoPoint(40.7128, -74.0060);  // NYC
const radiusKm = 50;

// Use geohash queries for nearby locations
// (Implementation depends on geohash library)
```

### Query with Photos Only

```typescript
const q = query(
  collection(db, 'recipe-sessions'),
  where('userId', '==', 'user-123'),
  where('formData.uploadedImages', '!=', null),
  orderBy('formData.uploadedImages'),
  orderBy('timestamp', 'desc')
);
```

### Query Vision-Analyzed Sessions

```typescript
const q = query(
  collection(db, 'recipes'),
  where('userId', '==', 'user-123'),
  where('formDataSummary.hadVisionAnalysis', '==', true),
  orderBy('timestamp', 'desc')
);
```

## 📊 Analytics Queries

### Total Sessions by User
```typescript
const snapshot = await getCountFromServer(
  query(
    collection(db, 'recipe-sessions'),
    where('userId', '==', 'user-123')
  )
);
console.log('Total sessions:', snapshot.data().count);
```

### Sessions with Photos
```typescript
const q = query(
  collection(db, 'recipe-sessions'),
  where('formData.uploadedImages', '!=', null)
);
```

### Success Rate (No Errors)
```typescript
const successQ = query(
  collection(db, 'recipe-sessions'),
  where('errorOccurred', '==', false)
);
```

### Average Generation Time
```typescript
const sessions = await getDocs(
  query(collection(db, 'recipe-sessions'), limit(100))
);

const times = sessions.docs.map(doc => 
  doc.data().generationDurationMs || 0
);
const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
console.log('Average generation time:', avgTime, 'ms');
```

### Most Popular Dietary Needs
```typescript
// Aggregate in client (or use Cloud Functions)
const sessions = await getDocs(
  query(collection(db, 'recipe-sessions'))
);

const dietaryCounts = {};
sessions.docs.forEach(doc => {
  const dietary = doc.data().formData.dietaryNeeds || [];
  dietary.forEach(need => {
    dietaryCounts[need] = (dietaryCounts[need] || 0) + 1;
  });
});
```

## 🎯 Admin Dashboard Queries

### Recent Activity
```typescript
// Last 24 hours
const yesterday = Timestamp.fromDate(
  new Date(Date.now() - 24 * 60 * 60 * 1000)
);

const q = query(
  collection(db, 'recipe-sessions'),
  where('timestamp', '>=', yesterday),
  orderBy('timestamp', 'desc')
);
```

### User Engagement
```typescript
// Users with multiple sessions
const userSessions = {};
const snapshot = await getDocs(collection(db, 'recipe-sessions'));

snapshot.docs.forEach(doc => {
  const userId = doc.data().userId;
  userSessions[userId] = (userSessions[userId] || 0) + 1;
});

// Sort by session count
const topUsers = Object.entries(userSessions)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10);
```

### Geographic Distribution
```typescript
// Get all sessions with geolocation
const q = query(
  collection(db, 'recipe-sessions'),
  where('formData.geoPoint', '!=', null)
);

const sessions = await getDocs(q);
const locations = sessions.docs.map(doc => {
  const geo = doc.data().formData.geolocation;
  return {
    lat: geo.latitude,
    lng: geo.longitude,
    city: geo.city,  // If reverse geocoded
    country: geo.country
  };
});
```

### Feature Usage
```typescript
// Vision API usage rate
const total = await getCountFromServer(
  collection(db, 'recipe-sessions')
);

const withVision = await getCountFromServer(
  query(
    collection(db, 'recipe-sessions'),
    where('formData.analyzedIngredients.fallbackUsed', '==', false)
  )
);

const visionUsageRate = (withVision / total) * 100;
```

## 🔒 Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Recipe sessions - users can read/write their own
    match /recipe-sessions/{sessionId} {
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null 
                   && request.resource.data.userId == request.auth.uid;
    }
    
    // Individual recipes - users can read/write their own
    match /recipes/{recipeId} {
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null 
                   && request.resource.data.userId == request.auth.uid;
    }
    
    // Favorites - users can read/write their own
    match /favorite-recipes/{favoriteId} {
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null 
                   && request.resource.data.userId == request.auth.uid;
    }
    
    // Admin read access (add admin check)
    match /{document=**} {
      allow read: if request.auth != null 
                  && request.auth.token.admin == true;
    }
  }
}
```

## 📈 Future Admin Features

### Analytics Dashboard
- **Total Sessions:** Count by date range
- **Active Users:** Unique users per day/week/month
- **Popular Ingredients:** Most commonly used
- **Popular Cuisines:** Most requested cultural preferences
- **Vision API Usage:** % using photos vs text
- **Success Rate:** % without errors
- **Average Response Time:** Performance metrics
- **Geographic Heatmap:** Where users are located

### Export Data
```typescript
// Export user data (GDPR compliance)
async function exportUserData(userId: string) {
  const sessions = await getDocs(
    query(
      collection(db, 'recipe-sessions'),
      where('userId', '==', userId)
    )
  );
  
  return sessions.docs.map(doc => doc.data());
}
```

### Delete User Data
```typescript
// Delete all user data
async function deleteUserData(userId: string) {
  const batch = writeBatch(db);
  
  // Delete sessions
  const sessions = await getDocs(
    query(
      collection(db, 'recipe-sessions'),
      where('userId', '==', userId)
    )
  );
  sessions.docs.forEach(doc => batch.delete(doc.ref));
  
  // Delete recipes
  const recipes = await getDocs(
    query(
      collection(db, 'recipes'),
      where('userId', '==', userId)
    )
  );
  recipes.docs.forEach(doc => batch.delete(doc.ref));
  
  await batch.commit();
  
  // Delete storage files (separate operation)
  const storage = getStorage();
  const folderRef = ref(storage, `pantry-photos/${userId}`);
  // Delete all files in folder
}
```

## ✅ Benefits

### For Users:
- 📜 Complete history of all recipe generations
- 🗺️ Location-based recipe recommendations
- 📊 Personal cooking insights
- ⏱️ Session recovery if interrupted

### For Developers:
- 🔍 Comprehensive debugging data
- 📈 Performance metrics
- 🎯 Feature usage analytics
- 🐛 Error tracking and patterns

### For Business:
- 💰 ROI analysis (OpenAI API costs vs usage)
- 👥 User engagement metrics
- 🌍 Geographic market insights
- 🎨 Feature popularity data
- 🚀 Growth tracking

## 🎯 Next Steps

1. **Deploy** - Push changes to production
2. **Test** - Generate recipes with photos
3. **Verify** - Check Firestore and Storage
4. **Monitor** - Watch for any errors
5. **Build Admin** - Create analytics dashboard

---

**Status:** ✅ READY TO DEPLOY  
**Collections:** recipe-sessions, recipes, favorite-recipes  
**Storage:** pantry-photos/{userId}/  
**Features:** Images, Geolocation, Vision Analysis, Device Info
