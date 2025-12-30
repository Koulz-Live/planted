import { Link, useLocation } from 'react-router-dom';
import { Icon } from './Icon';

export function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
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

      {/* Horizontal scrolling navigation */}
      <div className="nav-scroller py-1 mb-3 border-bottom">
        <nav className="nav nav-underline justify-content-between" aria-label="Main navigation">
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/')}`} to="/" aria-current={location.pathname === '/' ? 'page' : undefined}>
            <Icon name="globe" className="icon-inline me-1 d-md-none" aria-hidden="true" />
            Home
          </Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/about')}`} to="/about" aria-current={location.pathname === '/about' ? 'page' : undefined}>About</Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/plant-care')}`} to="/plant-care" aria-current={location.pathname === '/plant-care' ? 'page' : undefined}>
            <Icon name="sprout" className="icon-inline me-1 d-md-none" aria-hidden="true" />
            Plant Care
          </Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/recipes')}`} to="/recipes" aria-current={location.pathname === '/recipes' ? 'page' : undefined}>
            <Icon name="dish" className="icon-inline me-1 d-md-none" aria-hidden="true" />
            Recipes
          </Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/nutrition')}`} to="/nutrition" aria-current={location.pathname === '/nutrition' ? 'page' : undefined}>
            <Icon name="heart" className="icon-inline me-1 d-md-none" aria-hidden="true" />
            Nutrition
          </Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/education') || isActive('/learning') || isActive('/storytelling')}`} to="/education" aria-current={location.pathname === '/education' || location.pathname === '/learning' || location.pathname === '/storytelling' ? 'page' : undefined}>
            <Icon name="book" className="icon-inline me-1 d-md-none" aria-hidden="true" />
            Education
          </Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/community-hub') || isActive('/community') || isActive('/challenges')}`} to="/community-hub" aria-current={location.pathname === '/community-hub' || location.pathname === '/community' || location.pathname === '/challenges' ? 'page' : undefined}>
            <Icon name="people" className="icon-inline me-1 d-md-none" aria-hidden="true" />
            Community
          </Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/soc')}`} to="/soc" aria-current={location.pathname === '/soc' ? 'page' : undefined}>SOC</Link>
        </nav>
      </div>
    </div>
  );
}
