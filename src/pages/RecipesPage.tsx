import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
import { CardSlider } from '../components/CardSlider';
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
      {/* Hero Section */}
      <div className="p-4 p-md-5 mb-4 rounded text-body-emphasis bg-body-secondary">
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic">🍽️ Recipe AI</h1>
          <p className="lead my-3">
            Share your dietary preferences, available ingredients, and cultural tastes to receive 
            personalized, culturally-respectful recipes powered by AI. From pantry staples to gourmet creations.
          </p>
          <p className="lead mb-0">
            <span className="text-body-emphasis fw-bold">Start creating below →</span>
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-5">
        {/* Left Column: Form */}
        <div className="col-md-8">
          <h3 className="pb-4 mb-4 fst-italic border-bottom">
            Recipe Request
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
                  <div className="row g-2">
                    {dietaryOptions.map(option => (
                      <div key={option} className="col-6 col-md-4 col-lg-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`dietary-${option}`}
                            checked={formData.dietaryNeeds.includes(option)}
                            onChange={() => toggleDietaryNeed(option)}
                          />
                          <label className="form-check-label" htmlFor={`dietary-${option}`}>
                            {option}
                          </label>
                        </div>
                      </div>
                    ))}
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
                  <div className="row g-2">
                    {culturalOptions.map(option => (
                      <div key={option} className="col-6 col-md-4 col-lg-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`cultural-${option}`}
                            checked={formData.culturalPreferences.includes(option)}
                            onChange={() => toggleCulturalPreference(option)}
                          />
                          <label className="form-check-label" htmlFor={`cultural-${option}`}>
                            {option}
                          </label>
                        </div>
                      </div>
                    ))}
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

                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                    </svg>
                    <div>{error}</div>
                  </div>
                )}

                <div className="d-flex flex-column gap-3">
                  <div className="text-body-secondary small">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8"/>
                    </svg>
                    AI will generate <strong>culturally-appropriate recipes with nutritional guidance</strong> from your selections.
                  </div>
                  <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                        Generate Recipes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </article>

          {/* Additional Info Cards - No longer needed, moved to sidebar */}
        </div>

        {/* Right Column: Sidebar */}
        <div className="col-md-4">
          <div className="position-sticky" style={{ top: '2rem' }}>
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <div className="d-flex align-items-center mb-3">
                <span style={{ fontSize: '2rem' }} aria-hidden="true">🥘</span>
                <div className="ms-3">
                  <h4 className="fst-italic mb-0">
                    {recipes.length > 0 ? `${recipes.length} Recipe${recipes.length > 1 ? 's' : ''} Generated` : 'Recipe Preview'}
                  </h4>
                </div>
              </div>
              <p className="mb-0 text-body-secondary">
                {recipes.length > 0
                  ? 'Your personalized recipes are ready!'
                  : 'Fill in your preferences to generate culturally-respectful, delicious recipes.'}
              </p>
            </div>

            <div>
              {recipes.length > 0 ? (
                <>
                  {/* Desktop: Traditional stacked layout */}
                  <div className="rc-recipes-container rc-recipes-desktop">
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

                  {/* Mobile: Swipeable carousel */}
                  <div className="rc-recipes-mobile">
                    <CardSlider showIndicators>
                      {recipes.map((recipe, index) => (
                        <div key={index} className="rc-recipe-card rc-recipe-slide">
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
                    </CardSlider>
                  </div>
                </>
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

            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h4 className="fst-italic mb-3">💡 Recipe Tips</h4>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <strong>Be specific about dietary needs</strong> – AI respects religious and cultural requirements
                </li>
                <li className="mb-2">
                  <strong>Upload pantry photos</strong> – Vision AI can identify ingredients you might have missed
                </li>
                <li className="mb-2">
                  <strong>Select cultural preferences</strong> – Get authentic recipes from various cuisines
                </li>
                <li className="mb-2">
                  <strong>Consider seasonal ingredients</strong> – Fresher produce and better flavors
                </li>
              </ul>
            </div>

            <div className="p-4 bg-body-tertiary rounded">
              <h4 className="fst-italic mb-3">Recent Recipes</h4>
              {history.length > 0 ? (
                <ul className="list-unstyled border-top">
                  {history.map((item) => (
                    <li key={item.id} className="border-bottom py-2">
                      <div className="d-flex flex-column">
                        <strong className="text-primary">{item.title}</strong>
                        <small className="text-body-secondary">
                          {new Date(item.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-secondary mb-0">
                  No recipes yet. Generate your first recipe above!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
