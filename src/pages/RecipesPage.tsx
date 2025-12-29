import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
import { Icon, type IconName } from '../components/Icon';
import RecipeImageCarousel from '../components/RecipeImageCarousel';
import { 
  quickSaveRecipeSession,
  type AnalyzedIngredients
} from '../services/recipeStorage';
import './RecipesPage.css';

interface RecipeFormData {
  dietaryNeeds: string[];
  availableIngredients: string;
  culturalPreferences: string[];
  season?: string;
  pantryPhotoUrls: string[];
}

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  culturalNotes?: string;
  nutritionHighlights?: string[];
  imageUrl?: string;
  images?: string[];  // Array of 4 web-searched images
  category?: string;
  source?: string;    // Source URL or reference for the recipe
}

interface RecipeRequest {
  id: string;
  userName: string;
  recipeName: string;
  description: string;
  dietaryRestrictions: string[];
  timestamp: Date;
  votes: number;
  status: 'pending' | 'in-progress' | 'completed';
}

type CardOption = {
  value: string;
  icon: IconName;
};

const dietaryOptions: CardOption[] = [
  { value: 'Vegetarian', icon: 'blossom' },
  { value: 'Vegan', icon: 'sprout' },
  { value: 'Kosher', icon: 'shield' },
  { value: 'Halal', icon: 'moonStars' },
  { value: 'Gluten-Free', icon: 'slashCircle' },
  { value: 'Dairy-Free', icon: 'shieldSlash' },
  { value: 'Nut-Free', icon: 'shieldSlash' },
  { value: 'Low-Carb', icon: 'speedometer' }
];

const culturalOptions: CardOption[] = [
  { value: 'Mediterranean', icon: 'sun' },
  { value: 'Middle Eastern', icon: 'moonStars' },
  { value: 'Asian', icon: 'basket' },
  { value: 'African', icon: 'globeAlt' },
  { value: 'Latin American', icon: 'peopleFill' },
  { value: 'European', icon: 'globe' },
  { value: 'Indian', icon: 'journal' },
  { value: 'Caribbean', icon: 'sunrise' }
];

const seasonOptions = ['Spring', 'Summer', 'Fall', 'Winter', 'Any Season'];

const toOptionId = (prefix: string, label: string) =>
  `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/-+/g, '-').replace(/^-|-$/g, '');

// Mock recipe gallery data - Popular Kosher & Halal Recipes
const mockGalleryRecipes: Recipe[] = [
  {
    title: 'Shakshuka',
    description: 'Traditional Middle Eastern dish with poached eggs in spiced tomato sauce (Kosher & Halal)',
    ingredients: ['Tomatoes', 'Bell peppers', 'Onions', 'Eggs', 'Cumin', 'Paprika', 'Garlic', 'Olive oil'],
    instructions: ['Sauté vegetables', 'Add spices and tomatoes', 'Create wells for eggs', 'Poach until set'],
    prepTime: '10 min',
    cookTime: '20 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Middle Eastern'
  },
  {
    title: 'Falafel Bowl',
    description: 'Crispy chickpea fritters with hummus, tahini, and fresh vegetables (Kosher & Halal)',
    ingredients: ['Chickpeas', 'Parsley', 'Cilantro', 'Garlic', 'Cumin', 'Tahini', 'Cucumber', 'Tomatoes'],
    instructions: ['Blend falafel ingredients', 'Form into balls', 'Fry until golden', 'Serve with tahini sauce'],
    prepTime: '20 min',
    cookTime: '15 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Kosher & Halal'
  },
  {
    title: 'Moroccan Tagine',
    description: 'Aromatic vegetable stew with preserved lemons and olives (Kosher & Halal)',
    ingredients: ['Mixed vegetables', 'Chickpeas', 'Preserved lemons', 'Olives', 'Cumin', 'Coriander', 'Saffron'],
    instructions: ['Layer vegetables in tagine', 'Add spices and liquid', 'Slow cook', 'Serve over couscous'],
    prepTime: '15 min',
    cookTime: '45 min',
    servings: '6',
    imageUrl: 'https://images.pexels.com/photos/4871119/pexels-photo-4871119.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Moroccan'
  },
  {
    title: 'Acai Power Breakfast Bowl',
    description: 'Energizing superfood bowl with acai, fresh fruits, and granola (Kosher & Halal)',
    ingredients: ['Acai puree', 'Banana', 'Berries', 'Granola', 'Coconut flakes', 'Chia seeds', 'Honey', 'Almond butter'],
    instructions: ['Blend acai with banana', 'Pour into bowl', 'Top with berries and granola', 'Add coconut, chia, and drizzle honey'],
    prepTime: '10 min',
    cookTime: '0 min',
    servings: '2',
    imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Kosher & Halal'
  },
  {
    title: 'Pap and Chakalaka',
    description: 'Traditional South African meal with creamy maize porridge and spicy vegetable relish (Kosher & Halal)',
    ingredients: ['Maize meal (pap)', 'Water', 'Salt', 'Butter', 'Tomatoes', 'Onions', 'Carrots', 'Beans', 'Curry powder', 'Chili'],
    instructions: ['Cook pap until thick and creamy', 'Sauté onions and curry powder', 'Add vegetables and simmer', 'Serve pap with chakalaka on top'],
    prepTime: '10 min',
    cookTime: '30 min',
    servings: '6',
    imageUrl: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'South African'
  },
  {
    title: 'Full English Breakfast',
    description: 'Classic British breakfast with eggs, beans, mushrooms, tomatoes, and toast (Kosher)',
    ingredients: ['Eggs', 'Baked beans', 'Mushrooms', 'Tomatoes', 'Toast', 'Butter', 'Hash browns', 'Black pepper'],
    instructions: ['Fry eggs sunny-side up', 'Grill tomatoes and mushrooms', 'Heat baked beans', 'Toast bread and serve hot'],
    prepTime: '10 min',
    cookTime: '15 min',
    servings: '2',
    imageUrl: 'https://images.pexels.com/photos/101533/pexels-photo-101533.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'English'
  },
  {
    title: 'Sabich (Israeli Eggplant Pita)',
    description: 'Popular Israeli street food with fried eggplant and hard-boiled eggs (Kosher)',
    ingredients: ['Eggplant', 'Eggs', 'Pita bread', 'Tahini', 'Amba sauce', 'Israeli salad', 'Pickles'],
    instructions: ['Fry eggplant slices', 'Boil eggs', 'Prepare salad', 'Assemble in pita with sauces'],
    prepTime: '15 min',
    cookTime: '20 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Kosher'
  },
  {
    title: 'Turkish Red Lentil Soup (Mercimek)',
    description: 'Creamy, aromatic lentil soup with lemon and mint (Kosher & Halal)',
    ingredients: ['Red lentils', 'Onions', 'Carrots', 'Tomato paste', 'Cumin', 'Mint', 'Lemon', 'Butter'],
    instructions: ['Sauté vegetables', 'Add lentils and water', 'Simmer until soft', 'Blend and garnish'],
    prepTime: '10 min',
    cookTime: '25 min',
    servings: '6',
    imageUrl: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Kosher & Halal'
  },
  {
    title: 'Mediterranean Grain Bowl',
    description: 'Hearty bowl with farro, roasted vegetables, feta, and lemon herb dressing (Kosher)',
    ingredients: ['Farro', 'Cherry tomatoes', 'Zucchini', 'Red onion', 'Feta cheese', 'Kalamata olives', 'Lemon', 'Fresh herbs'],
    instructions: ['Cook farro until tender', 'Roast vegetables with olive oil', 'Crumble feta', 'Toss with lemon herb dressing'],
    prepTime: '15 min',
    cookTime: '35 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Kosher'
  },
  {
    title: 'Fattoush Salad',
    description: 'Levantine bread salad with sumac and crispy pita chips (Kosher & Halal)',
    ingredients: ['Romaine lettuce', 'Tomatoes', 'Cucumbers', 'Radishes', 'Pita bread', 'Sumac', 'Olive oil'],
    instructions: ['Chop vegetables', 'Toast pita bread', 'Mix with sumac dressing', 'Top with crispy pita'],
    prepTime: '15 min',
    cookTime: '5 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Kosher & Halal'
  },
  {
    title: 'Halal Biryani',
    description: 'Fragrant South Asian rice dish with vegetables and aromatic spices (Halal)',
    ingredients: ['Basmati rice', 'Mixed vegetables', 'Saffron', 'Cardamom', 'Cinnamon', 'Bay leaves', 'Fried onions'],
    instructions: ['Parboil rice with spices', 'Layer with vegetables', 'Steam cook', 'Garnish with fried onions'],
    prepTime: '20 min',
    cookTime: '40 min',
    servings: '6',
    imageUrl: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'South Asian'
  },
  {
    title: 'Israeli Couscous Salad',
    description: 'Pearl couscous with roasted vegetables and herbs (Kosher)',
    ingredients: ['Israeli couscous', 'Cherry tomatoes', 'Zucchini', 'Red onion', 'Fresh herbs', 'Lemon', 'Olive oil'],
    instructions: ['Cook couscous', 'Roast vegetables', 'Mix with herbs and dressing', 'Serve warm or cold'],
    prepTime: '10 min',
    cookTime: '20 min',
    servings: '6',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Kosher'
  }
];

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery' | 'requests'>('generate');
  const [formData, setFormData] = useState<RecipeFormData>({
    dietaryNeeds: [],
    availableIngredients: '',
    culturalPreferences: [],
    season: '',
    pantryPhotoUrls: []
  });

  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; title: string; timestamp: Date; }>>([]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  
  // Recipe Search State (Gallery Tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Recipe Request State
  const [recipeRequests, setRecipeRequests] = useState<RecipeRequest[]>([]);
  const [requestForm, setRequestForm] = useState({
    userName: '',
    recipeName: '',
    description: '',
    dietaryRestrictions: [] as string[]
  });

  // Expanded recipe modal state (gallery tab) - removed, now using single modal
  
  // Gallery recipe detail generation state
  const [selectedGalleryRecipe, setSelectedGalleryRecipe] = useState<Recipe | null>(null);
  const [galleryRecipeLoading, setGalleryRecipeLoading] = useState(false);
  const [galleryRecipeError, setGalleryRecipeError] = useState<string | null>(null);
  const [generatedGalleryRecipe, setGeneratedGalleryRecipe] = useState<Recipe | null>(null);

  // Load history from Firestore
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Check if Firebase is configured before attempting to load
        const db = getDb();
        if (!db) {
          console.log('📝 Firebase not configured - history feature disabled');
          return;
        }

        const q = query(
          collection(db, 'recipes'),
          where('userId', '==', 'demo-user'),
          where('type', '==', 'generation-session'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.recipes?.[0]?.title || 'Recipe',
            timestamp: data.timestamp.toDate()
          };
        });
        setHistory(historyData);
        console.log('✅ Loaded recipe history:', historyData.length, 'items');
      } catch (err) {
        // Firebase query might fail if index doesn't exist yet
        // This is expected on first run - log but don't break the page
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.log('📝 Could not load recipe history:', errorMessage);
        if (errorMessage.includes('index')) {
          console.log('💡 Tip: Create a composite index in Firebase for recipes collection (userId + type + timestamp)');
        }
      }
    };
    loadHistory();
  }, []);

  // Save individual recipe to favorites
  const saveRecipeToFavorites = async (recipe: Recipe) => {
    try {
      const db = getDb();
      await addDoc(collection(db, 'favorite-recipes'), {
        userId: 'demo-user',
        recipe: recipe,
        timestamp: Timestamp.now(),
        tags: [
          ...(formData.dietaryNeeds || []),
          ...(formData.culturalPreferences || []),
          recipe.category
        ].filter(Boolean)
      });
      
      setSavedMessage(`✅ "${recipe.title}" saved to favorites!`);
      console.log('✅ Recipe saved to favorites:', recipe.title);
      
      // Clear message after 3 seconds
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      console.error('Error saving recipe to favorites:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('Firebase is not configured')) {
        setSavedMessage('📝 Favorites feature requires Firebase configuration');
      } else {
        setSavedMessage('❌ Failed to save recipe. Please try again.');
      }
      setTimeout(() => setSavedMessage(null), 3000);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDietaryNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryNeeds: prev.dietaryNeeds.includes(need)
        ? prev.dietaryNeeds.filter(n => n !== need)
        : [...prev.dietaryNeeds, need]
    }));
  };

  const toggleCulturalPreference = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      culturalPreferences: prev.culturalPreferences.includes(pref)
        ? prev.culturalPreferences.filter(p => p !== pref)
        : [...prev.culturalPreferences, pref]
    }));
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({ ...prev, pantryPhotoUrls: urls }));
  };

  // Recipe Request Handlers
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: RecipeRequest = {
      id: Date.now().toString(),
      userName: requestForm.userName,
      recipeName: requestForm.recipeName,
      description: requestForm.description,
      dietaryRestrictions: requestForm.dietaryRestrictions,
      timestamp: new Date(),
      votes: 0,
      status: 'pending'
    };
    setRecipeRequests(prev => [newRequest, ...prev]);
    setRequestForm({ userName: '', recipeName: '', description: '', dietaryRestrictions: [] });
  };

  const handleVote = (id: string) => {
    setRecipeRequests(prev =>
      prev.map(req => req.id === id ? { ...req, votes: req.votes + 1 } : req)
    );
  };

  const toggleRequestDietary = (value: string) => {
    setRequestForm(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(value)
        ? prev.dietaryRestrictions.filter(d => d !== value)
        : [...prev.dietaryRestrictions, value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Debug: Log raw form data
      console.log('📝 Raw form data:', {
        availableIngredients: formData.availableIngredients,
        length: formData.availableIngredients.length,
        pantryPhotos: formData.pantryPhotoUrls.length
      });

      // Validate ingredients before making API call
      const ingredients = formData.availableIngredients
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      console.log('📝 Parsed ingredients:', ingredients);

      // Allow recipes generation if either ingredients OR photos are provided
      if (ingredients.length === 0 && formData.pantryPhotoUrls.length === 0) {
        setError('❌ Please enter ingredients OR upload pantry photos. Example ingredients: tomatoes, pasta, basil');
        setLoading(false);
        return;
      }

      // If only photos provided, show info message
      if (ingredients.length === 0 && formData.pantryPhotoUrls.length > 0) {
        console.log('📸 Analyzing pantry photos with AI vision...');
        // API will use OpenAI Vision to extract ingredients from photos
      }

      console.log('🔄 Generating recipes with:', { 
        ingredients, 
        dietary: formData.dietaryNeeds,
        cultural: formData.culturalPreferences,
        season: formData.season,
        photos: formData.pantryPhotoUrls.length
      });

      const response = await fetch('/api/ai/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          dietaryNeeds: formData.dietaryNeeds,
          availableIngredients: ingredients,
          culturalPreferences: formData.culturalPreferences,
          pantryPhotoUrls: formData.pantryPhotoUrls,
          season: formData.season
        })
      });

      console.log('📡 API Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ API Response received:', result);

      if (result.ok && result.data) {
        // Handle new enhanced recipe format with spotlight and alternates
        const recipesArray: Recipe[] = [];
        
        if (result.data.spotlight) {
          // Add the spotlight recipe
          recipesArray.push({
            title: result.data.spotlight.title || 'Spotlight Recipe',
            description: result.data.spotlight.description || '',
            ingredients: result.data.spotlight.ingredients || [],
            instructions: result.data.spotlight.steps || result.data.spotlight.instructions || [],
            prepTime: result.data.spotlight.prepTime,
            cookTime: result.data.spotlight.cookTime,
            servings: result.data.spotlight.servings,
            culturalNotes: result.data.spotlight.culturalNotes,
            nutritionHighlights: result.data.spotlight.nutritionHighlights || [],
            imageUrl: result.data.spotlight.imageUrl,
            category: result.data.spotlight.difficulty || result.data.spotlight.category
          });
        }
        
        // Add alternate recipes if they exist
        if (result.data.alternates && Array.isArray(result.data.alternates)) {
          result.data.alternates.forEach((r: any) => {
            recipesArray.push({
              title: r.title || 'Recipe',
              description: r.description || '',
              ingredients: r.ingredients || [],
              instructions: r.steps || r.instructions || [],
              prepTime: r.prepTime,
              cookTime: r.cookTime,
              servings: r.servings,
              culturalNotes: r.culturalNotes,
              nutritionHighlights: r.nutritionHighlights || [],
              imageUrl: r.imageUrl,
              category: r.difficulty || r.category
            });
          });
        }
        
        // Fallback: if no spotlight/alternates structure, try to parse as before
        if (recipesArray.length === 0) {
          const recipeData = Array.isArray(result.data) ? result.data : [result.data];
          recipeData.forEach((r: any) => {
            recipesArray.push({
              title: r.title || r.name || 'Delicious Recipe',
              description: r.description || r.summary || '',
              ingredients: r.ingredients || [],
              instructions: r.instructions || r.steps || [],
              prepTime: r.prepTime || r.prep_time,
              cookTime: r.cookTime || r.cook_time,
              servings: r.servings,
              culturalNotes: r.culturalNotes || r.cultural_notes,
              nutritionHighlights: r.nutritionHighlights || r.nutrition_highlights || []
            });
          });
        }
        
        // Set loading state for images
        setImagesLoading(true);
        // Fetch web search images for each recipe
        console.log('🖼️  Fetching images for recipes...');
        const recipesWithImages = await Promise.all(
          recipesArray.map(async (recipe) => {
            try {
              const imageResponse = await fetch('/api/ai/recipe-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipeTitle: recipe.title,
                  recipeDescription: recipe.description
                })
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                if (imageData.ok && imageData.images?.length > 0) {
                  console.log(`✅ Fetched ${imageData.images.length} images for "${recipe.title}"`);
                  return { ...recipe, images: imageData.images };
                }
              }
              console.warn(`⚠️ Failed to fetch images for "${recipe.title}"`);
              return { ...recipe, images: [] };
            } catch (error) {
              console.error(`❌ Error fetching images for "${recipe.title}":`, error);
              return { ...recipe, images: [] };
            }
          })
        );
        setRecipes(recipesWithImages);
        setImagesLoading(false);
        console.log('✅ All recipe images loaded');

        // Save to Firebase with comprehensive data (images, geolocation, metadata)
        try {
          console.log('💾 Saving to Firestore with comprehensive data...');
          
          // Prepare analyzed ingredients data if vision was used
          let analyzedIngredients: AnalyzedIngredients | undefined;
          if (result.metadata?.visionAnalysis) {
            analyzedIngredients = {
              raw: result.metadata.visionAnalysis.raw || '',
              parsed: result.metadata.visionAnalysis.parsed || ingredients,
              detectionConfidence: result.metadata.visionAnalysis.confidence,
              visionModel: result.metadata.visionAnalysis.model || 'gpt-4o',
              analysisTimestamp: Timestamp.now(),
              analysisDurationMs: result.metadata.visionAnalysis.durationMs,
              fallbackUsed: result.metadata.visionAnalysis.fallbackUsed || false,
              errorMessage: result.metadata.visionAnalysis.error
            };
          } else if (ingredients.length === 0 && formData.pantryPhotoUrls.length > 0) {
            // Photos were used but no vision metadata returned - assume fallback
            analyzedIngredients = {
              raw: 'seasonal vegetables, pantry staples, fresh herbs',
              parsed: ['seasonal vegetables', 'pantry staples', 'fresh herbs'],
              visionModel: 'gpt-4o',
              analysisTimestamp: Timestamp.now(),
              fallbackUsed: true
            };
          }
          
          // Use the new comprehensive storage service
          const sessionRef = await quickSaveRecipeSession(
            'demo-user',
            formData,
            recipesArray,
            analyzedIngredients
          );
          
          console.log(`✅ Session saved with comprehensive data: ${sessionRef.id}`);
          console.log('📦 Saved: Images, geolocation, device info, vision analysis');

          // Update history from new recipe-sessions collection
          const q = query(
            collection(getDb(), 'recipe-sessions'),
            where('userId', '==', 'demo-user'),
            orderBy('timestamp', 'desc'),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          const historyData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.recipes?.[0]?.title || data.spotlightRecipe?.title || 'Recipe',
              timestamp: data.timestamp.toDate()
            };
          });
          setHistory(historyData);
        } catch (firestoreErr) {
          const errorMessage = firestoreErr instanceof Error ? firestoreErr.message : 'Unknown error';
          console.log('📝 Could not save to Firebase:', errorMessage);
          // Don't throw - recipes are still usable even if save fails
          if (errorMessage.includes('requires an index')) {
            console.log('💡 Firestore index required. Check Firebase Console for index creation link.');
          } else if (errorMessage.includes('Firebase is not configured')) {
            console.log('📝 Firebase not configured - recipes saved locally only');
          }
        }
      } else {
        console.error('❌ API returned ok:false -', result.message);
        setError(result.message || 'Failed to generate recipes. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error generating recipes:', err);
      
      // Provide specific error messages based on error type
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (errorMessage.includes('API returned 4')) {
        setError('Invalid request. Please check your ingredients and try again.');
      } else if (errorMessage.includes('API returned 5')) {
        setError('Server error. Please try again in a moment.');
      } else if (errorMessage.includes('timeout')) {
        setError('Request timed out. Please try again with fewer ingredients.');
      } else {
        setError(`Unable to generate recipes: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Recipe Search Handler
  const handleRecipeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    console.log('🔍 Searching for recipes:', searchQuery);
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const response = await fetch('/api/ai/recipe-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery: searchQuery.trim(),
          maxResults: 6
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Search response:', result);

      if (result.ok && result.recipes && result.recipes.length > 0) {
        console.log(`✅ Found ${result.recipes.length} recipes`);
        setSearchResults(result.recipes);
        
        // Fetch images for each recipe
        console.log('🖼️  Fetching images for search results...');
        const recipesWithImages = await Promise.all(
          result.recipes.map(async (recipe: Recipe) => {
            try {
              const imageResponse = await fetch('/api/ai/recipe-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipeTitle: recipe.title,
                  recipeDescription: recipe.description
                })
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                if (imageData.ok && imageData.images?.length > 0) {
                  return { ...recipe, images: imageData.images };
                }
              }
              
              return recipe;
            } catch (error) {
              console.error(`Error fetching images for "${recipe.title}":`, error);
              return recipe;
            }
          })
        );

        setSearchResults(recipesWithImages);
        console.log('✅ Search results with images ready');
      } else {
        setSearchError(result.message || 'No recipes found. Try a different search term.');
      }

    } catch (error) {
      console.error('❌ Recipe search error:', error);
      setSearchError('Failed to search recipes. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Generate detailed recipe for gallery items using OpenAI
  const handleGalleryRecipeGeneration = async (recipe: Recipe) => {
    console.log('🤖 Generating detailed recipe for:', recipe.title);
    setSelectedGalleryRecipe(recipe);
    setGalleryRecipeLoading(true);
    setGalleryRecipeError(null);
    setGeneratedGalleryRecipe(null);

    try {
      const response = await fetch('/api/ai/recipe-detail', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          recipeTitle: recipe.title,
          recipeDescription: recipe.description,
          existingIngredients: recipe.ingredients,
          category: recipe.category,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate recipe: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Generated detailed recipe:', result);

      if (result.ok && result.recipe) {
        // Fetch images for the detailed recipe - tries Pexels, Pixabay, then Unsplash
        console.log('🖼️  Fetching images for detailed recipe...');
        
        // Default fallback images only if all APIs fail
        const fallbackImages = [
          `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80`,
          `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80`,
          `https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80`,
          `https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80`
        ];
        
        try {
          const imageResponse = await fetch('/api/ai/recipe-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipeTitle: result.recipe.title,
              recipeDescription: result.recipe.description
            })
          });

          console.log('📡 Image API response status:', imageResponse.status);

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            console.log('✅ Image API response:', {
              ok: imageData.ok,
              provider: imageData.provider,
              imageCount: imageData.images?.length || 0,
              firstImage: imageData.images?.[0]?.substring(0, 80) + '...'
            });
            
            if (imageData.ok && imageData.images && imageData.images.length > 0) {
              // API returns images from Unsplash, Pexels, or Pixabay
              result.recipe.images = imageData.images;
              console.log(`✅ Set ${imageData.images.length} images from ${imageData.provider}`);
            } else {
              console.warn('⚠️ API returned no images, using fallback');
              result.recipe.images = fallbackImages;
            }
          } else {
            console.error('❌ Image API error (status ' + imageResponse.status + '), using fallback');
            result.recipe.images = fallbackImages;
          }
        } catch (imgError) {
          console.error('❌ Failed to fetch images (network error), using fallback:', imgError);
          result.recipe.images = fallbackImages;
        }

        console.log('📦 Final recipe with images:', {
          title: result.recipe.title,
          imageCount: result.recipe.images?.length || 0,
          firstImage: result.recipe.images?.[0]?.substring(0, 60)
        });

        setGeneratedGalleryRecipe(result.recipe);
      } else {
        setGalleryRecipeError(result.message || 'Failed to generate detailed recipe');
      }
    } catch (error) {
      console.error('❌ Error generating gallery recipe:', error);
      setGalleryRecipeError('Failed to generate recipe details. Please try again.');
    } finally {
      setGalleryRecipeLoading(false);
    }
  };

  return (
    <div className="recipes-page">
      {/* Hero Section */}
      <div 
        className="p-4 p-md-5 mb-4 rounded text-body-emphasis" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic text-white">
            <Icon name="dish" className="icon-inline me-2" />
            Recipe AI
          </h1>
          <p className="lead my-3 text-white">
            Discover personalized recipes, browse our gallery, and request your favorite dishes!
          </p>
        </div>
      </div>

      {/* Tabs Navigation - Card Style */}
      <div className="recipe-tabs-container mb-4">
        <div className="row g-3" role="tablist" aria-label="Recipe section tabs">
          <div className="col-md-4 col-sm-12">
            <div 
              className={`card h-100 shadow-sm ${activeTab === 'generate' ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveTab('generate')}
              role="tab"
              aria-selected={activeTab === 'generate'}
              aria-controls="generate-panel"
              id="generate-tab"
            >
              <div className={`card-body text-center ${activeTab === 'generate' ? 'bg-primary bg-opacity-10' : ''}`}>
                <Icon name="dish" className="icon-inline mb-2" aria-hidden="true" style={{ fontSize: '2rem' }} />
                <h5 className="card-title mb-2">Generate Recipes</h5>
                <p className="card-text text-muted small mb-0">
                  AI-powered personalized recipes
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 col-sm-12">
            <div 
              className={`card h-100 shadow-sm ${activeTab === 'gallery' ? 'border-success' : ''}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveTab('gallery')}
              role="tab"
              aria-selected={activeTab === 'gallery'}
              aria-controls="gallery-panel"
              id="gallery-tab"
            >
              <div className={`card-body text-center ${activeTab === 'gallery' ? 'bg-success bg-opacity-10' : ''}`}>
                <Icon name="basket" className="icon-inline mb-2" aria-hidden="true" style={{ fontSize: '2rem' }} />
                <h5 className="card-title mb-2">Recipe Gallery</h5>
                <p className="card-text text-muted small mb-0">
                  Browse curated plant-based recipes
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 col-sm-12">
            <div 
              className={`card h-100 shadow-sm ${activeTab === 'requests' ? 'border-warning' : ''}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveTab('requests')}
              role="tab"
              aria-selected={activeTab === 'requests'}
              aria-controls="requests-panel"
              id="requests-tab"
            >
              <div className={`card-body text-center ${activeTab === 'requests' ? 'bg-warning bg-opacity-10' : ''}`}>
                <Icon name="lightbulb" className="icon-inline mb-2" aria-hidden="true" style={{ fontSize: '2rem' }} />
                <h5 className="card-title mb-2">Recipe Requests</h5>
                <p className="card-text text-muted small mb-0">
                  Request your favorite dishes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Generate Tab - Using original layout */}
        {activeTab === 'generate' && (
          <div className="row g-5" role="tabpanel" id="generate-panel" aria-labelledby="generate-tab">
            {/* Original Generate Recipe Form and Content */}
            <div className="col-md-8 col-sm-12">
              <h3 className="pb-4 mb-4 fst-italic border-bottom">
                Recipe Generator
              </h3>

              <article className="blog-post">
                <div className="p-4 mb-3 bg-body-tertiary rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <span className="badge bg-primary">Multiple recipes</span>
                      <span className="text-body-secondary ms-2">~20 seconds</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Dietary Requirements *</label>
                      <div
                        className="card-checkbox-grid rc-checkbox-grid"
                        role="group"
                        aria-label="Dietary requirements"
                      >
                        {dietaryOptions.map(option => {
                          const optionId = toOptionId('dietary', option.value);
                          const isChecked = formData.dietaryNeeds.includes(option.value);
                          return (
                            <div key={option.value} className="card-checkbox-item rc-checkbox-item">
                              <input
                                className="card-checkbox-input"
                                type="checkbox"
                                id={optionId}
                                checked={isChecked}
                                onChange={() => toggleDietaryNeed(option.value)}
                              />
                              <label className={`card-checkbox rc-checkbox-card${isChecked ? ' checked' : ''}`} htmlFor={optionId}>
                                <span className="card-checkbox-icon" aria-hidden="true">
                                  <Icon name={option.icon} />
                                </span>
                                <span className="card-checkbox-text">{option.value}</span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="ingredients" className="form-label fw-bold">
                        Available Ingredients
                        {formData.pantryPhotoUrls.length === 0 && (
                          <span className="badge bg-danger ms-2">Required</span>
                        )}
                        {formData.pantryPhotoUrls.length > 0 && (
                          <span className="badge bg-info ms-2">Optional with photos</span>
                        )}
                      </label>
                      <textarea
                        id="ingredients"
                        name="availableIngredients"
                        className="form-control"
                        rows={3}
                        placeholder="e.g. Tomatoes, onions, garlic, pasta, olive oil, chickpeas"
                        value={formData.availableIngredients}
                        onChange={handleInputChange}
                        required={formData.pantryPhotoUrls.length === 0}
                      ></textarea>
                      <small className="form-text text-body-secondary">
                        {formData.pantryPhotoUrls.length === 0 ? (
                          <>📝 List ingredients you have, separated by commas. Or upload photos below.</>
                        ) : (
                          <>📸 {formData.pantryPhotoUrls.length} photo(s) uploaded! You can add text ingredients for better results.</>
                        )}
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Cultural Preferences</label>
                      <div
                        className="card-checkbox-grid rc-checkbox-grid"
                        role="group"
                        aria-label="Cultural preferences"
                      >
                        {culturalOptions.map(option => {
                          const optionId = toOptionId('cultural', option.value);
                          const isChecked = formData.culturalPreferences.includes(option.value);
                          return (
                            <div key={option.value} className="card-checkbox-item rc-checkbox-item">
                              <input
                                className="card-checkbox-input"
                                type="checkbox"
                                id={optionId}
                                checked={isChecked}
                                onChange={() => toggleCulturalPreference(option.value)}
                              />
                              <label className={`card-checkbox rc-checkbox-card${isChecked ? ' checked' : ''}`} htmlFor={optionId}>
                                <span className="card-checkbox-icon" aria-hidden="true">
                                  <Icon name={option.icon} />
                                </span>
                                <span className="card-checkbox-text">{option.value}</span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="season" className="form-label fw-bold">Seasonal Preference</label>
                      <select
                        id="season"
                        name="season"
                        className="form-select"
                        value={formData.season}
                        onChange={handleInputChange}
                      >
                        <option value="">Select season</option>
                        {seasonOptions.map(season => (
                          <option key={season} value={season}>{season}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">Pantry/Fridge Photos (Optional)</label>
                      <ImageUpload
                        onImagesChange={handleImagesChange}
                        maxImages={5}
                        helperText="📸 Upload photos of your pantry/fridge. AI will identify ingredients automatically!"
                      />
                      {formData.pantryPhotoUrls.length > 0 && (
                        <small className="form-text text-success d-block mt-2">
                          ✨ AI will analyze your photos to identify available ingredients
                        </small>
                      )}
                    </div>

                    {savedMessage && (
                      <div className={`alert ${savedMessage.includes('✅') ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-3`} role="alert">
                        <div>{savedMessage}</div>
                      </div>
                    )}

                    {error && (
                      <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                        </svg>
                        <div>{error}</div>
                      </div>
                    )}

                    <div className="d-flex flex-column gap-3">
                      <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Generating...
                          </>
                        ) : (
                          <>Generate Recipes</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            </div>

            {/* Sidebar for Generated Recipes */}
            <div className="col-md-4 col-sm-12">
              <div className="position-sticky" style={{ top: '2rem' }}>
                {recipes.length > 0 ? (
                  <div>
                    <h4 className="fst-italic mb-3">
                      <Icon name="dish" className="icon-inline me-2" />
                      Your Recipes ({recipes.length})
                    </h4>
                    {recipes.map((recipe, index) => (
                      <div key={index} className="card mb-3 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title mb-0">{recipe.title}</h5>
                            <div className="d-flex gap-2 align-items-center">
                              {index === 0 && (
                                <span className="badge bg-primary">Spotlight</span>
                              )}
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => saveRecipeToFavorites(recipe)}
                                title="Save to favorites"
                              >
                                ❤️
                              </button>
                            </div>
                          </div>
                          
                          <p className="card-text small text-muted mb-2">{recipe.description}</p>
                          
                          {/* Recipe Images Carousel */}
                          {recipe.images && recipe.images.length > 0 && (
                            <RecipeImageCarousel 
                              images={recipe.images} 
                              recipeName={recipe.title} 
                            />
                          )}
                          
                          {/* Quick Info */}
                          <div className="d-flex flex-wrap gap-2 mb-2 small">
                            {recipe.prepTime && (
                              <span className="badge bg-light text-dark">
                                ⏱️ {recipe.prepTime}
                              </span>
                            )}
                            {recipe.cookTime && (
                              <span className="badge bg-light text-dark">
                                🔥 {recipe.cookTime}
                              </span>
                            )}
                            {recipe.servings && (
                              <span className="badge bg-light text-dark">
                                👥 {recipe.servings}
                              </span>
                            )}
                            {recipe.category && (
                              <span className="badge bg-success">
                                {recipe.category}
                              </span>
                            )}
                          </div>

                          {/* Collapsible Details */}
                          <details className="mt-2">
                            <summary className="btn btn-sm btn-outline-primary w-100 mb-2" style={{cursor: 'pointer'}}>
                              View Full Recipe
                            </summary>
                            
                            <div className="mt-3">
                              {/* Ingredients */}
                              {recipe.ingredients && recipe.ingredients.length > 0 && (
                                <div className="mb-3">
                                  <h6 className="fw-bold">
                                    <Icon name="basket" className="icon-inline me-1" />
                                    Ingredients:
                                  </h6>
                                  <ul className="small mb-0" style={{paddingLeft: '1.2rem'}}>
                                    {recipe.ingredients.map((ing, i) => (
                                      <li key={i}>{ing}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Instructions */}
                              {recipe.instructions && recipe.instructions.length > 0 && (
                                <div className="mb-3">
                                  <h6 className="fw-bold">
                                    <Icon name="clipboard" className="icon-inline me-1" />
                                    Instructions:
                                  </h6>
                                  <ol className="small mb-0" style={{paddingLeft: '1.2rem'}}>
                                    {recipe.instructions.map((step, i) => (
                                      <li key={i} className="mb-1">{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              
                              {/* Nutrition Highlights */}
                              {recipe.nutritionHighlights && recipe.nutritionHighlights.length > 0 && (
                                <div className="mb-3">
                                  <h6 className="fw-bold">
                                    <Icon name="heart" className="icon-inline me-1" />
                                    Nutrition:
                                  </h6>
                                  <ul className="small mb-0" style={{paddingLeft: '1.2rem'}}>
                                    {recipe.nutritionHighlights.map((highlight, i) => (
                                      <li key={i}>{highlight}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Cultural Notes */}
                              {recipe.culturalNotes && (
                                <div className="mb-3">
                                  <h6 className="fw-bold">
                                    <Icon name="globe" className="icon-inline me-1" />
                                    Cultural Context:
                                  </h6>
                                  <p className="small text-muted mb-0">{recipe.culturalNotes}</p>
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-body-tertiary rounded">
                    <h4 className="fst-italic mb-3">
                      <Icon name="dish" className="icon-inline me-2" />
                      No recipes yet
                    </h4>
                    <p className="mb-0">Fill out the form and click "Generate Recipes" to get personalized recipe recommendations!</p>
                  </div>
                )}

                {history.length > 0 && (
                  <div className="p-4 mt-3 bg-body-tertiary rounded">
                    <h4 className="fst-italic mb-3">Recent Recipes</h4>
                    <ul className="list-unstyled">
                      {history.map((item) => (
                        <li key={item.id} className="mb-2">
                          <strong>{item.title}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recipe Gallery Tab - Masonry Layout */}
        {activeTab === 'gallery' && (
          <div className="recipe-gallery-container" role="tabpanel" id="gallery-panel" aria-labelledby="gallery-tab">
            <h3 className="text-center mb-4">Recipe Inspiration Gallery</h3>
            <p className="text-center text-muted mb-5">Explore our collection of delicious plant-based recipes</p>
            
            {/* Recipe Search Section */}
            <div className="search-section mb-5">
              <h4 className="text-center mb-3">🔍 Search for Recipes</h4>
              <form onSubmit={handleRecipeSearch} className="search-form" role="search">
                <div className="input-group mb-3">
                  <label htmlFor="recipe-search-input" className="visually-hidden">Search for Recipes</label>
                  <input 
                    type="text"
                    id="recipe-search-input"
                    className="form-control form-control-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Italian pasta, vegan desserts, quick breakfast..."
                    disabled={searchLoading}
                    aria-label="Search for recipes"
                  />
                  <button 
                    className="btn btn-primary btn-lg" 
                    type="submit" 
                    disabled={searchLoading || !searchQuery.trim()}
                    aria-label={searchLoading ? 'Searching' : 'Search recipes'}
                  >
                    {searchLoading ? 'Searching...' : '🔍'}
                  </button>
                </div>
              </form>
              
              {searchError && (
                <div className="alert alert-warning text-center" role="alert">
                  <strong>⚠️ {searchError}</strong>
                </div>
              )}
              
              {searchLoading && (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Searching for recipes...</span>
                  </div>
                  <p className="mt-2 text-muted">Searching for delicious recipes...</p>
                </div>
              )}
            </div>
            
            <div className="recipe-masonry">
              {/* Show search results if available, otherwise show gallery */}
              {searchResults.length > 0 ? (
                <>
                  <div className="col-12 mb-4">
                    <h5 className="text-center text-success">
                      ✨ Found {searchResults.length} delicious recipes for "{searchQuery}"
                    </h5>
                  </div>
                  {searchResults.map((recipe, index) => (
                    <div key={index} className="recipe-masonry-item">
                      {/* Show loading indicator while images are loading */}
                      {imagesLoading ? (
                        <div className="recipe-image-placeholder">
                          <span>Loading images...</span>
                        </div>
                      ) : (
                        <RecipeImageCarousel images={recipe.images || []} recipeName={recipe.title} />
                      )}
                      <div className="recipe-gallery-content">
                        <h4>{recipe.title}</h4>
                        <p className="recipe-gallery-description">{recipe.description}</p>
                        
                        {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
                          <div className="recipe-gallery-meta">
                            {recipe.prepTime && <span><Icon name="calendar" /> {recipe.prepTime}</span>}
                            {recipe.cookTime && <span><Icon name="fire" /> {recipe.cookTime}</span>}
                            {recipe.servings && <span><Icon name="people" /> {recipe.servings}</span>}
                          </div>
                        )}
                        
                        {recipe.source && (
                          <p className="text-muted small mt-2">
                            <Icon name="globe" /> Source: {recipe.source}
                          </p>
                        )}
                        
                        <button
                          className="btn btn-sm btn-outline-primary mt-2 text-muted"
                          onClick={() => handleGalleryRecipeGeneration(recipe)}
                          aria-label={`View detailed recipe for ${recipe.title}`}
                        >
                          View Recipe
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                /* Default gallery recipes */
                mockGalleryRecipes.map((recipe, index) => (
                <div key={index} className="recipe-masonry-item">
                  {recipe.imageUrl && (
                    <div className="recipe-gallery-image">
                      <img src={recipe.imageUrl} alt={recipe.title} loading="lazy" />
                      {recipe.category && (
                        <span className="recipe-category-badge">{recipe.category}</span>
                      )}
                    </div>
                  )}
                  <div className="recipe-gallery-content">
                    <h4>{recipe.title}</h4>
                    <p className="recipe-gallery-description">{recipe.description}</p>
                    
                    {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
                      <div className="recipe-gallery-meta">
                        {recipe.prepTime && <span><Icon name="calendar" /> {recipe.prepTime}</span>}
                        {recipe.cookTime && <span><Icon name="fire" /> {recipe.cookTime}</span>}
                        {recipe.servings && <span><Icon name="people" /> {recipe.servings}</span>}
                      </div>
                    )}
                    
                    <button 
                      className="btn btn-sm btn-outline-success mt-2 text-light"
                      onClick={() => handleGalleryRecipeGeneration(recipe)}
                      aria-label={`View detailed recipe for ${recipe.title}`}
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Recipe Requests Tab */}
        {activeTab === 'requests' && (
          <div className="row g-5" role="tabpanel" id="requests-panel" aria-labelledby="requests-tab">
            <div className="col-md-8">
              <h3 className="pb-4 mb-4 fst-italic border-bottom">
                Request a Recipe
              </h3>

              <div className="p-4 mb-4 bg-body-tertiary rounded">
                <form onSubmit={handleRequestSubmit}>
                  <div className="mb-3">
                    <label htmlFor="userName" className="form-label fw-bold">Your Name *</label>
                    <input
                      type="text"
                      id="userName"
                      className="form-control"
                      value={requestForm.userName}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, userName: e.target.value }))}
                      required
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="recipeName" className="form-label fw-bold">Recipe Name *</label>
                    <input
                      type="text"
                      id="recipeName"
                      className="form-control"
                      value={requestForm.recipeName}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, recipeName: e.target.value }))}
                      required
                      placeholder="e.g., Vegan Pad Thai"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label fw-bold">Description *</label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows={3}
                      value={requestForm.description}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                      placeholder="Describe the recipe you'd like to see..."
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Dietary Restrictions</label>
                    <div className="d-flex flex-wrap gap-2">
                      {['Vegan', 'Vegetarian', 'Gluten-Free', 'Nut-Free', 'Soy-Free'].map(diet => (
                        <div key={diet} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`req-${diet}`}
                            checked={requestForm.dietaryRestrictions.includes(diet)}
                            onChange={() => toggleRequestDietary(diet)}
                          />
                          <label className="form-check-label" htmlFor={`req-${diet}`}>
                            {diet}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg">
                    Submit Request
                  </button>
                </form>
              </div>

              <h4 className="pb-3 mb-3 border-bottom">
                Community Requests ({recipeRequests.length})
              </h4>

              {recipeRequests.length > 0 ? (
                <div className="recipe-requests-list">
                  {recipeRequests.map((request) => (
                    <div key={request.id} className="recipe-request-card p-4 mb-3 bg-body-tertiary rounded">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="mb-1">{request.recipeName}</h5>
                          <small className="text-muted">Requested by {request.userName}</small>
                        </div>
                        <span className={`badge bg-${request.status === 'pending' ? 'warning' : request.status === 'in-progress' ? 'info' : 'success'}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="mb-2">{request.description}</p>
                      {request.dietaryRestrictions.length > 0 && (
                        <div className="mb-2">
                          {request.dietaryRestrictions.map(diet => (
                            <span key={diet} className="badge bg-secondary me-1">{diet}</span>
                          ))}
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {new Date(request.timestamp).toLocaleDateString()}
                        </small>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleVote(request.id)}
                        >
                          👍 Upvote ({request.votes})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  No requests yet. Be the first to request a recipe!
                </div>
              )}
            </div>

            <div className="col-md-4">
              <div className="position-sticky" style={{ top: '2rem' }}>
                <div className="p-4 bg-body-tertiary rounded">
                  <h4 className="fst-italic mb-3">
                    <Icon name="lightbulb" className="icon-inline me-2" />
                    How it Works
                  </h4>
                  <ol className="ps-3">
                    <li className="mb-2">Submit your recipe request with details</li>
                    <li className="mb-2">Community members can upvote requests they like</li>
                    <li className="mb-2">Our team creates the most popular recipes</li>
                    <li className="mb-2">New recipes are added to the gallery weekly</li>
                  </ol>
                </div>

                <div className="p-4 mt-3 bg-body-tertiary rounded">
                  <h5 className="mb-3">Most Requested</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">🥇 Vegan Sushi Rolls</li>
                    <li className="mb-2">🥈 Cashew Mac & Cheese</li>
                    <li className="mb-2">🥉 Lentil Shepherd's Pie</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for AI-generated gallery recipe details */}
      {selectedGalleryRecipe && (
        <div className="modal show" tabIndex={-1} style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {generatedGalleryRecipe?.title || selectedGalleryRecipe.title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  aria-label="Close" 
                  onClick={() => {
                    setSelectedGalleryRecipe(null);
                    setGeneratedGalleryRecipe(null);
                    setGalleryRecipeError(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {galleryRecipeLoading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">AI is generating your detailed recipe...</p>
                  </div>
                )}

                {galleryRecipeError && (
                  <div className="alert alert-danger" role="alert">
                    <strong>⚠️ {galleryRecipeError}</strong>
                  </div>
                )}

                {generatedGalleryRecipe && !galleryRecipeLoading && (
                  <>
                    {/* Recipe Images Carousel */}
                    {generatedGalleryRecipe.images && generatedGalleryRecipe.images.length > 0 && (
                      <div className="mb-4">
                        <RecipeImageCarousel 
                          images={generatedGalleryRecipe.images} 
                          recipeName={generatedGalleryRecipe.title} 
                        />
                      </div>
                    )}

                    {/* Description */}
                    {generatedGalleryRecipe.description && (
                      <div className="mb-4">
                        <p className="lead">{generatedGalleryRecipe.description}</p>
                      </div>
                    )}

                    {/* Quick Info */}
                    <div className="d-flex flex-wrap gap-3 mb-4">
                      {generatedGalleryRecipe.prepTime && (
                        <div className="badge bg-info text-dark">
                          <Icon name="calendar" className="me-1" /> Prep: {generatedGalleryRecipe.prepTime}
                        </div>
                      )}
                      {generatedGalleryRecipe.cookTime && (
                        <div className="badge bg-warning text-dark">
                          <Icon name="fire" className="me-1" /> Cook: {generatedGalleryRecipe.cookTime}
                        </div>
                      )}
                      {generatedGalleryRecipe.servings && (
                        <div className="badge bg-success">
                          <Icon name="people" className="me-1" /> Servings: {generatedGalleryRecipe.servings}
                        </div>
                      )}
                      {generatedGalleryRecipe.category && (
                        <div className="badge bg-primary">
                          {generatedGalleryRecipe.category}
                        </div>
                      )}
                    </div>

                    {/* Ingredients */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2">
                        <Icon name="basket" className="me-2" />
                        Ingredients
                      </h6>
                      <ul className="list-group list-group-flush">
                        {generatedGalleryRecipe.ingredients?.map((ing, i) => (
                          <li key={i} className="list-group-item">
                            <Icon name="checkCircle" className="me-2 text-success" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2">
                        <Icon name="clipboardData" className="me-2" />
                        Instructions
                      </h6>
                      <ol className="list-group list-group-numbered">
                        {generatedGalleryRecipe.instructions?.map((step, i) => (
                          <li key={i} className="list-group-item">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Cultural Notes */}
                    {generatedGalleryRecipe.culturalNotes && (
                      <div className="mb-4">
                        <h6 className="border-bottom pb-2">
                          <Icon name="globe" className="me-2" />
                          Historic facts
                        </h6>
                        <p className="text-muted">{generatedGalleryRecipe.culturalNotes}</p>
                      </div>
                    )}

                    {/* Nutrition Highlights */}
                    {generatedGalleryRecipe.nutritionHighlights && generatedGalleryRecipe.nutritionHighlights.length > 0 && (
                      <div className="mb-4">
                        <h6 className="border-bottom pb-2">
                          <Icon name="heart" className="me-2" />
                          Nutrition Highlights
                        </h6>
                        <ul className="list-unstyled">
                          {generatedGalleryRecipe.nutritionHighlights.map((highlight, i) => (
                            <li key={i} className="mb-2">
                              <Icon name="checkCircle" className="me-2 text-success" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Source */}
                    {generatedGalleryRecipe.source && (
                      <div className="alert alert-info">
                        <small>
                          <strong>Source:</strong> {generatedGalleryRecipe.source}
                        </small>
                      </div>
                    )}
                  </>
                )}

                {!galleryRecipeLoading && !generatedGalleryRecipe && !galleryRecipeError && (
                  <div className="text-center py-4 text-muted">
                    <Icon name="dish" className="display-1 mb-3" />
                    <p>Click "Generate Recipe" to see detailed instructions</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {generatedGalleryRecipe && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => saveRecipeToFavorites(generatedGalleryRecipe)}
                  >
                    <Icon name="heart" className="me-2" />
                    Save to Favorites
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSelectedGalleryRecipe(null);
                    setGeneratedGalleryRecipe(null);
                    setGalleryRecipeError(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}