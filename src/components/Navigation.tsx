import { Link, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import { useState } from 'react';

export function Navigation() {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleMenuEnter = (menu: string) => {
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    setActiveMenu(null);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  return (
    <div className="container">
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
              className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm" 
              to="/community-hub" 
              aria-label="Join our community"
              style={{ 
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              <Icon name="people" className="icon-inline" aria-hidden="true" />
              <span className="d-none d-md-inline">Join Community</span>
              <span className="d-inline d-md-none">Join</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mega Menu Navigation */}
      <div className="nav-scroller py-1 mb-3 border-bottom position-relative">
        <nav className="nav nav-underline justify-content-center gap-5" aria-label="Main navigation">
          <Link 
            className={`nav-item nav-link link-body-emphasis ${isActive('/')}`} 
            to="/" 
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            <Icon name="globe" className="icon-inline me-1 d-md-none" aria-hidden="true" />
            Home
          </Link>

          {/* GROW Menu */}
          <div 
            className="position-relative"
            onMouseEnter={() => handleMenuEnter('grow')}
            onMouseLeave={handleMenuLeave}
          >
            <button 
              className={`nav-item nav-link link-body-emphasis btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                isActive('/plant-care') || isActive('/education') || isActive('/learning') ? 'active' : ''
              }`}
              style={{ border: 'none', padding: '0.5rem 0', background: 'transparent' }}
            >
              <Icon name="sprout" className="icon-inline" aria-hidden="true" />
              Grow
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
              </svg>
            </button>

            {/* GROW Mega Menu Dropdown */}
            {activeMenu === 'grow' && (
              <div 
                className="position-absolute start-50 translate-middle-x mt-2 bg-white border rounded shadow-lg p-4"
                style={{ 
                  width: '600px',
                  maxWidth: '90vw',
                  zIndex: 1050,
                  top: '100%'
                }}
              >
                <div className="row g-3">
                  {/* Plant Care */}
                  <div className="col-md-6">
                    <Link 
                      to="/plant-care" 
                      className="text-decoration-none"
                      onClick={closeMenu}
                    >
                      <div className="card h-100 border-0 hover-lift" style={{ transition: 'transform 0.2s' }}>
                        <img 
                          src="https://images.pexels.com/photos/1022922/pexels-photo-1022922.jpeg?auto=compress&cs=tinysrgb&w=400" 
                          alt="Plant Care" 
                          className="card-img-top rounded"
                          style={{ height: '120px', objectFit: 'cover' }}
                        />
                        <div className="card-body px-0">
                          <h6 className="card-title fw-bold text-success d-flex align-items-center gap-2">
                            <Icon name="sprout" />
                            Plant Care AI
                          </h6>
                          <p className="card-text small text-muted mb-0">
                            Get personalized care plans with AI-powered plant identification
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Education Hub */}
                  <div className="col-md-6">
                    <Link 
                      to="/education" 
                      className="text-decoration-none"
                      onClick={closeMenu}
                    >
                      <div className="card h-100 border-0 hover-lift" style={{ transition: 'transform 0.2s' }}>
                        <img 
                          src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=400" 
                          alt="Education Hub" 
                          className="card-img-top rounded"
                          style={{ height: '120px', objectFit: 'cover' }}
                        />
                        <div className="card-body px-0">
                          <h6 className="card-title fw-bold text-primary d-flex align-items-center gap-2">
                            <Icon name="book" />
                            Education Hub
                          </h6>
                          <p className="card-text small text-muted mb-0">
                            Learning pathways and cultural food stories
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COOK Menu */}
          <div 
            className="position-relative"
            onMouseEnter={() => handleMenuEnter('cook')}
            onMouseLeave={handleMenuLeave}
          >
            <button 
              className={`nav-item nav-link link-body-emphasis btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                isActive('/recipes') || isActive('/nutrition') ? 'active' : ''
              }`}
              style={{ border: 'none', padding: '0.5rem 0', background: 'transparent' }}
            >
              <Icon name="dish" className="icon-inline" aria-hidden="true" />
              Cook
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
              </svg>
            </button>

            {/* COOK Mega Menu Dropdown */}
            {activeMenu === 'cook' && (
              <div 
                className="position-absolute start-50 translate-middle-x mt-2 bg-white border rounded shadow-lg p-4"
                style={{ 
                  width: '600px',
                  maxWidth: '90vw',
                  zIndex: 1050,
                  top: '100%'
                }}
              >
                <div className="row g-3">
                  {/* Recipes */}
                  <div className="col-md-6">
                    <Link 
                      to="/recipes" 
                      className="text-decoration-none"
                      onClick={closeMenu}
                    >
                      <div className="card h-100 border-0 hover-lift" style={{ transition: 'transform 0.2s' }}>
                        <img 
                          src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400" 
                          alt="Recipes" 
                          className="card-img-top rounded"
                          style={{ height: '120px', objectFit: 'cover' }}
                        />
                        <div className="card-body px-0">
                          <h6 className="card-title fw-bold text-warning d-flex align-items-center gap-2">
                            <Icon name="dish" />
                            Recipe Generator
                          </h6>
                          <p className="card-text small text-muted mb-0">
                            AI-powered recipes from your ingredients
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Nutrition */}
                  <div className="col-md-6">
                    <Link 
                      to="/nutrition" 
                      className="text-decoration-none"
                      onClick={closeMenu}
                    >
                      <div className="card h-100 border-0 hover-lift" style={{ transition: 'transform 0.2s' }}>
                        <img 
                          src="https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=400" 
                          alt="Nutrition Coach" 
                          className="card-img-top rounded"
                          style={{ height: '120px', objectFit: 'cover' }}
                        />
                        <div className="card-body px-0">
                          <h6 className="card-title fw-bold text-danger d-flex align-items-center gap-2">
                            <Icon name="heart" />
                            Nutrition Coach
                          </h6>
                          <p className="card-text small text-muted mb-0">
                            Personalized nutrition plans and meal prep
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SHARE Menu */}
          <div 
            className="position-relative"
            onMouseEnter={() => handleMenuEnter('share')}
            onMouseLeave={handleMenuLeave}
          >
            <button 
              className={`nav-item nav-link link-body-emphasis btn btn-link text-decoration-none d-flex align-items-center gap-1 ${
                isActive('/community-hub') || isActive('/community') || isActive('/challenges') || isActive('/soc') ? 'active' : ''
              }`}
              style={{ border: 'none', padding: '0.5rem 0', background: 'transparent' }}
            >
              <Icon name="people" className="icon-inline" aria-hidden="true" />
              Share
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
              </svg>
            </button>

            {/* SHARE Mega Menu Dropdown */}
            {activeMenu === 'share' && (
              <div 
                className="position-absolute start-50 translate-middle-x mt-2 bg-white border rounded shadow-lg p-4"
                style={{ 
                  width: '600px',
                  maxWidth: '90vw',
                  zIndex: 1050,
                  top: '100%'
                }}
              >
                <div className="row g-3">
                  {/* Community Hub */}
                  <div className="col-md-6">
                    <Link 
                      to="/community-hub" 
                      className="text-decoration-none"
                      onClick={closeMenu}
                    >
                      <div className="card h-100 border-0 hover-lift" style={{ transition: 'transform 0.2s' }}>
                        <img 
                          src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400" 
                          alt="Community Hub" 
                          className="card-img-top rounded"
                          style={{ height: '120px', objectFit: 'cover' }}
                        />
                        <div className="card-body px-0">
                          <h6 className="card-title fw-bold text-primary d-flex align-items-center gap-2">
                            <Icon name="people" />
                            Community Hub
                          </h6>
                          <p className="card-text small text-muted mb-0">
                            Connect, share recipes, and join challenges
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* SOC */}
                  <div className="col-md-6">
                    <Link 
                      to="/soc" 
                      className="text-decoration-none"
                      onClick={closeMenu}
                    >
                      <div className="card h-100 border-0 hover-lift" style={{ transition: 'transform 0.2s' }}>
                        <img 
                          src="https://images.pexels.com/photos/1268558/pexels-photo-1268558.jpeg?auto=compress&cs=tinysrgb&w=400" 
                          alt="Soil Organic Carbon" 
                          className="card-img-top rounded"
                          style={{ height: '120px', objectFit: 'cover' }}
                        />
                        <div className="card-body px-0">
                          <h6 className="card-title fw-bold text-success d-flex align-items-center gap-2">
                            🌍
                            SOC Impact
                          </h6>
                          <p className="card-text small text-muted mb-0">
                            Track your soil health and carbon impact
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* About Link */}
                <div className="mt-3 pt-3 border-top">
                  <Link 
                    to="/about" 
                    className="text-decoration-none d-flex align-items-center gap-2 text-muted small"
                    onClick={closeMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                    </svg>
                    About Planted
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* CSS for hover effects */}
      <style>{`
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        
        .nav-link.active {
          font-weight: 600;
        }
        
        .nav-link button:hover {
          color: var(--bs-link-hover-color);
        }
      `}</style>
    </div>
  );
}
