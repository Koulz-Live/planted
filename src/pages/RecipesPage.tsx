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
            <div className="rc-brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>
                <path d="M11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </div>
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
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                        </svg>
                      </span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="rc-form-footer rc-form-row-full">
                  <div className="rc-footer-text">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8"/>
                      </svg>
                    </span>
                    <span>
                      AI will generate <strong>culturally-appropriate recipes with nutritional guidance</strong> from your selections.
                    </span>
                  </div>
                  <button className="rc-btn-primary" type="submit" disabled={loading}>
                    <span className="icon">
                      {loading ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                      )}
                    </span>
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
                          {recipe.prepTime && (
                            <span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                              </svg>
                              Prep: {recipe.prepTime}
                            </span>
                          )}
                          {recipe.cookTime && (
                            <span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/>
                              </svg>
                              Cook: {recipe.cookTime}
                            </span>
                          )}
                          {recipe.servings && (
                            <span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                              </svg>
                              Serves: {recipe.servings}
                            </span>
                          )}
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
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855q-.215.403-.395.872c.705.157 1.472.257 2.282.287zM4.249 3.539q.214-.577.481-1.078a7 7 0 0 1 .597-.933A7 7 0 0 0 3.051 3.05q.544.277 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9 9 0 0 1-1.565-.667A6.96 6.96 0 0 0 1.018 7.5zm1.4-2.741a12.3 12.3 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332M8.5 5.09V7.5h2.99a12.3 12.3 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.6 13.6 0 0 1 7.5 10.91V8.5zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741zm-3.282 3.696q.18.469.395.872c.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a7 7 0 0 1-.598-.933 9 9 0 0 1-.481-1.079 8.4 8.4 0 0 0-1.198.49 7 7 0 0 0 2.276 1.522zm-1.383-2.964A13.4 13.4 0 0 1 3.508 8.5h-2.49a6.96 6.96 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667m6.728 2.964a7 7 0 0 0 2.275-1.521 8.4 8.4 0 0 0-1.197-.49 9 9 0 0 1-.481 1.078 7 7 0 0 1-.597.933M8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855q.216-.403.395-.872A12.6 12.6 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.96 6.96 0 0 0 14.982 8.5h-2.49a13.4 13.4 0 0 1-.437 3.008M14.982 7.5a6.96 6.96 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008zM11.27 2.461q.266.502.482 1.078a8.4 8.4 0 0 0 1.196-.49 7 7 0 0 0-2.275-1.52c.218.283.418.597.597.932m-.488 1.343a8 8 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z"/>
                            </svg>
                          </span>
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
