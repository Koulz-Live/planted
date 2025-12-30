import { useState } from 'react';
import { Icon } from '../components/Icon';
import CommunityPage from './CommunityPage';
import ChallengesPage from './ChallengesPage';
import './CommunityHubPage.css';

export default function CommunityHubPage() {
  const [activeTab, setActiveTab] = useState<'community' | 'challenges'>('community');

  return (
    <div className="community-hub-page">
      {/* Hero Section */}
      <div 
        className="p-4 p-md-5 mb-4 rounded text-body-emphasis" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic text-white">
            <Icon name="people" className="icon-inline me-2" />
            Community Hub
          </h1>
          <p className="lead my-3 text-white">
            Connect with a global community, share your culinary journey, and take on challenges 
            that promote sustainable living, cultural appreciation, and healthy eating.
          </p>
        </div>
      </div>

      {/* Tabs Navigation - Card Style */}
      <div className="community-hub-tabs-container mb-4 container">
        <div className="row g-3" role="tablist" aria-label="Community Hub section tabs">
          <div className="col-md-6 col-sm-12">
            <div 
              className={`card h-100 shadow-sm ${activeTab === 'community' ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveTab('community')}
              role="tab"
              aria-selected={activeTab === 'community'}
              aria-controls="community-panel"
              id="community-tab"
            >
              <div className={`card-body text-center ${activeTab === 'community' ? 'bg-primary bg-opacity-10' : ''}`}>
                <Icon name="people" className="icon-inline mb-2" aria-hidden="true" style={{ fontSize: '2rem' }} />
                <h5 className="card-title mb-2">Community Feed</h5>
                <p className="card-text text-muted small mb-0">
                  Share recipes, tips, stories & connect with food lovers worldwide
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-sm-12">
            <div 
              className={`card h-100 shadow-sm ${activeTab === 'challenges' ? 'border-warning' : ''}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveTab('challenges')}
              role="tab"
              aria-selected={activeTab === 'challenges'}
              aria-controls="challenges-panel"
              id="challenges-tab"
            >
              <div className={`card-body text-center ${activeTab === 'challenges' ? 'bg-warning bg-opacity-10' : ''}`}>
                <Icon name="trophy" className="icon-inline mb-2" aria-hidden="true" style={{ fontSize: '2rem' }} />
                <h5 className="card-title mb-2">Food Challenges</h5>
                <p className="card-text text-muted small mb-0">
                  Take on sustainability, culture & nutrition challenges
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'community' && (
          <div role="tabpanel" id="community-panel" aria-labelledby="community-tab">
            <CommunityPage />
          </div>
        )}

        {activeTab === 'challenges' && (
          <div role="tabpanel" id="challenges-panel" aria-labelledby="challenges-tab">
            <ChallengesPage />
          </div>
        )}
      </div>
    </div>
  );
}
