import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">🌱 Planted</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/plant-care">Plant Care</Link>
          <Link className="nav-link" to="/recipes">Recipes</Link>
          <Link className="nav-link" to="/nutrition">Nutrition</Link>
          <Link className="nav-link" to="/learning">Learning</Link>
          <Link className="nav-link" to="/storytelling">Stories</Link>
          <Link className="nav-link" to="/community">Community</Link>
          <Link className="nav-link" to="/challenges">Challenges</Link>
        </div>
      </div>
    </nav>
  );
}
