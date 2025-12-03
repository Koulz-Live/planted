import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="py-5 text-center text-body-secondary bg-body-tertiary">
      <div className="container">
        <p>
          Planted - A platform for sustainable living, plant-based nutrition, and global peace through food. 
          Built with <span className="text-success">🌱</span> and care.
        </p>
        <p className="mb-0">
          <Link to="/" className="link-secondary text-decoration-none">Back to top</Link>
        </p>
      </div>
    </footer>
  );
}
