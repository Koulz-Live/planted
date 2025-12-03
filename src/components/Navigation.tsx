import { Link, useLocation } from 'react-router-dom';

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
            <Link className="link-secondary text-decoration-none" to="/community">Subscribe</Link>
          </div>
          <div className="col-4 text-center">
            <Link className="blog-header-logo text-body-emphasis text-decoration-none fs-2 fw-bold" to="/">
              🌱 Planted
            </Link>
          </div>
          <div className="col-4 d-flex justify-content-end align-items-center">
            <Link className="link-secondary" to="/learning" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="mx-3" role="img" viewBox="0 0 24 24">
                <title>Search</title>
                <circle cx="10.5" cy="10.5" r="7.5"></circle>
                <path d="M21 21l-5.2-5.2"></path>
              </svg>
            </Link>
            <Link className="btn btn-sm btn-outline-success" to="/community">Join Community</Link>
          </div>
        </div>
      </header>

      {/* Horizontal scrolling navigation */}
      <div className="nav-scroller py-1 mb-3 border-bottom">
        <nav className="nav nav-underline justify-content-between">
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/')}`} to="/">Home</Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/plant-care')}`} to="/plant-care">Plant Care</Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/recipes')}`} to="/recipes">Recipes</Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/nutrition')}`} to="/nutrition">Nutrition</Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/learning')}`} to="/learning">Learning</Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/storytelling')}`} to="/storytelling">Stories</Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/community')}`} to="/community">Community</Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/challenges')}`} to="/challenges">Challenges</Link>
          <Link className={`nav-item nav-link link-body-emphasis ${isActive('/soc')}`} to="/soc">SOC</Link>
        </nav>
      </div>
    </div>
  );
}
