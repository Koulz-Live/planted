import { Link, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import { useState } from 'react';

export function Navigation() {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenu(prev => prev === menuName ? null : menuName);
  };

  return (
    <div className="container" style={{ position: 'relative', zIndex: 99999 }}>
      {/* Header with logo and actions */}
      <header className="border-bottom lh-1 py-3">
        <div className="row flex-nowrap justify-content-between align-items-center">
          <div className="col-4 pt-1">
            <Link className="link-secondary text-decoration-none" to="/community-hub" aria-label="Subscribe to community">Subscribe</Link>
          </div>
          <div className="col-4 text-center">
            <Link className="blog-header-logo text-body-emphasis text-decoration-none fs-2 fw-bold d-inline-flex align-items-center gap-2" to="/" aria-label="Planted - Home">
              <Icon name="sprout" className="icon-inline" aria-hidden="true" />
              Planted
            </Link>
          </div>
          <div className="col-4 d-flex justify-content-end align-items-center gap-2">
            <Link className="link-secondary" to="/education" aria-label="Search learning resources">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="mx-2" role="img" viewBox="0 0 24 24" aria-hidden="true">
                <title>Search</title>
                <circle cx="10.5" cy="10.5" r="7.5"></circle>
                <path d="M21 21l-5.2-5.2"></path>
              </svg>
            </Link>
            <Link 
              className="btn btn-sm btn-success" 
              to="/community-hub" 
              aria-label="Join the community"
            >
              <Icon name="globe" className="d-inline me-1" aria-hidden="true" />
              Join Community
            </Link>
          </div>
        </div>
      </header>

      {/* Mega Menu Navigation */}
      <div className="nav-scroller py-1 mb-3 border-bottom">
        <nav className="nav nav-underline justify-content-center" aria-label="Main navigation">
          <Link 
            className={`nav-item nav-link link-body-emphasis ${isActive('/')}`} 
            to="/" 
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            <Icon name="globe" className="icon-inline me-1 d-md-none" aria-hidden="true" />
            Home
          </Link>

          {/* GROW Button */}
          <button
            className={`nav-link link-body-emphasis d-flex align-items-center gap-1 ${
              isActive('/plant-care') || isActive('/education') ? 'active' : ''
            } ${openMenu === 'grow' ? 'active' : ''}`}
            type="button"
            onClick={() => toggleMenu('grow')}
            aria-expanded={openMenu === 'grow'}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Icon name="sprout" className="icon-inline" aria-hidden="true" />
            Grow
          </button>

          {/* COOK Button */}
          <button
            className={`nav-link link-body-emphasis d-flex align-items-center gap-1 ${
              isActive('/recipes') || isActive('/nutrition') ? 'active' : ''
            } ${openMenu === 'cook' ? 'active' : ''}`}
            type="button"
            onClick={() => toggleMenu('cook')}
            aria-expanded={openMenu === 'cook'}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Icon name="dish" className="icon-inline" aria-hidden="true" />
            Cook
          </button>

          {/* SHARE Button */}
          <button
            className={`nav-link link-body-emphasis d-flex align-items-center gap-1 ${
              isActive('/community-hub') || isActive('/storytelling') || isActive('/about') ? 'active' : ''
            } ${openMenu === 'share' ? 'active' : ''}`}
            type="button"
            onClick={() => toggleMenu('share')}
            aria-expanded={openMenu === 'share'}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Icon name="globe" className="icon-inline" aria-hidden="true" />
            Share
          </button>

          <Link 
            className={`nav-item nav-link link-body-emphasis ${isActive('/challenges')}`} 
            to="/challenges"
            aria-current={location.pathname === '/challenges' ? 'page' : undefined}
          >
            <Icon name="trophy" className="icon-inline me-1 d-md-none" aria-hidden="true" />
            Challenges
          </Link>
        </nav>
      </div>

      {/* GROW Mega Menu Content */}
      {openMenu === 'grow' && (
        <div className="mega-menu-expand border-bottom bg-white shadow-sm mb-3">
          <div className="container py-4">
            <div className="row g-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="col-md-6">
                <Link to="/plant-care" className="text-decoration-none" onClick={() => setOpenMenu(null)}>
                  <div className="mega-card h-100">
                    <img 
                      src="https://images.pexels.com/photos/1022922/pexels-photo-1022922.jpeg?auto=compress&cs=tinysrgb&w=400" 
                      alt="Plant Care" 
                      className="mega-card-img rounded"
                    />
                    <div className="p-3">
                      <h6 className="fw-bold text-success d-flex align-items-center gap-2 mb-2">
                        <Icon name="sprout" />
                        Plant Care AI
                      </h6>
                      <p className="small text-muted mb-0">
                        Get personalized care plans with AI-powered plant identification
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-md-6">
                <Link to="/education" className="text-decoration-none" onClick={() => setOpenMenu(null)}>
                  <div className="mega-card h-100">
                    <img 
                      src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=400" 
                      alt="Education Hub" 
                      className="mega-card-img rounded"
                    />
                    <div className="p-3">
                      <h6 className="fw-bold text-primary d-flex align-items-center gap-2 mb-2">
                        <Icon name="book" />
                        Education Hub
                      </h6>
                      <p className="small text-muted mb-0">
                        Learning pathways and cultural food stories
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COOK Mega Menu Content */}
      {openMenu === 'cook' && (
        <div className="mega-menu-expand border-bottom bg-white shadow-sm mb-3">
          <div className="container py-4">
            <div className="row g-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="col-md-6">
                <Link to="/recipes" className="text-decoration-none" onClick={() => setOpenMenu(null)}>
                  <div className="mega-card h-100">
                    <img 
                      src="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400" 
                      alt="Plant-Based Recipes" 
                      className="mega-card-img rounded"
                    />
                    <div className="p-3">
                      <h6 className="fw-bold text-danger d-flex align-items-center gap-2 mb-2">
                        <Icon name="dish" />
                        Plant-Based Recipes
                      </h6>
                      <p className="small text-muted mb-0">
                        AI-powered recipe generation and meal planning
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-md-6">
                <Link to="/nutrition" className="text-decoration-none" onClick={() => setOpenMenu(null)}>
                  <div className="mega-card h-100">
                    <img 
                      src="https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=400" 
                      alt="Nutrition Guide" 
                      className="mega-card-img rounded"
                    />
                    <div className="p-3">
                      <h6 className="fw-bold text-warning d-flex align-items-center gap-2 mb-2">
                        <Icon name="heartPulse" />
                        Nutrition Guide
                      </h6>
                      <p className="small text-muted mb-0">
                        Understanding plant-based nutrition and health benefits
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE Mega Menu Content */}
      {openMenu === 'share' && (
        <div className="mega-menu-expand border-bottom bg-white shadow-sm mb-3">
          <div className="container py-4">
            <div className="row g-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="col-md-4">
                <Link to="/community-hub" className="text-decoration-none" onClick={() => setOpenMenu(null)}>
                  <div className="mega-card h-100">
                    <img 
                      src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400" 
                      alt="Community Hub" 
                      className="mega-card-img rounded"
                    />
                    <div className="p-3">
                      <h6 className="fw-bold text-info d-flex align-items-center gap-2 mb-2">
                        <Icon name="globe" />
                        Community Hub
                      </h6>
                      <p className="small text-muted mb-0">
                        Connect with food security advocates worldwide
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/storytelling" className="text-decoration-none" onClick={() => setOpenMenu(null)}>
                  <div className="mega-card h-100">
                    <img 
                      src="https://images.pexels.com/photos/3184435/pexels-photo-3184435.jpeg?auto=compress&cs=tinysrgb&w=400" 
                      alt="Seeds of Change" 
                      className="mega-card-img rounded"
                    />
                    <div className="p-3">
                      <h6 className="fw-bold text-secondary d-flex align-items-center gap-2 mb-2">
                        <Icon name="journal" />
                        Seeds of Change
                      </h6>
                      <p className="small text-muted mb-0">
                        Cultural food stories and heritage preservation
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/about" className="text-decoration-none" onClick={() => setOpenMenu(null)}>
                  <div className="mega-card h-100 d-flex align-items-center justify-content-center" style={{ minHeight: '160px' }}>
                    <div className="p-3 text-center">
                      <h6 className="fw-bold text-dark d-flex align-items-center justify-content-center gap-2 mb-2">
                        <Icon name="sprout" />
                        About Planted
                      </h6>
                      <p className="small text-muted mb-0">
                        Our mission and vision for sustainable food systems
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS */}
      <style>{`
        .mega-menu-expand {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .mega-card {
          transition: all 0.3s ease;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.1);
          background: white;
        }
        
        .mega-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
          border-color: rgba(0,0,0,0.2);
        }
        
        .mega-card-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }
        
        .nav-link.active {
          font-weight: 600;
        }
        
        .nav-link:hover {
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .mega-menu-expand .row {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
