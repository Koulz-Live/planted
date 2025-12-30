import { useState } from 'react';
import { Icon } from '../components/Icon';
import LearningPage from './LearningPage';
import StorytellingPage from './StorytellingPage';
import './EducationPage.css';

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<'learning' | 'storytelling'>('learning');

  return (
    <div className="education-page">
      {/* Hero Section */}
      <div 
        className="p-4 p-md-5 mb-4 rounded text-body-emphasis" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic text-white">
            <Icon name="book" className="icon-inline me-2" />
            Education Hub
          </h1>
          <p className="lead my-3 text-white">
            Explore structured learning modules and discover the rich cultural heritage behind traditional dishes from around the world.
          </p>
        </div>
      </div>

      {/* Tabs Navigation - Card Style */}
      <div className="education-tabs-container mb-4 container">
        <div className="row g-3" role="tablist" aria-label="Education section tabs">
          <div className="col-md-6 col-sm-12">
            <div 
              className={`card h-100 shadow-sm ${activeTab === 'learning' ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveTab('learning')}
              role="tab"
              aria-selected={activeTab === 'learning'}
              aria-controls="learning-panel"
              id="learning-tab"
            >
              <div className={`card-body text-center ${activeTab === 'learning' ? 'bg-primary bg-opacity-10' : ''}`}>
                <Icon name="book" className="icon-inline mb-2" aria-hidden="true" style={{ fontSize: '2rem' }} />
                <h5 className="card-title mb-2">Learning Pathways</h5>
                <p className="card-text text-muted small mb-0">
                  Structured modules on nutrition, culture, sustainability & cooking
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-sm-12">
            <div 
              className={`card h-100 shadow-sm ${activeTab === 'storytelling' ? 'border-success' : ''}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveTab('storytelling')}
              role="tab"
              aria-selected={activeTab === 'storytelling'}
              aria-controls="storytelling-panel"
              id="storytelling-tab"
            >
              <div className={`card-body text-center ${activeTab === 'storytelling' ? 'bg-success bg-opacity-10' : ''}`}>
                <Icon name="journal" className="icon-inline mb-2" aria-hidden="true" style={{ fontSize: '2rem' }} />
                <h5 className="card-title mb-2">Food Storytelling</h5>
                <p className="card-text text-muted small mb-0">
                  Discover cultural heritage & history behind traditional dishes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'learning' && (
          <div role="tabpanel" id="learning-panel" aria-labelledby="learning-tab">
            <LearningPage />
          </div>
        )}

        {activeTab === 'storytelling' && (
          <div role="tabpanel" id="storytelling-panel" aria-labelledby="storytelling-tab">
            <StorytellingPage />
          </div>
        )}
      </div>
    </div>
  );
}
