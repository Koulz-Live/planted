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
            <div className="st-brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
              </svg>
            </div>
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
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                  <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855q-.215.403-.395.872c.705.157 1.472.257 2.282.287zM4.249 3.539q.214-.577.481-1.078a7 7 0 0 1 .597-.933A7 7 0 0 0 3.051 3.05q.544.277 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9 9 0 0 1-1.565-.667A6.96 6.96 0 0 0 1.018 7.5zm1.4-2.741a12.3 12.3 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332M8.5 5.09V7.5h2.99a12.3 12.3 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.6 13.6 0 0 1 7.5 10.91V8.5zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741zm-3.282 3.696q.18.469.395.872c.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a7 7 0 0 1-.598-.933 9 9 0 0 1-.481-1.079 8.4 8.4 0 0 0-1.198.49 7 7 0 0 0 2.276 1.522zm-1.383-2.964A13.4 13.4 0 0 1 3.508 8.5h-2.49a6.96 6.96 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667m6.728 2.964a7 7 0 0 0 2.275-1.521 8.4 8.4 0 0 0-1.197-.49 9 9 0 0 1-.481 1.078 7 7 0 0 1-.597.933M8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855q.216-.403.395-.872A12.6 12.6 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.96 6.96 0 0 0 14.982 8.5h-2.49a13.4 13.4 0 0 1-.437 3.008M14.982 7.5a6.96 6.96 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008zM11.27 2.461q.266.502.482 1.078a8.4 8.4 0 0 0 1.196-.49 7 7 0 0 0-2.275-1.52c.218.283.418.597.597.932m-.488 1.343a8 8 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z"/>
                </svg>
              </span>
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
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8"/>
                      </svg>
                    </span>
                    <strong>AI-powered</strong> cultural narratives
                  </div>
                  <button
                    type="submit"
                    className="st-btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                          </svg>
                        </span>
                        Discovering Story...
                      </>
                    ) : (
                      <>
                        <span className="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
                          </svg>
                        </span>
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
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                      <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
                    </svg>
                    Cultural Heritage & History
                  </h3>
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
