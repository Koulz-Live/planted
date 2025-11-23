import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
import './NutritionPage.css';

interface NutritionFormData {
  householdSize: number;
  focusAreas: string[];
  timeAvailablePerDay: number;
  mealPhotoUrls: string[];
}

interface MealPrepPlan {
  day: string;
  meals: string[];
  prepTips: string[];
}

interface NutritionPlan {
  overview: string;
  plans: MealPrepPlan[];
  shoppingList: string[];
}

const focusAreaOptions = [
  'Weight Management',
  'Heart Health',
  'Diabetes Management',
  'Muscle Building',
  'Energy Boost',
  'Digestive Health',
  'Kids Nutrition',
  'Senior Nutrition'
];

export default function NutritionPage() {
  const [formData, setFormData] = useState<NutritionFormData>({
    householdSize: 1,
    focusAreas: [],
    timeAvailablePerDay: 30,
    mealPhotoUrls: []
  });

  const [loading, setLoading] = useState(false);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; householdSize: number; timestamp: Date; }>>([]);

  // Load history from Firestore
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const q = query(
          collection(db, 'nutritionPlans'),
          where('userId', '==', 'demo-user'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            householdSize: data.householdSize || 1,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'householdSize' || name === 'timeAvailablePerDay' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const toggleFocusArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({ ...prev, mealPhotoUrls: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/nutrition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          householdSize: formData.householdSize,
          focusAreas: formData.focusAreas,
          timeAvailablePerDay: formData.timeAvailablePerDay,
          mealPhotoUrls: formData.mealPhotoUrls
        })
      });

      const result = await response.json();

      if (result.ok && result.data) {
        const plan = {
          overview: result.data.overview || '',
          plans: result.data.plans || [],
          shoppingList: result.data.shoppingList || []
        };
        setNutritionPlan(plan);

        // Save to Firestore
        try {
          await addDoc(collection(db, 'nutritionPlans'), {
            userId: 'demo-user',
            householdSize: formData.householdSize,
            focusAreas: formData.focusAreas,
            formData: formData,
            nutritionPlan: plan,
            timestamp: Timestamp.now()
          });

          // Refresh history
          const q = query(
            collection(db, 'nutritionPlans'),
            where('userId', '==', 'demo-user'),
            orderBy('timestamp', 'desc'),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          const historyData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              householdSize: data.householdSize || 1,
              timestamp: data.timestamp.toDate()
            };
          });
          setHistory(historyData);
        } catch (firestoreErr) {
          console.error('Error saving to Firestore:', firestoreErr);
        }
      } else {
        setError(result.message || 'Failed to generate nutrition plan');
      }
    } catch (err) {
      setError('Network error. Please ensure the backend server is running.');
      console.error('Error generating nutrition plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nutrition-page">
      {/* Top Navigation */}
      <header className="nt-nav">
        <div className="nt-nav-inner">
          <div className="nt-brand">
            <div className="nt-brand-icon">🍎</div>
            <span>Planted</span>
          </div>
          <nav className="nt-nav-links">
            <a href="/">Home</a>
            <a href="/plant-care">Plant Care</a>
            <a href="/recipes">Recipes</a>
            <a href="/nutrition" className="active">Nutrition</a>
            <a href="/storytelling">Storytelling</a>
            <a href="/community">Community</a>
          </nav>
        </div>
      </header>

      <main className="nt-shell">
        {/* Left column: Form */}
        <section className="nt-main-column">
          <header className="nt-hero-header">
            <div className="nt-eyebrow">
              <span>🍽️</span>
              AI-Powered Meal Planning
            </div>
            <h1 className="nt-title">Nutrition Coach</h1>
            <p className="nt-subtitle">
              Get personalized meal prep plans tailored to your household size, health goals, 
              and available time. Upload meal photos for nutritional analysis.
            </p>
          </header>

          <article className="nt-card">
            <div className="nt-card-inner">
              <div className="nt-card-header">
                <h2>Plan Your Week</h2>
                <div className="nt-tag-set">
                  <div className="nt-tag-dot"></div>
                  Family-Friendly
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="nt-form-grid">
                  <div className="nt-field">
                    <label htmlFor="householdSize">Household Size *</label>
                    <input
                      id="householdSize"
                      name="householdSize"
                      type="number"
                      min="1"
                      max="20"
                      className="nt-input"
                      value={formData.householdSize}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="nt-helper-text">Number of people to cook for</span>
                  </div>

                  <div className="nt-field">
                    <label htmlFor="timeAvailablePerDay">Daily Prep Time (minutes) *</label>
                    <input
                      id="timeAvailablePerDay"
                      name="timeAvailablePerDay"
                      type="number"
                      min="10"
                      max="240"
                      className="nt-input"
                      value={formData.timeAvailablePerDay}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="nt-helper-text">Time available for meal preparation</span>
                  </div>

                  <div className="nt-field nt-form-row-full">
                    <label>Focus Areas</label>
                    <div className="nt-checkbox-grid">
                      {focusAreaOptions.map(area => (
                        <label key={area} className="nt-checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.focusAreas.includes(area)}
                            onChange={() => toggleFocusArea(area)}
                          />
                          <span>{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="nt-field nt-form-row-full">
                    <label>Current Meal Photos (Optional)</label>
                    <ImageUpload
                      onImagesChange={handleImagesChange}
                      maxImages={5}
                      helperText="Upload photos of your current meals for AI nutritional analysis and personalized recommendations."
                    />
                  </div>
                </div>

                {error && (
                  <div className="nt-error-message">
                    <span>⚠️</span>
                    {error}
                  </div>
                )}

                <div className="nt-form-footer">
                  <div className="nt-footer-text">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8"/>
                      </svg>
                    </span>
                    <strong>AI-powered</strong> meal plans in seconds
                  </div>
                  <button
                    type="submit"
                    className="nt-btn-primary"
                    disabled={loading || formData.focusAreas.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="icon">⏳</span>
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <span className="icon">🍳</span>
                        Generate Meal Plan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </article>

          {/* Results Section */}
          {nutritionPlan && (
            <article className="nt-card nt-results-card">
              <div className="nt-card-inner">
                <div className="nt-card-header">
                  <h2>Your 7-Day Meal Plan</h2>
                  <div className="nt-tag-set">
                    <div className="nt-tag-dot"></div>
                    Personalized
                  </div>
                </div>

                <div className="nt-overview">
                  <h3>Overview</h3>
                  <p>{nutritionPlan.overview}</p>
                </div>

                <div className="nt-days-grid">
                  {nutritionPlan.plans.map((dayPlan, index) => (
                    <div key={index} className="nt-day-card">
                      <h4>{dayPlan.day}</h4>
                      <div className="nt-meals-list">
                        {dayPlan.meals.map((meal, mealIndex) => (
                          <div key={mealIndex} className="nt-meal-item">
                            <span className="nt-meal-icon">🍽️</span>
                            {meal}
                          </div>
                        ))}
                      </div>
                      {dayPlan.prepTips.length > 0 && (
                        <div className="nt-prep-tips">
                          <strong>Prep Tips:</strong>
                          <ul>
                            {dayPlan.prepTips.map((tip, tipIndex) => (
                              <li key={tipIndex}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="nt-shopping-section">
                  <h3>Shopping List</h3>
                  <div className="nt-shopping-grid">
                    {nutritionPlan.shoppingList.map((item, index) => (
                      <div key={index} className="nt-shopping-item">
                        <span>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          )}
        </section>

        {/* Right column: Preview / Tips */}
        <aside className="nt-right-column">
          <article className="nt-card nt-preview-card">
            <div className="nt-card-inner">
              <div className="nt-hero-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>
                </svg>
              </div>
              <div className="nt-preview-card-top">
                <div>
                  <h3 className="nt-preview-title">Weekly Meal Planning</h3>
                  <p className="nt-preview-subtitle">
                    AI-powered nutrition advice tailored to your family's needs, schedule, and health goals.
                  </p>
                </div>
              </div>

              {nutritionPlan ? (
                <div className="nt-pill-row">
                  <div className="nt-pill">{formData.householdSize} people</div>
                  <div className="nt-pill muted">{formData.timeAvailablePerDay} min/day</div>
                  <div className="nt-pill muted">{nutritionPlan.plans.length} days</div>
                </div>
              ) : (
                <>
                  <div className="nt-pill-row">
                    <div className="nt-pill">Family-sized</div>
                    <div className="nt-pill muted">Heart healthy</div>
                    <div className="nt-pill muted">30 min prep</div>
                  </div>

                  <div className="nt-preview-sample">
                    <h4>Example: Monday</h4>
                    <p className="nt-preview-description">
                      Breakfast: Overnight oats with berries<br />
                      Lunch: Mediterranean chickpea salad<br />
                      Dinner: Baked salmon with roasted vegetables
                    </p>
                  </div>
                </>
              )}
            </div>
          </article>

          <article className="nt-card nt-tips-card">
            <div className="nt-card-inner">
              <h3>💡 Nutrition Tips</h3>
              <ul className="nt-tips-list">
                <li>
                  <strong>Batch cooking saves time</strong> – Prepare multiple meals at once for the week
                </li>
                <li>
                  <strong>Upload meal photos</strong> – AI analyzes nutrition and suggests improvements
                </li>
                <li>
                  <strong>Select focus areas</strong> – Get plans tailored to your health goals
                </li>
                <li>
                  <strong>Plan for leftovers</strong> – Reduce waste and simplify meal prep
                </li>
              </ul>
            </div>
          </article>

          <article className="nt-card">
            <div className="nt-card-inner">
              <h3>Recent Plans</h3>
              {history.length > 0 ? (
                <ul className="nt-tips-list" style={{ gap: '0.75rem' }}>
                  {history.map((item) => (
                    <li key={item.id} style={{ paddingLeft: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <strong style={{ color: 'var(--accent-dark)' }}>
                          {item.householdSize} {item.householdSize === 1 ? 'person' : 'people'}
                        </strong>
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
                  No plans yet. Generate your first meal plan above!
                </p>
              )}
            </div>
          </article>
        </aside>
      </main>
    </div>
  );
}
