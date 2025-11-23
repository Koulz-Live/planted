import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
import './StorytellingPage.css';

interface StorytellingFormData {
  dishName: string;
  region: string;
  foodPhotoUrls: string[];
}

interface StorytellingResponse {
  narrative: string;
  scienceInsights: string[];
}

export default function StorytellingPage() {
  const [formData, setFormData] = useState<StorytellingFormData>({
    dishName: '',
    region: '',
    foodPhotoUrls: []
  });

  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<StorytellingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; dishName: string; region: string; timestamp: Date; }>>([]);

  // Load history from Firestore
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const q = query(
          collection(db, 'foodStories'),
          where('userId', '==', 'demo-user'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            dishName: data.dishName || 'Unknown Dish',
            region: data.region || 'Unknown Region',
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData(prev => ({ ...prev, foodPhotoUrls: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/storytelling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          dishName: formData.dishName,
          region: formData.region,
          foodPhotoUrls: formData.foodPhotoUrls
        })
      });

      const result = await response.json();

      if (result.ok && result.data) {
        const storyData = {
          narrative: result.data.narrative || '',
          scienceInsights: result.data.scienceInsights || []
        };
        setStory(storyData);

        // Save to Firestore
        try {
          await addDoc(collection(db, 'foodStories'), {
            userId: 'demo-user',
            dishName: formData.dishName,
            region: formData.region,
            formData: formData,
            story: storyData,
            timestamp: Timestamp.now()
          });

          // Refresh history
          const q = query(
            collection(db, 'foodStories'),
            where('userId', '==', 'demo-user'),
            orderBy('timestamp', 'desc'),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          const historyData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              dishName: data.dishName || 'Unknown Dish',
              region: data.region || 'Unknown Region',
              timestamp: data.timestamp.toDate()
            };
          });
          setHistory(historyData);
        } catch (firestoreErr) {
          console.error('Error saving to Firestore:', firestoreErr);
        }
      } else {
        setError(result.message || 'Failed to generate food story');
      }
    } catch (err) {
      setError('Network error. Please ensure the backend server is running.');
      console.error('Error generating food story:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="storytelling-page">
      {/* Top Navigation */}
      <header className="st-nav">
        <div className="st-nav-inner">
          <div className="st-brand">
            <div className="st-brand-icon">📖</div>
            <span>Planted</span>
          </div>
          <nav className="st-nav-links">
            <a href="/">Home</a>
            <a href="/plant-care">Plant Care</a>
            <a href="/recipes">Recipes</a>
            <a href="/nutrition">Nutrition</a>
            <a href="/storytelling" className="active">Storytelling</a>
            <a href="/community">Community</a>
          </nav>
        </div>
      </header>

      <main className="st-shell">
        {/* Left column: Form */}
        <section className="st-main-column">
          <header className="st-hero-header">
            <div className="st-eyebrow">
              <span>🌍</span>
              Cultural Food History
            </div>
            <h1 className="st-title">Food Storytelling</h1>
            <p className="st-subtitle">
              Discover the rich cultural heritage, historical origins, and scientific wisdom 
              behind traditional dishes from around the world.
            </p>
          </header>

          <article className="st-card">
            <div className="st-card-inner">
              <div className="st-card-header">
                <h2>Explore a Dish</h2>
                <div className="st-tag-set">
                  <div className="st-tag-dot"></div>
                  AI-Powered
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="st-form-grid">
                  <div className="st-field">
                    <label htmlFor="dishName">Dish Name *</label>
                    <input
                      id="dishName"
                      name="dishName"
                      type="text"
                      className="st-input"
                      placeholder="e.g., Injera, Kimchi, Mole"
                      value={formData.dishName}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="st-helper-text">Enter the name of the traditional dish</span>
                  </div>

                  <div className="st-field">
                    <label htmlFor="region">Region/Culture *</label>
                    <input
                      id="region"
                      name="region"
                      type="text"
                      className="st-input"
                      placeholder="e.g., Ethiopia, Korea, Mexico"
                      value={formData.region}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="st-helper-text">Country or cultural region of origin</span>
                  </div>

                  <div className="st-field st-form-row-full">
                    <label>Food Photos (Optional)</label>
                    <ImageUpload
                      onImagesChange={handleImagesChange}
                      maxImages={5}
                      helperText="Upload photos of the dish for AI to provide richer cultural insights and visual analysis."
                    />
                  </div>
                </div>

                {error && (
                  <div className="st-error-message">
                    <span>⚠️</span>
                    {error}
                  </div>
                )}

                <div className="st-form-footer">
                  <div className="st-footer-text">
                    <span>✨</span>
                    <strong>AI-powered</strong> cultural narratives
                  </div>
                  <button
                    type="submit"
                    className="st-btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="icon">⏳</span>
                        Discovering Story...
                      </>
                    ) : (
                      <>
                        <span className="icon">📚</span>
                        Discover Story
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </article>

          {/* Results Section */}
          {story && (
            <article className="st-card st-results-card">
              <div className="st-card-inner">
                <div className="st-card-header">
                  <h2>{formData.dishName}</h2>
                  <div className="st-tag-set">
                    <div className="st-tag-dot"></div>
                    {formData.region}
                  </div>
                </div>

                <div className="st-narrative-section">
                  <h3>📖 Cultural Heritage & History</h3>
                  <div className="st-narrative-content">
                    {story.narrative.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {story.scienceInsights.length > 0 && (
                  <div className="st-science-section">
                    <h3>🔬 Science & Nutrition Insights</h3>
                    <ul className="st-insights-list">
                      {story.scienceInsights.map((insight, index) => (
                        <li key={index}>
                          <span className="st-insight-icon">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          )}
        </section>

        {/* Right column: Preview / Tips */}
        <aside className="st-right-column">
          <article className="st-card st-preview-card">
            <div className="st-card-inner">
              <div className="st-hero-icon">🌾</div>
              <div className="st-preview-card-top">
                <div>
                  <h3 className="st-preview-title">Cultural Food Stories</h3>
                  <p className="st-preview-subtitle">
                    Explore the intersection of history, culture, science, and biodiversity 
                    through traditional foods from around the world.
                  </p>
                </div>
              </div>

              {story ? (
                <div className="st-pill-row">
                  <div className="st-pill">{formData.region}</div>
                  <div className="st-pill muted">{story.scienceInsights.length} insights</div>
                </div>
              ) : (
                <>
                  <div className="st-pill-row">
                    <div className="st-pill">Global Cuisine</div>
                    <div className="st-pill muted">Cultural Heritage</div>
                    <div className="st-pill muted">Science-Backed</div>
                  </div>

                  <div className="st-preview-sample">
                    <h4>Example: Kimchi (Korea)</h4>
                    <p className="st-preview-description">
                      A fermented vegetable dish with 1,500+ year history, deeply rooted in 
                      Korean agricultural traditions and preservation techniques...
                    </p>
                  </div>
                </>
              )}
            </div>
          </article>

          <article className="st-card st-tips-card">
            <div className="st-card-inner">
              <h3>💡 Discovery Tips</h3>
              <ul className="st-tips-list">
                <li>
                  <strong>Be specific with dish names</strong> – Traditional names yield richer stories
                </li>
                <li>
                  <strong>Upload food photos</strong> – AI can identify ingredients and ceremonial elements
                </li>
                <li>
                  <strong>Explore diverse cuisines</strong> – Learn about global food traditions
                </li>
                <li>
                  <strong>Understand sustainability</strong> – Discover ecological wisdom in traditional foods
                </li>
              </ul>
            </div>
          </article>

          <article className="st-card">
            <div className="st-card-inner">
              <h3>Recent Stories</h3>
              {history.length > 0 ? (
                <ul className="st-tips-list" style={{ gap: '0.75rem' }}>
                  {history.map((item) => (
                    <li key={item.id} style={{ paddingLeft: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <strong style={{ color: 'var(--accent-dark)' }}>
                          {item.dishName}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.region} · {new Date(item.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0' }}>
                  No stories yet. Discover your first food story above!
                </p>
              )}
            </div>
          </article>
        </aside>
      </main>
    </div>
  );
}
