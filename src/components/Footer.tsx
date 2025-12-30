import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export function Footer() {
  return (
    <footer className="py-5 bg-body-tertiary border-top">
      <div className="container">
        <div className="row">
          {/* Brand Column */}
          <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
            <h5 className="d-flex align-items-center gap-2 mb-3">
              <Icon name="sprout" className="text-success icon-inline" aria-hidden="true" />
              <span className="fw-bold">Planted</span>
            </h5>
            <p className="text-body-secondary small">
              A platform for sustainable living, plant-based nutrition, and global peace through food. 
              Built with <Icon name="sprout" className="text-success icon-inline" aria-hidden="true" /> and care.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-body-secondary" aria-label="Social media link 1">
                <Icon name="globe" />
              </a>
              <a href="#" className="text-body-secondary" aria-label="Social media link 2">
                <Icon name="heart" />
              </a>
              <a href="#" className="text-body-secondary" aria-label="Social media link 3">
                <Icon name="people" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/recipes" className="text-body-secondary text-decoration-none d-flex align-items-center gap-2">
                  <Icon name="basket" className="icon-inline" aria-hidden="true" />
                  <span>Browse Recipes</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/recipes" className="text-body-secondary text-decoration-none d-flex align-items-center gap-2">
                  <Icon name="dish" className="icon-inline" aria-hidden="true" />
                  <span>Generate with AI</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/nutrition" className="text-body-secondary text-decoration-none d-flex align-items-center gap-2">
                  <Icon name="heart" className="icon-inline" aria-hidden="true" />
                  <span>Nutrition</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/community" className="text-body-secondary text-decoration-none d-flex align-items-center gap-2">
                  <Icon name="people" className="icon-inline" aria-hidden="true" />
                  <span>Community</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover Column */}
          <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
            <h6 className="fw-bold mb-3">Discover</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/plant-care" className="text-body-secondary text-decoration-none">Plant Care</Link>
              </li>
              <li className="mb-2">
                <Link to="/education" className="text-body-secondary text-decoration-none">Education</Link>
              </li>
              <li className="mb-2">
                <Link to="/challenges" className="text-body-secondary text-decoration-none">Challenges</Link>
              </li>
              <li className="mb-2">
                <Link to="/soc" className="text-body-secondary text-decoration-none">SOC</Link>
              </li>
            </ul>
          </div>

          {/* Join Community CTA Column */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3">Stay Connected</h6>
            <p className="text-body-secondary small mb-3">
              Join our community for recipes, tips, and sustainable living inspiration.
            </p>
            <Link 
              to="/community" 
              className="btn btn-success w-100 mb-3"
              aria-label="Join our community"
            >
              <Icon name="people" className="icon-inline me-2" aria-hidden="true" />
              Join Community
            </Link>
            <Link 
              to="/about" 
              className="text-body-secondary text-decoration-none small d-block"
            >
              About Us
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <hr className="my-4" />
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="text-body-secondary small mb-0">
              © {new Date().getFullYear()} Planted. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#" className="text-body-secondary text-decoration-none small">Privacy</a>
              </li>
              <li className="list-inline-item ms-3">
                <a href="#" className="text-body-secondary text-decoration-none small">Terms</a>
              </li>
              <li className="list-inline-item ms-3">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="btn btn-link text-body-secondary text-decoration-none small p-0"
                  aria-label="Back to top"
                >
                  Back to top ↑
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
