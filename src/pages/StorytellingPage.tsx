import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { ImageUpload } from '../components/ImageUpload';
import { Icon } from '../components/Icon';
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
          collection(getDb(), 'foodStories'),
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
      const response = await fetch('/api/storytelling', {
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
          await addDoc(collection(getDb(), 'foodStories'), {
            userId: 'demo-user',
            dishName: formData.dishName,
            region: formData.region,
            formData: formData,
            story: storyData,
            timestamp: Timestamp.now()
          });

          // Refresh history
          const q = query(
            collection(getDb(), 'foodStories'),
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
    <div className="storytelling-page container">
      {/* Hero Section */}
      <div 
        className="p-4 p-md-5 mb-4 rounded text-body-emphasis" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/6646296/pexels-photo-6646296.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic text-white">
            <Icon name="journal" className="icon-inline me-2" />
            Food Storytelling
          </h1>
          <p className="lead my-3 text-white">
            Discover the rich cultural heritage, historical origins, and scientific wisdom 
            behind traditional dishes from around the world. Explore how food connects us to 
            our past, shapes our identity, and carries forward ancient knowledge.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-5">
        {/* Main Content - Form and Story */}
        <div className="col-md-8">
          <h3 className="pb-4 mb-4 fst-italic border-bottom">Explore a Dish</h3>

          <article className="p-4 mb-4 bg-body-tertiary rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Dish Details</h4>
              <span className="badge bg-primary">AI-Powered</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="dishName" className="form-label fw-bold">Dish Name *</label>
                  <input
                    id="dishName"
                    name="dishName"
                    type="text"
                    className="form-control"
                    placeholder="e.g., Injera, Kimchi, Mole"
                    value={formData.dishName}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="form-text">Enter the name of the traditional dish</div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="region" className="form-label fw-bold">Region/Culture *</label>
                  <input
                    id="region"
                    name="region"
                    type="text"
                    className="form-control"
                    placeholder="e.g., Ethiopia, Korea, Mexico"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="form-text">Country or cultural region of origin</div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Food Photos (Optional)</label>
                  <ImageUpload
                    onImagesChange={handleImagesChange}
                    maxImages={5}
                    helperText="Upload photos of the dish for AI to provide richer cultural insights and visual analysis."
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                  </svg>
                  <div>{error}</div>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-stars me-1" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                    <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
                  </svg>
                  AI-powered cultural narratives
                </small>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Discovering Story...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                        <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
                      </svg>
                      Discover Story
                    </>
                  )}
                </button>
              </div>
            </form>
          </article>

          {/* Results Section */}
          {story && (
            <article className="blog-post">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="display-5 link-body-emphasis mb-0">{formData.dishName}</h2>
                <span className="badge bg-success">{formData.region}</span>
              </div>

              <div className="mb-4">
                <h3 className="h4 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2" style={{ verticalAlign: 'middle' }}>
                    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
                  </svg>
                  Cultural Heritage & History
                </h3>
                {story.narrative.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {story.scienceInsights.length > 0 && (
                <div className="p-4 mb-4 bg-body-tertiary rounded">
                  <h3 className="h4 mb-3 d-flex align-items-center gap-2">
                    <Icon name="clipboardData" className="icon-inline" />
                    Science & Nutrition Insights
                  </h3>
                  <ul className="list-unstyled mb-0">
                    {story.scienceInsights.map((insight, index) => (
                      <li key={index} className="mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                        </svg>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          <div className="position-sticky" style={{ top: '2rem' }}>
            {/* About Section */}
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h4 className="fst-italic">Cultural Food Stories</h4>
              <p className="mb-0">
                Explore the intersection of history, culture, science, and biodiversity 
                through traditional foods from around the world.
              </p>
              {story && (
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  <span className="badge bg-success">{formData.region}</span>
                  <span className="badge bg-secondary">{story.scienceInsights.length} insights</span>
                </div>
              )}
              {!story && (
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  <span className="badge bg-secondary">Global Cuisine</span>
                  <span className="badge bg-secondary">Cultural Heritage</span>
                  <span className="badge bg-secondary">Science-Backed</span>
                </div>
              )}
            </div>

            {/* Example Section */}
            {!story && (
              <div className="p-4 mb-3 bg-body-tertiary rounded">
                <h4 className="fst-italic">Example Story</h4>
                <h6 className="mb-2">Kimchi (Korea)</h6>
                <p className="mb-0 small text-muted">
                  A fermented vegetable dish with 1,500+ year history, deeply rooted in 
                  Korean agricultural traditions and preservation techniques...
                </p>
              </div>
            )}

            {/* Discovery Tips */}
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h4 className="fst-italic d-flex align-items-center gap-2">
                <Icon name="lightbulb" className="icon-inline" />
                Discovery Tips
              </h4>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                  </svg>
                  <strong>Be specific with dish names</strong> – Traditional names yield richer stories
                </li>
                <li className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                  </svg>
                  <strong>Upload food photos</strong> – AI can identify ingredients and ceremonial elements
                </li>
                <li className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                  </svg>
                  <strong>Explore diverse cuisines</strong> – Learn about global food traditions
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                  </svg>
                  <strong>Understand sustainability</strong> – Discover ecological wisdom in traditional foods
                </li>
              </ul>
            </div>

            {/* Recent Stories */}
            <div className="p-4">
              <h4 className="fst-italic">Recent Stories</h4>
              {history.length > 0 ? (
                <ul className="list-unstyled">
                  {history.map((item) => (
                    <li key={item.id} className="border-top py-3">
                      <div>
                        <h6 className="mb-0">{item.dishName}</h6>
                        <small className="text-muted">
                          {item.region} · {new Date(item.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted small mb-0">
                  No stories yet. Discover your first food story above!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
