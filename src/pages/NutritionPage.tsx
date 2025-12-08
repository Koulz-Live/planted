import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
import { Icon, type IconName } from '../components/Icon';
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

type CardOption = {
  value: string;
  icon: IconName;
};

const focusAreaOptions: CardOption[] = [
  { value: 'Weight Management', icon: 'speedometer' },
  { value: 'Heart Health', icon: 'heartPulse' },
  { value: 'Diabetes Management', icon: 'droplet' },
  { value: 'Muscle Building', icon: 'lightning' },
  { value: 'Energy Boost', icon: 'lightbulbFill' },
  { value: 'Digestive Health', icon: 'hotDrinkFill' },
  { value: 'Kids Nutrition', icon: 'personBadge' },
  { value: 'Senior Nutrition', icon: 'personLines' }
];

const toOptionId = (prefix: string, label: string) =>
  `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/-+/g, '-').replace(/^-|-$/g, '');

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
      {/* Hero Section */}
      <div 
        className="p-4 p-md-5 mb-4 rounded text-body-emphasis" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic text-white">
            <Icon name="dish" className="icon-inline me-2" />
            Nutrition AI
          </h1>
          <p className="lead my-3 text-white">
            Get personalized meal prep plans tailored to your household size, health goals, 
            and available time. Upload meal photos for AI nutritional analysis and expert recommendations.
          </p>
          <p className="lead mb-0">
            <span className="text-white fw-bold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Start planning below →</span>
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-5">
        {/* Left Column: Form */}
        <div className="col-md-8">
          <h3 className="pb-4 mb-4 fst-italic border-bottom">
            Meal Plan Request
          </h3>

          <article className="blog-post">
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="badge bg-primary">7-day meal plan</span>
                  <span className="text-body-secondary ms-2">~15 seconds</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="householdSize" className="form-label fw-bold">Household Size *</label>
                    <input
                      id="householdSize"
                      name="householdSize"
                      type="number"
                      min="1"
                      max="20"
                      className="form-control"
                      value={formData.householdSize}
                      onChange={handleInputChange}
                      required
                    />
                    <small className="form-text text-body-secondary">Number of people to cook for</small>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="timeAvailablePerDay" className="form-label fw-bold">Daily Prep Time (minutes) *</label>
                    <input
                      id="timeAvailablePerDay"
                      name="timeAvailablePerDay"
                      type="number"
                      min="10"
                      max="240"
                      className="form-control"
                      value={formData.timeAvailablePerDay}
                      onChange={handleInputChange}
                      required
                    />
                    <small className="form-text text-body-secondary">Time available for meal preparation</small>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Focus Areas *</label>
                  <div
                    className="card-checkbox-grid nt-checkbox-grid"
                    role="group"
                    aria-label="Focus areas for meal planning"
                  >
                    {focusAreaOptions.map(option => {
                      const optionId = toOptionId('focus', option.value);
                      const isChecked = formData.focusAreas.includes(option.value);
                      return (
                        <div key={option.value} className="card-checkbox-item nt-checkbox-item">
                          <input
                            className="card-checkbox-input"
                            type="checkbox"
                            id={optionId}
                            checked={isChecked}
                            onChange={() => toggleFocusArea(option.value)}
                          />
                          <label className={`card-checkbox nt-checkbox-card${isChecked ? ' checked' : ''}`} htmlFor={optionId}>
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

                <div className="mb-4">
                  <label className="form-label fw-bold">Current Meal Photos (Optional)</label>
                  <ImageUpload
                    onImagesChange={handleImagesChange}
                    maxImages={5}
                    helperText="Upload photos of your current meals for AI nutritional analysis and personalized recommendations."
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
                    AI will generate a <strong>personalized 7-day meal plan with shopping list</strong> from your inputs.
                  </div>
                  <button className="btn btn-primary btn-lg" type="submit" disabled={loading || formData.focusAreas.length === 0}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5"/>
                        </svg>
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
            <article className="blog-post mt-4">
              <div className="p-4 mb-3 bg-body-tertiary rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h4 mb-0">Your 7-Day Meal Plan</h2>
                  <span className="badge bg-success">Personalized</span>
                </div>

                <div className="mb-4">
                  <h3 className="h5 mb-2">Overview</h3>
                  <p className="text-body-secondary">{nutritionPlan.overview}</p>
                </div>

                <div className="row g-3 mb-4">
                  {nutritionPlan.plans.map((dayPlan, index) => (
                    <div key={index} className="col-12">
                      <div className="p-3 bg-body rounded border">
                        <h4 className="h6 mb-2 text-primary">{dayPlan.day}</h4>
                        <div className="mb-2">
                          {dayPlan.meals.map((meal, mealIndex) => (
                            <div key={mealIndex} className="d-flex align-items-start mb-1">
                              <Icon name="dish" className="icon-inline me-2 mt-1" aria-hidden />
                              <span className="small">{meal}</span>
                            </div>
                          ))}
                        </div>
                        {dayPlan.prepTips.length > 0 && (
                          <div className="mt-2 pt-2 border-top">
                            <strong className="small">Prep Tips:</strong>
                            <ul className="small mb-0 ps-3 mt-1">
                              {dayPlan.prepTips.map((tip, tipIndex) => (
                                <li key={tipIndex}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="h5 mb-3">Shopping List</h3>
                  <div className="row g-2">
                    {nutritionPlan.shoppingList.map((item, index) => (
                      <div key={index} className="col-6 col-md-4">
                        <div className="d-flex align-items-center small">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-success me-2" viewBox="0 0 16 16">
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                          </svg>
                          {item}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="col-md-4">
          <div className="position-sticky" style={{ top: '2rem' }}>
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <div className="d-flex align-items-center mb-3">
                <Icon name="calendar" className="icon-inline" style={{ fontSize: '2rem' }} aria-hidden />
                <div className="ms-3">
                  <h4 className="fst-italic mb-0">
                    {nutritionPlan ? 'Meal Plan Ready' : 'Meal Plan Preview'}
                  </h4>
                </div>
              </div>
              <p className="mb-0 text-body-secondary">
                {nutritionPlan
                  ? 'Your personalized 7-day meal plan is ready!'
                  : 'Fill in your household details to generate a customized weekly meal plan.'}
              </p>
            </div>

            {nutritionPlan ? (
              <div className="p-4 mb-3 bg-body-tertiary rounded">
                <h4 className="fst-italic mb-3">Plan Summary</h4>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-primary">{formData.householdSize} {formData.householdSize === 1 ? 'person' : 'people'}</span>
                  <span className="badge bg-secondary">{formData.timeAvailablePerDay} min/day</span>
                  <span className="badge bg-success">{nutritionPlan.plans.length} days</span>
                </div>
              </div>
            ) : (
              <div className="p-4 mb-3 bg-body-tertiary rounded">
                <h4 className="fst-italic mb-3">Example Day</h4>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-primary">Family-sized</span>
                  <span className="badge bg-secondary">Heart healthy</span>
                  <span className="badge bg-info">30 min prep</span>
                </div>
                <div className="small">
                  <p className="mb-2"><strong>Monday Sample:</strong></p>
                  <p className="mb-1 text-body-secondary">
                    <Icon name="sunrise" className="icon-inline me-2" />
                    Breakfast: Overnight oats with berries
                  </p>
                  <p className="mb-1 text-body-secondary">
                    <Icon name="sun" className="icon-inline me-2" />
                    Lunch: Mediterranean chickpea salad
                  </p>
                  <p className="mb-0 text-body-secondary">
                    <Icon name="moonStars" className="icon-inline me-2" />
                    Dinner: Baked salmon with roasted vegetables
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h4 className="fst-italic mb-3">
                <Icon name="lightbulb" className="icon-inline me-2" />
                Nutrition Tips
              </h4>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <strong>Batch cooking saves time</strong> – Prepare multiple meals at once for the week
                </li>
                <li className="mb-2">
                  <strong>Upload meal photos</strong> – AI analyzes nutrition and suggests improvements
                </li>
                <li className="mb-2">
                  <strong>Select focus areas</strong> – Get plans tailored to your health goals
                </li>
                <li className="mb-2">
                  <strong>Plan for leftovers</strong> – Reduce waste and simplify meal prep
                </li>
              </ul>
            </div>

            <div className="p-4 bg-body-tertiary rounded">
              <h4 className="fst-italic mb-3">Recent Plans</h4>
              {history.length > 0 ? (
                <ul className="list-unstyled border-top">
                  {history.map((item) => (
                    <li key={item.id} className="border-bottom py-2">
                      <div className="d-flex flex-column">
                        <strong className="text-primary">
                          {item.householdSize} {item.householdSize === 1 ? 'person' : 'people'}
                        </strong>
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
                  No plans yet. Generate your first meal plan above!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
