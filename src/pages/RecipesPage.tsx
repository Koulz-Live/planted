import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
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
}

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Kosher', 'Halal', 
  'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb'
];

const culturalOptions = [
  'Mediterranean', 'Middle Eastern', 'Asian', 'African',
  'Latin American', 'European', 'Indian', 'Caribbean'
];

const seasonOptions = ['Spring', 'Summer', 'Fall', 'Winter', 'Any Season'];

export default function RecipesPage() {
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

  // Load history from Firestore
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const q = query(
          collection(db, 'recipes'),
          where('userId', '==', 'demo-user'),
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
      } catch (err) {
        console.error('Error loading history:', err);
      }
    };
    loadHistory();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/recipes', {
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
        // Handle both single recipe and array of recipes
        const recipeData = Array.isArray(result.data) ? result.data : [result.data];
        const recipesArray = recipeData.map((r: any) => ({
          title: r.title || r.name || 'Delicious Recipe',
          description: r.description || r.summary || '',
          ingredients: r.ingredients || [],
          instructions: r.instructions || r.steps || [],
          prepTime: r.prepTime || r.prep_time,
          cookTime: r.cookTime || r.cook_time,
          servings: r.servings,
          culturalNotes: r.culturalNotes || r.cultural_notes,
          nutritionHighlights: r.nutritionHighlights || r.nutrition_highlights || []
        }));
        setRecipes(recipesArray);

        // Save to Firestore
        try {
          await addDoc(collection(db, 'recipes'), {
            userId: 'demo-user',
            formData: formData,
            recipes: recipesArray,
            timestamp: Timestamp.now()
          });

          // Refresh history
          const q = query(
            collection(db, 'recipes'),
            where('userId', '==', 'demo-user'),
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
          console.error('Error saving to Firestore:', firestoreErr);
          // Don't show error to user, just log it
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
      {/* Top Navigation */}
      <header className="rc-nav">
        <div className="rc-nav-inner">
          <div className="rc-brand">
            <div className="rc-brand-icon">🍳</div>
            <span>Planted • Recipe AI</span>
          </div>
          <nav className="rc-nav-links" aria-label="Primary">
            <a href="/plant-care">Plant Care</a>
            <a href="/recipes" className="active">Recipes</a>
            <a href="/nutrition">Nutrition</a>
            <a href="/community">Community</a>
          </nav>
        </div>
      </header>

      {/* Main Shell */}
      <main className="rc-shell">
        {/* Left: Form */}
        <section aria-label="Recipe generation request">
          <header className="rc-hero-header">
            <div className="rc-eyebrow">
              <span>New •</span> AI-powered recipe generation
            </div>
            <h1 className="rc-title">Generate recipes tailored to your needs.</h1>
            <p className="rc-subtitle">
              Share your dietary preferences, available ingredients, and cultural tastes with Recipe AI 
              to receive personalized, culturally-respectful recipes.
            </p>
          </header>

          <article className="rc-card">
            <div className="rc-card-inner">
              <div className="rc-card-header">
                <h2>Recipe Request</h2>
                <div className="rc-tag-set">
                  <span className="rc-tag-dot"></span>
                  <span>Multiple recipes · ~20 seconds</span>
                </div>
              </div>

              <form className="rc-form-grid" onSubmit={handleSubmit}>
                <div className="rc-field rc-form-row-full">
                  <label>Dietary Requirements *</label>
                  <div className="rc-checkbox-grid">
                    {dietaryOptions.map(option => (
                      <label key={option} className="rc-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.dietaryNeeds.includes(option)}
                          onChange={() => toggleDietaryNeed(option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rc-field rc-form-row-full">
                  <label htmlFor="ingredients">Available Ingredients *</label>
                  <textarea
                    id="ingredients"
                    name="availableIngredients"
                    className="rc-textarea"
                    placeholder="e.g. Tomatoes, onions, garlic, pasta, olive oil, chickpeas"
                    value={formData.availableIngredients}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                  <small className="rc-helper-text">
                    List ingredients you have available, separated by commas
                  </small>
                </div>

                <div className="rc-field rc-form-row-full">
                  <label>Cultural Preferences</label>
                  <div className="rc-checkbox-grid">
                    {culturalOptions.map(option => (
                      <label key={option} className="rc-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.culturalPreferences.includes(option)}
                          onChange={() => toggleCulturalPreference(option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rc-field">
                  <label htmlFor="season">Seasonal Preference</label>
                  <select
                    id="season"
                    name="season"
                    className="rc-select"
                    value={formData.season}
                    onChange={handleInputChange}
                  >
                    <option value="">Select season</option>
                    {seasonOptions.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>

                <div className="rc-field rc-form-row-full">
                  <label>Pantry/Fridge Photos (Optional)</label>
                  <ImageUpload
                    onImagesChange={handleImagesChange}
                    maxImages={5}
                    helperText="Drag & drop images of your fridge or pantry. AI will identify additional ingredients."
                  />
                </div>

                {error && (
                  <div className="rc-form-row-full">
                    <div className="rc-error-message">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="rc-form-footer rc-form-row-full">
                  <div className="rc-footer-text">
                    <span>✨</span>
                    <span>
                      AI will generate <strong>culturally-appropriate recipes with nutritional guidance</strong> from your selections.
                    </span>
                  </div>
                  <button className="rc-btn-primary" type="submit" disabled={loading}>
                    <span className="icon">{loading ? '⏳' : '🍽️'}</span>
                    <span>{loading ? 'Generating...' : 'Generate Recipes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </article>
        </section>

        {/* Right: Preview + Results */}
        <aside className="rc-right-column" aria-label="Recipe results">
          <article className="rc-card">
            <div className="rc-card-inner">
              <div className="rc-preview-card-top">
                <div className="rc-hero-icon" aria-hidden="true">🥘</div>
                <div>
                  <h2 className="rc-preview-title">
                    {recipes.length > 0 ? `${recipes.length} Recipe${recipes.length > 1 ? 's' : ''} Generated` : 'Recipe Preview'}
                  </h2>
                  <p className="rc-preview-subtitle">
                    {recipes.length > 0
                      ? 'Your personalized recipes are ready!'
                      : 'Fill in your preferences to generate culturally-respectful, delicious recipes.'}
                  </p>
                </div>
              </div>

              {recipes.length > 0 ? (
                <div className="rc-recipes-container">
                  {recipes.map((recipe, index) => (
                    <div key={index} className="rc-recipe-card">
                      <div className="rc-recipe-header">
                        <h3>{recipe.title}</h3>
                        {formData.dietaryNeeds.length > 0 && (
                          <div className="rc-pill-row">
                            {formData.dietaryNeeds.slice(0, 2).map(need => (
                              <div key={need} className="rc-pill">{need}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {recipe.description && (
                        <p className="rc-recipe-description">{recipe.description}</p>
                      )}

                      {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
                        <div className="rc-recipe-meta">
                          {recipe.prepTime && <span>⏱️ Prep: {recipe.prepTime}</span>}
                          {recipe.cookTime && <span>🔥 Cook: {recipe.cookTime}</span>}
                          {recipe.servings && <span>🍽️ Serves: {recipe.servings}</span>}
                        </div>
                      )}

                      {recipe.ingredients.length > 0 && (
                        <div className="rc-recipe-section">
                          <h4>Ingredients</h4>
                          <ul className="rc-ingredients-list">
                            {recipe.ingredients.map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {recipe.instructions.length > 0 && (
                        <div className="rc-recipe-section">
                          <h4>Instructions</h4>
                          <ol className="rc-instructions-list">
                            {recipe.instructions.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {recipe.culturalNotes && (
                        <div className="rc-cultural-note">
                          <span>🌍</span>
                          <p>{recipe.culturalNotes}</p>
                        </div>
                      )}

                      {recipe.nutritionHighlights && recipe.nutritionHighlights.length > 0 && (
                        <div className="rc-nutrition-highlights">
                          <strong>Nutrition highlights:</strong>
                          <span>{recipe.nutritionHighlights.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="rc-pill-row">
                    <div className="rc-pill">Mediterranean</div>
                    <div className="rc-pill muted">Vegetarian</div>
                    <div className="rc-pill muted">30 min prep</div>
                  </div>

                  <div className="rc-preview-sample">
                    <h4>Mediterranean Chickpea Bowl</h4>
                    <p className="rc-preview-description">
                      A vibrant, protein-rich bowl featuring roasted chickpeas, fresh vegetables, 
                      and a tangy lemon-tahini dressing. Perfect for lunch or dinner.
                    </p>
                    <div className="rc-preview-meta">
                      <span>⏱️ 15 min prep</span>
                      <span>🔥 15 min cook</span>
                      <span>🍽️ Serves 4</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </article>

          <article className="rc-card rc-tips-card">
            <div className="rc-card-inner">
              <h3>💡 Recipe Tips</h3>
              <ul className="rc-tips-list">
                <li>
                  <strong>Be specific about dietary needs</strong> – AI respects religious and cultural requirements
                </li>
                <li>
                  <strong>Upload pantry photos</strong> – Vision AI can identify ingredients you might have missed
                </li>
                <li>
                  <strong>Select cultural preferences</strong> – Get authentic recipes from various cuisines
                </li>
                <li>
                  <strong>Consider seasonal ingredients</strong> – Fresher produce and better flavors
                </li>
              </ul>
            </div>
          </article>

          <article className="rc-card">
            <div className="rc-card-inner">
              <h3>Recent Recipes</h3>
              {history.length > 0 ? (
                <ul className="rc-tips-list" style={{ gap: '0.75rem' }}>
                  {history.map((item) => (
                    <li key={item.id} style={{ paddingLeft: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <strong style={{ color: 'var(--accent-dark)' }}>{item.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(item.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0' }}>
                  No recipes yet. Generate your first recipe above!
                </p>
              )}
            </div>
          </article>
        </aside>
      </main>
    </div>
  );
}
