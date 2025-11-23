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
            <div className="pc-brand-icon">🌿</div>
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
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="pc-form-footer pc-form-row-full">
                  <div className="pc-footer-text">
                    <span>✨</span>
                    <span>AI will generate a <strong>care plan, schedule, and soil-health tips</strong> from this form.</span>
                  </div>
                  <button className="pc-btn-primary" type="submit" disabled={loading}>
                    <span className="icon">{loading ? '⏳' : '🌱'}</span>
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
                        <h3>💧 Watering Schedule</h3>
                        <p>{carePlan.wateringSchedule}</p>
                      </div>
                    )}

                    {carePlan.soilTips && (
                      <div className="pc-care-section">
                        <h3>🌱 Soil Health</h3>
                        <p>{carePlan.soilTips}</p>
                      </div>
                    )}

                    {carePlan.sunlight && (
                      <div className="pc-care-section">
                        <h3>☀️ Sunlight</h3>
                        <p>{carePlan.sunlight}</p>
                      </div>
                    )}

                    {carePlan.warnings && carePlan.warnings.length > 0 && (
                      <div className="pc-preview-alert">
                        <span>⚠️</span>
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
