import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
import './PlantCarePage.css';

type GrowthStage = 'seedling' | 'vegetative' | 'fruiting' | 'dormant';

interface PlantCareFormData {
  plantName: string;
  growthStage: GrowthStage;
  country: string;
  hardinessZone?: string;
  rainfallPattern?: string;
  avgTempC?: number;
  biodiversityConcerns: string;
  photoUrls: string[];
}

interface PlantCarePlan {
  title: string;
  summary: string;
  wateringSchedule: string;
  soilTips: string;
  sunlight: string;
  warnings?: string[];
  nextSteps: string[];
}

export default function PlantCarePage() {
  const [formData, setFormData] = useState<PlantCareFormData>({
    plantName: '',
    growthStage: 'seedling',
    country: '',
    hardinessZone: '',
    rainfallPattern: '',
    avgTempC: undefined,
    biodiversityConcerns: '',
    photoUrls: []
  });

  const [loading, setLoading] = useState(false);
  const [carePlan, setCarePlan] = useState<PlantCarePlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; plantName: string; timestamp: Date; }>>([]);

  // Load history from Firestore
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const q = query(
          collection(db, 'plantCares'),
          where('userId', '==', 'demo-user'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          plantName: doc.data().plantName,
          timestamp: doc.data().timestamp.toDate()
        }));
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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'avgTempC' ? (value ? parseFloat(value) : undefined) : value
    }));
  };

  const handleGrowthStageChange = (stage: GrowthStage) => {
    setFormData(prev => ({ ...prev, growthStage: stage }));
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({ ...prev, photoUrls: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/plant-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          plantName: formData.plantName,
          growthStage: formData.growthStage,
          climate: {
            country: formData.country,
            hardinessZone: formData.hardinessZone,
            rainfallPattern: formData.rainfallPattern,
            avgTempC: formData.avgTempC
          },
          biodiversityConcerns: formData.biodiversityConcerns
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          observations: formData.photoUrls.map(url => ({ photoUrl: url }))
        })
      });

      const result = await response.json();

      if (result.ok && result.data) {
        const plan = {
          title: result.data.title || `${formData.plantName} Care Plan`,
          summary: result.data.summary || result.data.text || '',
          wateringSchedule: result.data.wateringSchedule || '',
          soilTips: result.data.soilTips || '',
          sunlight: result.data.sunlight || '',
          warnings: result.data.warnings || [],
          nextSteps: result.data.nextSteps || []
        };
        setCarePlan(plan);

        // Save to Firestore
        try {
          await addDoc(collection(db, 'plantCares'), {
            userId: 'demo-user',
            plantName: formData.plantName,
            growthStage: formData.growthStage,
            country: formData.country,
            formData: formData,
            carePlan: plan,
            timestamp: Timestamp.now()
          });

          // Refresh history
          const q = query(
            collection(db, 'plantCares'),
            where('userId', '==', 'demo-user'),
            orderBy('timestamp', 'desc'),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          const historyData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            plantName: doc.data().plantName,
            timestamp: doc.data().timestamp.toDate()
          }));
          setHistory(historyData);
        } catch (firestoreErr) {
          console.error('Error saving to Firestore:', firestoreErr);
          // Don't show error to user, just log it
        }
      } else {
        setError(result.message || 'Failed to generate care plan');
      }
    } catch (err) {
      setError('Network error. Please ensure the backend server is running.');
      console.error('Error generating care plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plant-care-page">
      {/* Top Navigation */}
      <header className="pc-nav">
        <div className="pc-nav-inner">
          <div className="pc-brand">
            <div className="pc-brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5v1a1.5 1.5 0 0 1-3 0V8a.5.5 0 0 1 1 0v1a.5.5 0 0 0 1 0V8a1.5 1.5 0 0 0-3 0v1a2.5 2.5 0 0 0 5 0V8a3.5 3.5 0 1 0-7 0v5.5a.5.5 0 0 1-1 0V8a4.5 4.5 0 1 1 9 0v5.5a.5.5 0 0 1-1 0V8a3.5 3.5 0 0 0-7 0v1a1.5 1.5 0 0 0 3 0V8a.5.5 0 0 0-1 0z"/>
              </svg>
            </div>
            <span>Planted • Plant Care AI</span>
          </div>
          <nav className="pc-nav-links" aria-label="Primary">
            <a href="/plant-care" className="active">Plant Care</a>
            <a href="/recipes">Recipes</a>
            <a href="/nutrition">Nutrition</a>
            <a href="/community">Community</a>
          </nav>
        </div>
      </header>

      {/* Main Shell */}
      <main className="pc-shell">
        {/* Left: Form */}
        <section aria-label="Plant care request">
          <header className="pc-hero-header">
            <div className="pc-eyebrow">
              <span>New •</span> Regenerative care plan
            </div>
            <h1 className="pc-title">Generate a personalized care plan for your plant.</h1>
            <p className="pc-subtitle">
              Share a few details with Plant Care AI and receive a step-by-step, climate-aware plan
              to help your plant thrive.
            </p>
          </header>

          <article className="pc-card">
            <div className="pc-card-inner">
              <div className="pc-card-header">
                <h2>Plant Care Request</h2>
                <div className="pc-tag-set">
                  <span className="pc-tag-dot"></span>
                  <span>Single plant · ~15 seconds</span>
                </div>
              </div>

              <form className="pc-form-grid" onSubmit={handleSubmit}>
                <div className="pc-field pc-form-row-full">
                  <label htmlFor="plant-name">Plant Name *</label>
                  <input
                    id="plant-name"
                    name="plantName"
                    className="pc-input"
                    type="text"
                    placeholder="e.g. Monstera, Basil, Tomato Vine"
                    value={formData.plantName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="pc-field pc-form-row-full">
                  <label>Growth Stage *</label>
                  <div className="pc-chip-group" role="radiogroup" aria-label="Growth stage">
                    {(['seedling', 'vegetative', 'fruiting', 'dormant'] as GrowthStage[]).map(stage => (
                      <button
                        key={stage}
                        type="button"
                        className={`pc-chip ${formData.growthStage === stage ? 'active' : ''}`}
                        onClick={() => handleGrowthStageChange(stage)}
                      >
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pc-field">
                  <label htmlFor="country">Country *</label>
                  <select
                    id="country"
                    name="country"
                    className="pc-select"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select country</option>
                    <option>South Africa</option>
                    <option>Kenya</option>
                    <option>Brazil</option>
                    <option>Israel</option>
                    <option>USA</option>
                    <option>United Kingdom</option>
                    <option>India</option>
                    <option>Australia</option>
                  </select>
                </div>

                <div className="pc-field">
                  <label htmlFor="zone">Hardiness Zone</label>
                  <input
                    id="zone"
                    name="hardinessZone"
                    className="pc-input"
                    type="text"
                    placeholder="e.g. 9b, 10a"
                    value={formData.hardinessZone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="pc-field">
                  <label htmlFor="rain">Rainfall Pattern</label>
                  <select
                    id="rain"
                    name="rainfallPattern"
                    className="pc-select"
                    value={formData.rainfallPattern}
                    onChange={handleInputChange}
                  >
                    <option value="">Select rainfall pattern</option>
                    <option>Summer rainfall</option>
                    <option>Winter rainfall</option>
                    <option>Year-round</option>
                    <option>Arid / low rainfall</option>
                  </select>
                </div>

                <div className="pc-field">
                  <label htmlFor="temp">Average Temperature (°C)</label>
                  <input
                    id="temp"
                    name="avgTempC"
                    className="pc-input"
                    type="number"
                    placeholder="e.g. 24"
                    value={formData.avgTempC || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="pc-field pc-form-row-full">
                  <label htmlFor="biodiversity">Biodiversity Concerns</label>
                  <textarea
                    id="biodiversity"
                    name="biodiversityConcerns"
                    className="pc-textarea"
                    placeholder="e.g. Aphids on new growth, compacted soil, low pollinators"
                    value={formData.biodiversityConcerns}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="pc-field pc-form-row-full">
                  <label>Observations & Photos (Optional)</label>
                  <ImageUpload
                    onImagesChange={handleImagesChange}
                    maxImages={5}
                    helperText="Drag & drop images here, or browse files. Add close-ups of leaves, stems, or any problem areas."
                  />
                </div>

                {error && (
                  <div className="pc-form-row-full">
                    <div className="pc-error-message">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                        </svg>
                      </span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="pc-form-footer pc-form-row-full">
                  <div className="pc-footer-text">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8"/>
                      </svg>
                    </span>
                    <span>AI will generate a <strong>care plan, schedule, and soil-health tips</strong> from this form.</span>
                  </div>
                  <button className="pc-btn-primary" type="submit" disabled={loading}>
                    <span className="icon">
                      {loading ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5v1a1.5 1.5 0 0 1-3 0V8a.5.5 0 0 1 1 0v1a.5.5 0 0 0 1 0V8a1.5 1.5 0 0 0-3 0v1a2.5 2.5 0 0 0 5 0V8a3.5 3.5 0 1 0-7 0v5.5a.5.5 0 0 1-1 0V8a4.5 4.5 0 1 1 9 0v5.5a.5.5 0 0 1-1 0V8a3.5 3.5 0 0 0-7 0v1a1.5 1.5 0 0 0 3 0V8a.5.5 0 0 0-1 0z"/>
                        </svg>
                      )}
                    </span>
                    <span>{loading ? 'Generating...' : 'Generate Care Plan'}</span>
                  </button>
                </div>
              </form>
            </div>
          </article>
        </section>

        {/* Right: Preview + Results */}
        <aside className="pc-right-column" aria-label="AI preview and results">
          <article className="pc-card">
            <div className="pc-card-inner">
              <div className="pc-preview-card-top">
                <div className="pc-hero-plant" aria-hidden="true">🪴</div>
                <div>
                  <h2 className="pc-preview-title">
                    {carePlan ? 'Your Care Plan' : 'Live AI Preview'}
                  </h2>
                  <p className="pc-preview-subtitle">
                    {carePlan
                      ? 'Generated care plan for your plant'
                      : 'As you fill in the form, Plant Care AI drafts a regenerative plan in real time.'}
                  </p>
                </div>
              </div>

              {carePlan ? (
                <>
                  <div className="pc-pill-row">
                    <div className="pc-pill">{formData.plantName}</div>
                    <div className="pc-pill muted">{formData.growthStage} · {formData.country}</div>
                  </div>

                  <div className="pc-care-plan">
                    <p className="pc-preview-subtitle">{carePlan.summary}</p>

                    {carePlan.wateringSchedule && (
                      <div className="pc-care-section">
                        <h3>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                            <path d="M8 16a6 6 0 0 0 6-6c0-1.655-1.122-2.904-2.432-4.362C10.254 4.176 8.75 2.503 8 0c0 0-6 5.686-6 10a6 6 0 0 0 6 6M6.646 4.646l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448c.82-1.641 1.717-2.753 2.093-3.13"/>
                          </svg>
                          Watering Schedule
                        </h3>
                        <p>{carePlan.wateringSchedule}</p>
                      </div>
                    )}

                    {carePlan.soilTips && (
                      <div className="pc-care-section">
                        <h3>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                            <path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5v1a1.5 1.5 0 0 1-3 0V8a.5.5 0 0 1 1 0v1a.5.5 0 0 0 1 0V8a1.5 1.5 0 0 0-3 0v1a2.5 2.5 0 0 0 5 0V8a3.5 3.5 0 1 0-7 0v5.5a.5.5 0 0 1-1 0V8a4.5 4.5 0 1 1 9 0v5.5a.5.5 0 0 1-1 0V8a3.5 3.5 0 0 0-7 0v1a1.5 1.5 0 0 0 3 0V8a.5.5 0 0 0-1 0z"/>
                          </svg>
                          Soil Health
                        </h3>
                        <p>{carePlan.soilTips}</p>
                      </div>
                    )}

                    {carePlan.sunlight && (
                      <div className="pc-care-section">
                        <h3>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                            <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                          </svg>
                          Sunlight
                        </h3>
                        <p>{carePlan.sunlight}</p>
                      </div>
                    )}

                    {carePlan.warnings && carePlan.warnings.length > 0 && (
                      <div className="pc-preview-alert">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                          </svg>
                        </span>
                        <div>
                          {carePlan.warnings.map((warning, i) => (
                            <p key={i}>{warning}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {carePlan.nextSteps && carePlan.nextSteps.length > 0 && (
                      <div className="pc-care-section">
                        <h3>📋 Next Steps</h3>
                        <ul>
                          {carePlan.nextSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="pc-pill-row">
                    <div className="pc-pill">Monstera deliciosa</div>
                    <div className="pc-pill muted">Vegetative · Indoor</div>
                    <div className="pc-pill muted">Bright, filtered light</div>
                  </div>

                  <p className="pc-preview-subtitle">
                    "Water deeply every 7–10 days, allowing the top 3 cm of soil to dry. Add
                    a diluted organic feed every second watering. Rotate the pot weekly to
                    encourage even leaf growth."
                  </p>

                  <div className="pc-mini-chart">
                    <span>
                      <strong>Care difficulty</strong>
                      Beginner-friendly
                    </span>
                    <span>
                      <strong>Risk level</strong>
                      Low · indoors
                    </span>
                  </div>
                </>
              )}
            </div>
          </article>

          <article className="pc-card pc-history-card">
            <div className="pc-card-inner">
              <h3>Recent care plans</h3>
              {history.length > 0 ? (
                <ul className="pc-history-list">
                  {history.map((item) => (
                    <li key={item.id} className="pc-history-item">
                      <div className="pc-history-main">
                        <strong>{item.plantName}</strong>
                        <span>
                          {new Date(item.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className="pc-history-badge">Saved</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0' }}>
                  No care plans yet. Generate your first plan above!
                </p>
              )}
            </div>
          </article>
        </aside>
      </main>
    </div>
  );
}
