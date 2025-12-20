import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
import { Icon, type IconName } from '../components/Icon';
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
  category?: string;
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

// Mock recipe gallery data
const mockGalleryRecipes: Recipe[] = [
  {
    title: 'Mediterranean Quinoa Bowl',
    description: 'Fresh quinoa with roasted vegetables, chickpeas, and tahini dressing',
    ingredients: ['Quinoa', 'Chickpeas', 'Bell peppers', 'Cucumber', 'Cherry tomatoes', 'Tahini', 'Lemon'],
    instructions: ['Cook quinoa', 'Roast vegetables', 'Mix tahini dressing', 'Combine all ingredients'],
    prepTime: '15 min',
    cookTime: '25 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Vegan'
  },
  {
    title: 'Spicy Thai Noodle Soup',
    description: 'Aromatic coconut curry soup with rice noodles and fresh herbs',
    ingredients: ['Rice noodles', 'Coconut milk', 'Thai curry paste', 'Tofu', 'Bean sprouts', 'Lime', 'Cilantro'],
    instructions: ['Prepare broth', 'Cook noodles', 'Add vegetables', 'Garnish with herbs'],
    prepTime: '10 min',
    cookTime: '20 min',
    servings: '3',
    imageUrl: 'https://images.pexels.com/photos/1907227/pexels-photo-1907227.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Asian'
  },
  {
    title: 'Roasted Vegetable Medley',
    description: 'Colorful assortment of seasonal vegetables with herbs',
    ingredients: ['Carrots', 'Zucchini', 'Bell peppers', 'Red onion', 'Olive oil', 'Rosemary', 'Thyme'],
    instructions: ['Chop vegetables', 'Toss with oil and herbs', 'Roast at 400°F', 'Serve hot'],
    prepTime: '15 min',
    cookTime: '30 min',
    servings: '6',
    imageUrl: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Mediterranean'
  },
  {
    title: 'Avocado Toast Deluxe',
    description: 'Creamy avocado on sourdough with cherry tomatoes and microgreens',
    ingredients: ['Sourdough bread', 'Avocado', 'Cherry tomatoes', 'Microgreens', 'Lemon juice', 'Sea salt'],
    instructions: ['Toast bread', 'Mash avocado', 'Top with tomatoes', 'Add microgreens'],
    prepTime: '5 min',
    cookTime: '5 min',
    servings: '2',
    imageUrl: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Breakfast'
  },
  {
    title: 'Lentil Curry Power Bowl',
    description: 'Hearty red lentil curry served over brown rice with spinach',
    ingredients: ['Red lentils', 'Curry powder', 'Coconut milk', 'Spinach', 'Brown rice', 'Ginger', 'Garlic'],
    instructions: ['Cook lentils', 'Prepare curry sauce', 'Add spinach', 'Serve over rice'],
    prepTime: '10 min',
    cookTime: '25 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Indian'
  },
  {
    title: 'Berry Smoothie Bowl',
    description: 'Antioxidant-rich smoothie bowl topped with granola and fresh berries',
    ingredients: ['Mixed berries', 'Banana', 'Almond milk', 'Granola', 'Chia seeds', 'Honey'],
    instructions: ['Blend fruits with milk', 'Pour into bowl', 'Add toppings', 'Serve immediately'],
    prepTime: '5 min',
    cookTime: '0 min',
    servings: '2',
    imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Breakfast'
  },
  {
    title: 'Grilled Vegetable Skewers',
    description: 'Colorful veggie kabobs with balsamic glaze',
    ingredients: ['Zucchini', 'Bell peppers', 'Red onion', 'Mushrooms', 'Cherry tomatoes', 'Balsamic vinegar'],
    instructions: ['Cut vegetables', 'Thread on skewers', 'Brush with oil', 'Grill until tender'],
    prepTime: '20 min',
    cookTime: '15 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Mediterranean'
  },
  {
    title: 'Fresh Spring Salad',
    description: 'Mixed greens with strawberries, walnuts, and poppy seed dressing',
    ingredients: ['Mixed greens', 'Strawberries', 'Walnuts', 'Feta cheese', 'Poppy seed dressing'],
    instructions: ['Wash greens', 'Slice strawberries', 'Toast walnuts', 'Toss with dressing'],
    prepTime: '10 min',
    cookTime: '0 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Salads'
  },
  {
    title: 'Chickpea Buddha Bowl',
    description: 'Wholesome bowl with roasted chickpeas, quinoa, and tahini sauce',
    ingredients: ['Chickpeas', 'Quinoa', 'Kale', 'Sweet potato', 'Tahini', 'Lemon'],
    instructions: ['Roast chickpeas and sweet potato', 'Cook quinoa', 'Massage kale', 'Drizzle with tahini'],
    prepTime: '15 min',
    cookTime: '30 min',
    servings: '3',
    imageUrl: 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Vegan'
  },
  {
    title: 'Mushroom Risotto',
    description: 'Creamy Italian rice dish with mixed mushrooms and parmesan',
    ingredients: ['Arborio rice', 'Mixed mushrooms', 'Vegetable broth', 'White wine', 'Parmesan', 'Butter'],
    instructions: ['Sauté mushrooms', 'Toast rice', 'Add broth gradually', 'Stir in cheese'],
    prepTime: '10 min',
    cookTime: '30 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/1630309/pexels-photo-1630309.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'European'
  },
  {
    title: 'Tropical Fruit Salad',
    description: 'Refreshing mix of tropical fruits with lime and mint',
    ingredients: ['Mango', 'Pineapple', 'Papaya', 'Kiwi', 'Lime juice', 'Fresh mint'],
    instructions: ['Cube fruits', 'Toss with lime juice', 'Chill', 'Garnish with mint'],
    prepTime: '15 min',
    cookTime: '0 min',
    servings: '6',
    imageUrl: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Dessert'
  },
  {
    title: 'Veggie Stir-Fry',
    description: 'Quick and healthy Asian-style vegetable stir-fry',
    ingredients: ['Mixed vegetables', 'Soy sauce', 'Ginger', 'Garlic', 'Sesame oil', 'Rice'],
    instructions: ['Prep vegetables', 'Heat wok', 'Stir-fry vegetables', 'Add sauce'],
    prepTime: '15 min',
    cookTime: '10 min',
    servings: '4',
    imageUrl: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Asian'
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
  
  // Recipe Request State
  const [recipeRequests, setRecipeRequests] = useState<RecipeRequest[]>([]);
  const [requestForm, setRequestForm] = useState({
    userName: '',
    recipeName: '',
    description: '',
    dietaryRestrictions: [] as string[]
  });

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
      const response = await fetch('/api/ai/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          dietaryNeeds: formData.dietaryNeeds,
          availableIngredients: formData.availableIngredients
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          culturalPreferences: formData.culturalPreferences,
          pantryPhotoUrls: formData.pantryPhotoUrls,
          season: formData.season
        })
      });

      const result = await response.json();

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
        
        setRecipes(recipesArray);

        // Save to Firebase Firestore (optional - don't block on failure)
        try {
          const db = getDb();
          
          // Save the recipe generation session
          const sessionDoc = await addDoc(collection(db, 'recipes'), {
            userId: 'demo-user',
            formData: formData,
            recipes: recipesArray,
            timestamp: Timestamp.now(),
            type: 'generation-session'
          });
          
          console.log('✅ Recipe session saved to Firebase:', sessionDoc.id);

          // Save each individual recipe for easier querying
          const savePromises = recipesArray.map(async (recipe) => {
            return addDoc(collection(db, 'user-recipes'), {
              userId: 'demo-user',
              sessionId: sessionDoc.id,
              recipe: recipe,
              formData: {
                dietaryNeeds: formData.dietaryNeeds,
                culturalPreferences: formData.culturalPreferences,
                season: formData.season
              },
              timestamp: Timestamp.now(),
              isFavorite: false,
              tags: [
                ...formData.dietaryNeeds,
                ...formData.culturalPreferences,
                formData.season
              ].filter(Boolean)
            });
          });

          await Promise.all(savePromises);
          console.log(`✅ ${recipesArray.length} individual recipes saved to Firebase`);

          // Update history from Firestore
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
        setError(result.message || 'Failed to generate recipes');
      }
    } catch (err) {
      setError('Network error. Please ensure the backend server is running.');
      console.error('Error generating recipes:', err);
    } finally {
      setLoading(false);
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

      {/* Tabs Navigation */}
      <div className="recipe-tabs-container mb-4">
        <ul className="nav nav-tabs recipe-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'generate' ? 'active' : ''}`}
              onClick={() => setActiveTab('generate')}
              type="button"
              role="tab"
            >
              <Icon name="dish" className="icon-inline me-2" />
              Generate Recipes
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
              type="button"
              role="tab"
            >
              <Icon name="basket" className="icon-inline me-2" />
              Recipe Gallery
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
              type="button"
              role="tab"
            >
              <Icon name="lightbulb" className="icon-inline me-2" />
              Recipe Requests
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Generate Tab - Using original layout */}
        {activeTab === 'generate' && (
          <div className="row g-5">
            {/* Original Generate Recipe Form and Content */}
            <div className="col-md-8">
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
                      <label htmlFor="ingredients" className="form-label fw-bold">Available Ingredients *</label>
                      <textarea
                        id="ingredients"
                        name="availableIngredients"
                        className="form-control"
                        rows={3}
                        placeholder="e.g. Tomatoes, onions, garlic, pasta, olive oil, chickpeas"
                        value={formData.availableIngredients}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      <small className="form-text text-body-secondary">
                        List ingredients you have available, separated by commas
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
                        helperText="Drag & drop images of your fridge or pantry. AI will identify additional ingredients."
                      />
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
            <div className="col-md-4">
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
          <div className="recipe-gallery-container">
            <h3 className="text-center mb-4">Recipe Inspiration Gallery</h3>
            <p className="text-center text-muted mb-5">Explore our collection of delicious plant-based recipes</p>
            
            <div className="recipe-masonry">
              {mockGalleryRecipes.map((recipe, index) => (
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
                    
                    <button className="btn btn-sm btn-outline-primary mt-2">
                      View Recipe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Requests Tab */}
        {activeTab === 'requests' && (
          <div className="row g-5">
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
    </div>
  );
}
