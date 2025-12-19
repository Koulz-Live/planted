import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
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
          collection(getDb(), 'plantCares'),
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
      const response = await fetch('/api/ai/plant-plan', {
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
          await addDoc(collection(getDb(), 'plantCares'), {
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
            collection(getDb(), 'plantCares'),
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
      {/* Hero Section */}
      <div 
        className="p-4 p-md-5 mb-4 rounded text-body-emphasis" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/1022922/pexels-photo-1022922.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic text-white">🌱 Plant Care AI</h1>
          <p className="lead my-3 text-white">
            Share a few details about your plant and receive a personalized, climate-aware care plan 
            with watering schedules, soil health tips, and regenerative growing practices tailored to your location.
          </p>
          <p className="lead mb-0">
            <span className="text-white fw-bold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Get started below →</span>
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-5">
        {/* Left Column: Form */}
        <div className="col-md-8">
          <h3 className="pb-4 mb-4 fst-italic border-bottom">
            Plant Care Request
          </h3>

          <article className="blog-post">
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="badge bg-primary">Single plant</span>
                  <span className="text-body-secondary ms-2">~15 seconds</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="plant-name" className="form-label fw-bold">Plant Name *</label>
                  <input
                    id="plant-name"
                    name="plantName"
                    className="form-control"
                    type="text"
                    placeholder="e.g. Monstera, Basil, Tomato Vine"
                    value={formData.plantName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Growth Stage *</label>
                  <div className="btn-group d-flex" role="group" aria-label="Growth stage">
                    {(['seedling', 'vegetative', 'fruiting', 'dormant'] as GrowthStage[]).map(stage => (
                      <button
                        key={stage}
                        type="button"
                        className={`btn ${formData.growthStage === stage ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => handleGrowthStageChange(stage)}
                      >
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="country" className="form-label fw-bold">Country *</label>
                    <select
                      id="country"
                      name="country"
                      className="form-select"
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

                  <div className="col-md-6 mb-3">
                    <label htmlFor="zone" className="form-label fw-bold">Hardiness Zone</label>
                    <input
                      id="zone"
                      name="hardinessZone"
                      className="form-control"
                      type="text"
                      placeholder="e.g. 9b, 10a"
                      value={formData.hardinessZone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="rain" className="form-label fw-bold">Rainfall Pattern</label>
                    <select
                      id="rain"
                      name="rainfallPattern"
                      className="form-select"
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

                  <div className="col-md-6 mb-3">
                    <label htmlFor="temp" className="form-label fw-bold">Average Temperature (°C)</label>
                    <input
                      id="temp"
                      name="avgTempC"
                      className="form-control"
                      type="number"
                      placeholder="e.g. 24"
                      value={formData.avgTempC || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="biodiversity" className="form-label fw-bold">Biodiversity Concerns</label>
                  <textarea
                    id="biodiversity"
                    name="biodiversityConcerns"
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Aphids on new growth, compacted soil, low pollinators"
                    value={formData.biodiversityConcerns}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Observations & Photos (Optional)</label>
                  <ImageUpload
                    onImagesChange={handleImagesChange}
                    maxImages={5}
                    helperText="Drag & drop images here, or browse files. Add close-ups of leaves, stems, or any problem areas."
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
                    AI will generate a <strong>care plan, schedule, and soil-health tips</strong> from this form.
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
                          <path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5v1a1.5 1.5 0 0 1-3 0V8a.5.5 0 0 1 1 0v1a.5.5 0 0 0 1 0V8a1.5 1.5 0 0 0-3 0v1a2.5 2.5 0 0 0 5 0V8a3.5 3.5 0 1 0-7 0v5.5a.5.5 0 0 1-1 0V8a4.5 4.5 0 1 1 9 0v5.5a.5.5 0 0 1-1 0V8a3.5 3.5 0 0 0-7 0v1a1.5 1.5 0 0 0 3 0V8a.5.5 0 0 0-1 0z"/>
                        </svg>
                        Generate Care Plan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </article>
        </div>

        {/* Right Column: Sidebar */}
        <div className="col-md-4">
          <div className="position-sticky" style={{ top: '2rem' }}>
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <div className="d-flex align-items-center mb-3">
                <span style={{ fontSize: '2rem' }} aria-hidden="true">🪴</span>
                <div className="ms-3">
                  <h4 className="fst-italic mb-0">
                    {carePlan ? 'Your Care Plan' : 'Live AI Preview'}
                  </h4>
                </div>
              </div>
              <p className="mb-0 text-body-secondary">
                {carePlan
                  ? 'Generated care plan for your plant'
                  : 'As you fill in the form, Plant Care AI drafts a regenerative plan in real time.'}
              </p>
            </div>

            {carePlan ? (
              <div className="p-4 mb-3 bg-body-tertiary rounded">
                <div className="mb-3">
                  <span className="badge bg-success me-2">{formData.plantName}</span>
                  <span className="badge bg-secondary">{formData.growthStage} · {formData.country}</span>
                </div>

                <div>
                  <p className="text-body-secondary">{carePlan.summary}</p>

                  {carePlan.wateringSchedule && (
                    <div className="mb-3">
                      <h6 className="fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                          <path d="M8 16a6 6 0 0 0 6-6c0-1.655-1.122-2.904-2.432-4.362C10.254 4.176 8.75 2.503 8 0c0 0-6 5.686-6 10a6 6 0 0 0 6 6M6.646 4.646l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448c.82-1.641 1.717-2.753 2.093-3.13"/>
                        </svg>
                        Watering Schedule
                      </h6>
                      <p className="small text-body-secondary mb-0">{carePlan.wateringSchedule}</p>
                    </div>
                  )}

                  {carePlan.soilTips && (
                    <div className="mb-3">
                      <h6 className="fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                          <path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5v1a1.5 1.5 0 0 1-3 0V8a.5.5 0 0 1 1 0v1a.5.5 0 0 0 1 0V8a1.5 1.5 0 0 0-3 0v1a2.5 2.5 0 0 0 5 0V8a3.5 3.5 0 1 0-7 0v5.5a.5.5 0 0 1-1 0V8a4.5 4.5 0 1 1 9 0v5.5a.5.5 0 0 1-1 0V8a3.5 3.5 0 0 0-7 0v1a1.5 1.5 0 0 0 3 0V8a.5.5 0 0 0-1 0z"/>
                        </svg>
                        Soil Health
                      </h6>
                      <p className="small text-body-secondary mb-0">{carePlan.soilTips}</p>
                    </div>
                  )}

                  {carePlan.sunlight && (
                    <div className="mb-3">
                      <h6 className="fw-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                          <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                        </svg>
                        Sunlight
                      </h6>
                      <p className="small text-body-secondary mb-0">{carePlan.sunlight}</p>
                    </div>
                  )}

                  {carePlan.warnings && carePlan.warnings.length > 0 && (
                    <div className="alert alert-warning d-flex align-items-start" role="alert">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2 flex-shrink-0" viewBox="0 0 16 16">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                      </svg>
                      <div>
                        {carePlan.warnings.map((warning, i) => (
                          <p key={i} className="mb-0 small">{warning}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {carePlan.nextSteps && carePlan.nextSteps.length > 0 && (
                    <div className="mb-0">
                      <h6 className="fw-bold">📋 Next Steps</h6>
                      <ul className="small text-body-secondary mb-0">
                        {carePlan.nextSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 mb-3 bg-body-tertiary rounded">
                <div className="mb-3">
                  <span className="badge bg-success me-2">Monstera deliciosa</span>
                  <span className="badge bg-secondary me-2">Vegetative</span>
                  <span className="badge bg-secondary">Indoor</span>
                </div>

                <p className="text-body-secondary fst-italic">
                  "Water deeply every 7–10 days, allowing the top 3 cm of soil to dry. Add
                  a diluted organic feed every second watering. Rotate the pot weekly to
                  encourage even leaf growth."
                </p>

                <div className="small text-body-secondary">
                  <div className="mb-2">
                    <strong>Care difficulty:</strong> Beginner-friendly
                  </div>
                  <div>
                    <strong>Risk level:</strong> Low · indoors
                  </div>
                </div>
              </div>
            )}

            <div className="p-4">
              <h4 className="fst-italic">Recent Plans</h4>
              {history.length > 0 ? (
                <ul className="list-unstyled">
                  {history.map((item) => (
                    <li key={item.id} className="border-top py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">{item.plantName}</h6>
                          <small className="text-body-secondary">
                            {new Date(item.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </small>
                        </div>
                        <span className="badge bg-success">Saved</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-secondary small">
                  No care plans yet. Generate your first plan above!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
