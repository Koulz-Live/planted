import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
import './PlantCarePage.css';

type GrowthStage = 'seedling' | 'vegetative' | 'fruiting' | 'dormant';
type CareActivity = 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'pest-control' | 'observation';

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

interface CareLogEntry {
  id?: string;
  plantName: string;
  activity: CareActivity;
  notes: string;
  timestamp: Date;
  photoUrls?: string[];
}

interface PlantIdentification {
  scientificName: string;
  commonName: string;
  confidence: number;
  suggestions?: string[];
  warnings?: string[];
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
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; plantName: string; timestamp: Date; }>>([]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'generate' | 'log'>('generate');
  
  // Plant identification state
  const [identifyingPlant, setIdentifyingPlant] = useState(false);
  const [plantIdentification, setPlantIdentification] = useState<PlantIdentification | null>(null);
  const [identificationPhotoUrl, setIdentificationPhotoUrl] = useState<string | null>(null);
  const [showIdentificationFlow, setShowIdentificationFlow] = useState(false);
  
  // Care log state
  const [careLog, setCareLog] = useState<CareLogEntry[]>([]);
  const [logFormData, setLogFormData] = useState<{
    plantName: string;
    activity: CareActivity;
    notes: string;
    photoUrls: string[];
  }>({
    plantName: '',
    activity: 'watering',
    notes: '',
    photoUrls: []
  });

  // Load history from Firestore
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const q = query(
          collection(getDb(), 'plant-plans'),
          where('userId', '==', 'demo-user'),
          where('type', '==', 'care-plan'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          plantName: doc.data().plantName || doc.data().formData?.plantName || 'Plant',
          timestamp: doc.data().timestamp.toDate()
        }));
        setHistory(historyData);
      } catch (err) {
        console.error('Error loading history:', err);
      }
    };
    loadHistory();
  }, []);

  // Load care log from Firestore
  useEffect(() => {
    const loadCareLog = async () => {
      try {
        const q = query(
          collection(getDb(), 'plant-care-log'),
          where('userId', '==', 'demo-user'),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const logData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          plantName: doc.data().plantName,
          activity: doc.data().activity,
          notes: doc.data().notes,
          timestamp: doc.data().timestamp.toDate(),
          photoUrls: doc.data().photoUrls || []
        }));
        setCareLog(logData);
      } catch (err) {
        console.error('Error loading care log:', err);
      }
    };
    loadCareLog();
  }, []);

  // Save care plan to favorites
  const savePlanToFavorites = async (plan: PlantCarePlan) => {
    try {
      await addDoc(collection(getDb(), 'favorite-plant-plans'), {
        userId: 'demo-user',
        plantName: formData.plantName,
        growthStage: formData.growthStage,
        carePlan: plan,
        formData: formData,
        timestamp: Timestamp.now(),
        tags: [
          formData.growthStage,
          formData.country,
          formData.hardinessZone
        ].filter(Boolean)
      });
      
      setSavedMessage(`✅ "${plan.title}" saved to favorites!`);
      console.log('✅ Plant care plan saved to favorites');
      
      // Clear message after 3 seconds
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      console.error('Error saving plan to favorites:', err);
      setSavedMessage('❌ Failed to save plan. Please try again.');
      setTimeout(() => setSavedMessage(null), 3000);
    }
  };

  // Save care log entry
  const saveCareLogEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!logFormData.plantName || !logFormData.notes) {
      setSavedMessage('❌ Please fill in plant name and notes');
      setTimeout(() => setSavedMessage(null), 3000);
      return;
    }

    try {
      const newEntry = {
        userId: 'demo-user',
        plantName: logFormData.plantName,
        activity: logFormData.activity,
        notes: logFormData.notes,
        photoUrls: logFormData.photoUrls,
        timestamp: Timestamp.now()
      };

      await addDoc(collection(getDb(), 'plant-care-log'), newEntry);
      
      setSavedMessage('✅ Care log entry saved!');
      console.log('✅ Care log entry saved to Firebase');
      
      // Add to local state
      setCareLog(prev => [{
        ...newEntry,
        timestamp: new Date()
      }, ...prev]);
      
      // Reset form
      setLogFormData({
        plantName: '',
        activity: 'watering',
        notes: '',
        photoUrls: []
      });
      
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      console.error('Error saving care log entry:', err);
      setSavedMessage('❌ Failed to save log entry. Please try again.');
      setTimeout(() => setSavedMessage(null), 3000);
    }
  };

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

  const handleLogImagesChange = (urls: string[]) => {
    setLogFormData(prev => ({ ...prev, photoUrls: urls }));
  };

  const handleLogInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLogFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Plant identification from photo
  const identifyPlantFromPhoto = async (photoUrl: string) => {
    setIdentifyingPlant(true);
    setIdentificationPhotoUrl(photoUrl);
    setError(null);

    try {
      const response = await fetch('/api/ai/identify-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({ photoUrl })
      });

      const result = await response.json();

      if (result.ok && result.data) {
        const identification: PlantIdentification = {
          scientificName: result.data.scientificName || '',
          commonName: result.data.commonName || '',
          confidence: result.data.confidence || 0,
          suggestions: result.data.suggestions || []
        };
        
        setPlantIdentification(identification);
        setShowIdentificationFlow(true);
        
        // If high confidence, pre-fill plant name
        if (identification.confidence >= 70 && identification.commonName) {
          setFormData(prev => ({ ...prev, plantName: identification.commonName }));
        }
      } else {
        setError(result.message || 'Failed to identify plant. Please enter name manually.');
      }
    } catch (err) {
      console.error('Error identifying plant:', err);
      setError('Network error during plant identification. Please try again or enter name manually.');
    } finally {
      setIdentifyingPlant(false);
    }
  };

  const confirmPlantIdentification = () => {
    if (plantIdentification) {
      setFormData(prev => ({ 
        ...prev, 
        plantName: plantIdentification.commonName || plantIdentification.scientificName 
      }));
      setShowIdentificationFlow(false);
      setPlantIdentification(null);
      setIdentificationPhotoUrl(null);
    }
  };

  const rejectPlantIdentification = () => {
    setShowIdentificationFlow(false);
    setPlantIdentification(null);
    setIdentificationPhotoUrl(null);
    setFormData(prev => ({ ...prev, plantName: '' }));
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
          // Save the care plan session
          const sessionDoc = await addDoc(collection(getDb(), 'plant-plans'), {
            userId: 'demo-user',
            plantName: formData.plantName,
            growthStage: formData.growthStage,
            country: formData.country,
            formData: formData,
            carePlan: plan,
            timestamp: Timestamp.now(),
            type: 'care-plan'
          });

          console.log('✅ Plant care plan saved to Firebase:', sessionDoc.id);

          // Save individual plan for easier querying
          await addDoc(collection(getDb(), 'user-plant-plans'), {
            userId: 'demo-user',
            sessionId: sessionDoc.id,
            plantName: formData.plantName,
            growthStage: formData.growthStage,
            carePlan: plan,
            formData: {
              country: formData.country,
              hardinessZone: formData.hardinessZone,
              growthStage: formData.growthStage
            },
            timestamp: Timestamp.now(),
            isFavorite: false,
            tags: [
              formData.growthStage,
              formData.country,
              formData.hardinessZone
            ].filter(Boolean)
          });

          console.log('✅ Individual plant care plan saved to Firebase');

          // Refresh history
          const q = query(
            collection(getDb(), 'plant-plans'),
            where('userId', '==', 'demo-user'),
            where('type', '==', 'care-plan'),
            orderBy('timestamp', 'desc'),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          const historyData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            plantName: doc.data().plantName || doc.data().formData?.plantName || 'Plant',
            timestamp: doc.data().timestamp.toDate()
          }));
          setHistory(historyData);
        } catch (firestoreErr: any) {
          console.error('Error saving to Firestore:', firestoreErr);
          // Don't throw - care plan is still usable
          if (firestoreErr.message?.includes('requires an index')) {
            console.warn('💡 Firestore index required. Check console for index creation link.');
          }
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
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/1022922/pexels-photo-1022922.jpeg?auto=compress&cs=tinysrgb&w=1600)',
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
          {/* Tab Navigation */}
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'generate' ? 'active' : ''}`}
                onClick={() => setActiveTab('generate')}
                type="button"
                role="tab"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                  <path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5v1a1.5 1.5 0 0 1-3 0V8a.5.5 0 0 1 1 0v1a.5.5 0 0 0 1 0V8a1.5 1.5 0 0 0-3 0v1a2.5 2.5 0 0 0 5 0V8a3.5 3.5 0 1 0-7 0v5.5a.5.5 0 0 1-1 0V8a4.5 4.5 0 1 1 9 0v5.5a.5.5 0 0 1-1 0V8a3.5 3.5 0 0 0-7 0v1a1.5 1.5 0 0 0 3 0V8a.5.5 0 0 0-1 0z"/>
                </svg>
                Generate Care Plan
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'log' ? 'active' : ''}`}
                onClick={() => setActiveTab('log')}
                type="button"
                role="tab"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                  <path d="M2.5 8a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-2.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5z"/>
                </svg>
                Care Log ({careLog.length})
              </button>
            </li>
          </ul>

          <h3 className="pb-4 mb-4 fst-italic border-bottom">
            {activeTab === 'generate' ? 'Plant Care Request' : 'Plant Care Log'}
          </h3>

          {/* Generate Care Plan Tab */}
          {activeTab === 'generate' && (
          <article className="blog-post">
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="badge bg-primary">Single plant</span>
                  <span className="text-body-secondary ms-2">~15 seconds</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step Indicator */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-fill">
                      <div className="d-flex align-items-center">
                        <div className={`badge ${formData.plantName ? 'bg-success' : 'bg-secondary'} me-2`}>1</div>
                        <span className={`small ${formData.plantName ? 'fw-bold' : 'text-muted'}`}>Your Plant</span>
                      </div>
                    </div>
                    <div className="flex-fill">
                      <div className="d-flex align-items-center">
                        <div className={`badge ${formData.country ? 'bg-success' : 'bg-secondary'} me-2`}>2</div>
                        <span className={`small ${formData.country ? 'fw-bold' : 'text-muted'}`}>Environment</span>
                      </div>
                    </div>
                    <div className="flex-fill">
                      <div className="d-flex align-items-center">
                        <div className={`badge ${formData.biodiversityConcerns || formData.photoUrls.length > 0 ? 'bg-success' : 'bg-secondary'} me-2`}>3</div>
                        <span className={`small ${formData.biodiversityConcerns || formData.photoUrls.length > 0 ? 'fw-bold' : 'text-muted'}`}>Observations</span>
                      </div>
                    </div>
                    <div className="flex-fill">
                      <div className="d-flex align-items-center">
                        <div className={`badge ${carePlan ? 'bg-success' : 'bg-secondary'} me-2`}>4</div>
                        <span className={`small ${carePlan ? 'fw-bold' : 'text-muted'}`}>Care Plan</span>
                      </div>
                    </div>
                  </div>
                  <div className="progress mt-2" style={{ height: '4px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ 
                        width: `${
                          carePlan ? 100 : 
                          (formData.biodiversityConcerns || formData.photoUrls.length > 0) ? 75 :
                          formData.country ? 50 :
                          formData.plantName ? 25 : 0
                        }%` 
                      }}
                      aria-valuenow={
                        carePlan ? 100 : 
                        (formData.biodiversityConcerns || formData.photoUrls.length > 0) ? 75 :
                        formData.country ? 50 :
                        formData.plantName ? 25 : 0
                      }
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>

                {/* Step 1: Plant Details */}
                <div className="mb-3">{/* Plant Name input */}
                  <label htmlFor="plant-name" className="form-label fw-bold">
                    Plant Name *
                    <span className="badge bg-primary ms-2" style={{ fontSize: '0.7rem' }}>Step 1</span>
                  </label>
                  
                  {/* Plant Identification Flow */}
                  {showIdentificationFlow && plantIdentification ? (
                    <div className="alert alert-info mb-3">
                      <div className="d-flex align-items-start">
                        {identificationPhotoUrl && (
                          <img 
                            src={identificationPhotoUrl} 
                            alt="Plant" 
                            style={{ 
                              width: '80px', 
                              height: '80px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              marginRight: '15px'
                            }} 
                          />
                        )}
                        <div className="flex-grow-1">
                          <h6 className="mb-2">
                            {plantIdentification.confidence >= 70 ? '✅' : '⚠️'} 
                            {' '}We think this is:
                          </h6>
                          <p className="mb-1 fw-bold">{plantIdentification.commonName || plantIdentification.scientificName}</p>
                          {plantIdentification.scientificName && plantIdentification.commonName && (
                            <p className="mb-1 small text-muted fst-italic">{plantIdentification.scientificName}</p>
                          )}
                          <p className="mb-2 small">
                            Confidence: {plantIdentification.confidence}%
                          </p>
                          
                          {/* Display warnings if present */}
                          {plantIdentification.warnings && plantIdentification.warnings.length > 0 && (
                            <div className="alert alert-warning small mb-2 py-2">
                              {plantIdentification.warnings.map((warning, idx) => (
                                <p key={idx} className="mb-1">
                                  ⚠️ {warning}
                                </p>
                              ))}
                            </div>
                          )}
                          
                          {/* Fallback: Show generic tips for low confidence if no warnings */}
                          {plantIdentification.confidence < 50 && (!plantIdentification.warnings || plantIdentification.warnings.length === 0) && (
                            <div className="alert alert-warning small mb-2 py-2">
                              <strong>Low confidence.</strong> Try another photo:
                              <ul className="mb-0 mt-1">
                                <li>Take a close-up of leaves</li>
                                <li>Show the full plant</li>
                                <li>Include stems or flowers</li>
                              </ul>
                            </div>
                          )}
                          
                          {/* Show suggestions for moderate/low confidence */}
                          {plantIdentification.suggestions && plantIdentification.suggestions.length > 0 && (
                            <div className="small text-muted mb-2">
                              <strong>Other possibilities:</strong> {plantIdentification.suggestions.join(', ')}
                            </div>
                          )}
                          
                          <div className="btn-group btn-group-sm">
                            <button 
                              type="button"
                              className="btn btn-success"
                              onClick={confirmPlantIdentification}
                            >
                              ✓ Confirm
                            </button>
                            <button 
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={rejectPlantIdentification}
                            >
                              Change
                            </button>
                            <button 
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setShowIdentificationFlow(false);
                                setPlantIdentification(null);
                              }}
                            >
                              📸 Try Another Photo
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : identifyingPlant ? (
                    <div className="alert alert-light mb-3">
                      <div className="d-flex align-items-center">
                        <span className="spinner-border spinner-border-sm me-3" role="status" aria-hidden="true"></span>
                        <div>
                          <strong>Identifying plant...</strong>
                          <p className="mb-0 small text-muted">Analyzing photo with AI</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="input-group">
                    <input
                      id="plant-name"
                      name="plantName"
                      className="form-control"
                      type="text"
                      placeholder="e.g. Monstera, Basil, Tomato Vine"
                      value={formData.plantName}
                      onChange={handleInputChange}
                      required
                      disabled={identifyingPlant}
                    />
                    <label 
                      className="btn btn-outline-primary"
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Convert to base64 for API call
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              identifyPlantFromPhoto(base64);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        disabled={identifyingPlant}
                      />
                      📸 Take Photo
                    </label>
                  </div>
                  <div className="form-text">
                    Take a photo to identify your plant automatically, or type the name manually
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Growth Stage *
                    <span className="text-body-secondary fw-normal ms-2" style={{ fontSize: '0.875rem' }}>
                      (What stage is your plant in?)
                    </span>
                  </label>
                  <div className="btn-group d-flex" role="group" aria-label="Growth stage">
                    {(['seedling', 'vegetative', 'fruiting', 'dormant'] as GrowthStage[]).map(stage => {
                      const helperTexts = {
                        seedling: 'Young plant just sprouting or recently planted',
                        vegetative: 'Healthy leaf growth, no flowers yet',
                        fruiting: 'Flowers or fruit forming',
                        dormant: 'Little to no growth (cold/dry season)'
                      };
                      
                      return (
                        <button
                          key={stage}
                          type="button"
                          className={`btn ${formData.growthStage === stage ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => handleGrowthStageChange(stage)}
                          title={helperTexts[stage]}
                        >
                          {stage.charAt(0).toUpperCase() + stage.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                  {/* Helper text below buttons */}
                  <div className="form-text mt-2">
                    {formData.growthStage === 'seedling' && '🌱 Young plant just sprouting or recently planted'}
                    {formData.growthStage === 'vegetative' && '🌿 Healthy leaf growth, no flowers yet'}
                    {formData.growthStage === 'fruiting' && '🌸 Flowers or fruit forming'}
                    {formData.growthStage === 'dormant' && '😴 Little to no growth (cold/dry season)'}
                  </div>
                </div>

                {/* Step 2: Environment/Climate Section */}
                <div className="mb-4 p-3 border rounded bg-light">
                  <h6 className="fw-bold mb-3">
                    <span className="badge bg-primary me-2" style={{ fontSize: '0.7rem' }}>Step 2</span>
                    Environment & Climate
                  </h6>
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
                </div>
                {/* End Environment Section */}

                {/* Step 3: Observations Section */}
                <div className="mb-4 p-3 border rounded bg-light">
                  <h6 className="fw-bold mb-3">
                    <span className="badge bg-primary me-2" style={{ fontSize: '0.7rem' }}>Step 3</span>
                    Observations & Issues (Optional)
                  </h6>
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
                  <label className="form-label fw-bold">
                    Observations & Photos (Optional)
                    <span className="text-success fw-normal ms-2" style={{ fontSize: '0.875rem' }}>
                      📸 Photos improve accuracy by up to 40%
                    </span>
                  </label>
                  <ImageUpload
                    onImagesChange={handleImagesChange}
                    maxImages={5}
                    helperText="Drag & drop images here, or browse files. Add close-ups of leaves, soil surface, or any problem areas."
                  />
                  <div className="d-flex gap-3 mt-2">
                    <div className="small text-body-secondary">
                      <strong>Helpful photos:</strong>
                    </div>
                    <div className="small text-body-secondary">
                      🌿 Leaf close-up · 🪴 Soil surface · 📷 Full plant view
                    </div>
                  </div>
                </div>
                </div>
                {/* End Observations Section */}

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
                        Generating Your Care Plan...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                          <path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5v1a1.5 1.5 0 0 1-3 0V8a.5.5 0 0 1 1 0v1a.5.5 0 0 0 1 0V8a1.5 1.5 0 0 0-3 0v1a2.5 2.5 0 0 0 5 0V8a3.5 3.5 0 1 0-7 0v5.5a.5.5 0 0 1-1 0V8a4.5 4.5 0 1 1 9 0v5.5a.5.5 0 0 1-1 0V8a3.5 3.5 0 0 0-7 0v1a1.5 1.5 0 0 0 3 0V8a.5.5 0 0 0-1 0z"/>
                        </svg>
                        Get My Climate-Aware Care Plan
                      </>
                    )}
                  </button>
                  <div className="text-center small text-body-secondary">
                    ✓ No login required · ✓ Free · ✓ Takes ~15 seconds
                  </div>
                </div>
              </form>
            </div>
          </article>
          )}
          {/* End Generate Care Plan Tab */}

          {/* Care Log Tab */}
          {activeTab === 'log' && (
          <article className="blog-post">
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h5 className="mb-3">📝 Log a Care Activity</h5>
              
              <form onSubmit={saveCareLogEntry}>
                <div className="mb-3">
                  <label htmlFor="log-plant-name" className="form-label fw-bold">Plant Name *</label>
                  <input
                    id="log-plant-name"
                    name="plantName"
                    className="form-control"
                    type="text"
                    placeholder="e.g. My Tomato Plant, Kitchen Basil"
                    value={logFormData.plantName}
                    onChange={handleLogInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="log-activity" className="form-label fw-bold">Activity Type *</label>
                  <select
                    id="log-activity"
                    name="activity"
                    className="form-select"
                    value={logFormData.activity}
                    onChange={handleLogInputChange}
                    required
                  >
                    <option value="watering">💧 Watering</option>
                    <option value="fertilizing">🌿 Fertilizing</option>
                    <option value="pruning">✂️ Pruning</option>
                    <option value="repotting">🪴 Repotting</option>
                    <option value="pest-control">🐛 Pest Control</option>
                    <option value="observation">👁️ General Observation</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="log-notes" className="form-label fw-bold">Notes *</label>
                  <textarea
                    id="log-notes"
                    name="notes"
                    className="form-control"
                    rows={4}
                    placeholder="Describe what you did, what you observed, any changes in plant health, etc."
                    value={logFormData.notes}
                    onChange={handleLogInputChange}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Photos (Optional)</label>
                  <ImageUpload
                    onImagesChange={handleLogImagesChange}
                    maxImages={3}
                    helperText="Add photos to track your plant's progress visually"
                  />
                </div>

                {savedMessage && (
                  <div className={`alert ${savedMessage.includes('✅') ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-3`} role="alert">
                    <div>{savedMessage}</div>
                  </div>
                )}

                <button className="btn btn-success w-100" type="submit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                  </svg>
                  Save Care Log Entry
                </button>
              </form>
            </div>

            {/* Care Log History */}
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h5 className="mb-3">📋 Recent Care Activities</h5>
              
              {careLog.length > 0 ? (
                <div className="list-group">
                  {careLog.map((entry, index) => (
                    <div key={entry.id || index} className="list-group-item border-0 mb-2" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1 fw-bold">{entry.plantName}</h6>
                          <small className="text-body-secondary">
                            {new Date(entry.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                        <span className="badge bg-primary">
                          {entry.activity === 'watering' && '💧'}
                          {entry.activity === 'fertilizing' && '🌿'}
                          {entry.activity === 'pruning' && '✂️'}
                          {entry.activity === 'repotting' && '🪴'}
                          {entry.activity === 'pest-control' && '🐛'}
                          {entry.activity === 'observation' && '👁️'}
                          {' '}
                          {entry.activity.charAt(0).toUpperCase() + entry.activity.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      <p className="mb-0 small">{entry.notes}</p>
                      {entry.photoUrls && entry.photoUrls.length > 0 && (
                        <div className="mt-2 d-flex gap-2">
                          {entry.photoUrls.map((url, i) => (
                            <img 
                              key={i} 
                              src={url} 
                              alt={`Photo ${i + 1}`} 
                              style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover', 
                                borderRadius: '4px' 
                              }} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-2" style={{ fontSize: '2.5rem', opacity: 0.3 }}>📝</div>
                  <p className="text-body-secondary small mb-2">
                    No care activities logged yet.
                  </p>
                  <p className="text-body-secondary small mb-0">
                    <strong>Start tracking your plant care above</strong>
                  </p>
                </div>
              )}
            </div>
          </article>
          )}
          {/* End Care Log Tab */}
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
                  ? '✓ Generated care plan for your plant'
                  : formData.plantName 
                    ? `Your care plan is adapting for ${formData.plantName} in ${formData.country || 'your location'}...`
                    : 'As you fill in the form, Plant Care AI drafts a regenerative plan in real time.'}
              </p>
            </div>

            {carePlan ? (
              <div className="p-4 mb-3 bg-body-tertiary rounded">
                <div className="mb-3 d-flex justify-content-between align-items-start">
                  <div>
                    <span className="badge bg-success me-2">{formData.plantName}</span>
                    <span className="badge bg-secondary">{formData.growthStage} · {formData.country}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => savePlanToFavorites(carePlan)}
                    title="Save to favorites"
                  >
                    ❤️
                  </button>
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
                <div className="text-center py-4">
                  <div className="mb-2" style={{ fontSize: '2.5rem', opacity: 0.3 }}>🌱</div>
                  <p className="text-body-secondary small mb-2">
                    Your saved plant care plans will appear here.
                  </p>
                  <p className="text-body-secondary small mb-0">
                    <strong>Start with your first plant above</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Ethical Statement */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="p-3 text-center border-top">
            <p className="small text-body-secondary mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
              </svg>
              Built with regenerative growing principles and respect for local ecosystems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
