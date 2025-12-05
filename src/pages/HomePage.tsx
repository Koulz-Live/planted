import { Link } from 'react-router-dom';
import './HomePage.css';

const quickLinks = [
  {
    title: 'Recipe Generator',
    description: 'Create culturally rooted, AI-powered meals.',
    route: '/recipes',
    icon: '🍽️'
  },
  {
    title: 'Plant Care',
    description: 'Grow herbs and produce at home.',
    route: '/plant-care',
    icon: '🌱'
  },
  {
    title: 'Nutrition Guide',
    description: 'Dive into evidence-based nutrition lessons.',
    route: '/nutrition',
    icon: '🥗'
  },
  {
    title: 'Learning Modules',
    description: 'Explore sustainable living curriculum.',
    route: '/learning',
    icon: '📚'
  },
  {
    title: 'Community Hub',
    description: 'Share wins and connect with peers.',
    route: '/community',
    icon: '👥'
  },
  {
    title: 'Challenges',
    description: 'Join collective impact missions.',
    route: '/challenges',
    icon: '🎯'
  },
  {
    title: 'Storytelling',
    description: 'Document and honor food traditions.',
    route: '/storytelling',
    icon: '📖'
  },
  {
    title: 'SOC Dashboard',
    description: 'Track supply chain resilience.',
    route: '/soc',
    icon: '🏭'
  }
];

const featuredServices = [
  {
    title: ['Plant', 'Care AI'],
    description:
      'Share a few plant details and receive climate-aware care plans with watering schedules, soil tips, and regenerative growing practices.',
    tags: ['Home', 'Garden', 'Landscape Design', 'Expert'],
    image: 'https://images.pexels.com/photos/139680/pexels-photo-139680.jpeg?auto=compress&cs=tinysrgb&w=1200',
    route: '/plant-care'
  },
  {
    title: ['Recipes', 'AI'],
    description:
      'Share dietary preferences, pantry staples, and cultural tastes to generate personalized, respectful recipes powered by AI.',
    tags: ['Indoor', 'Balcony'],
    image: 'https://images.pexels.com/photos/450516/pexels-photo-450516.jpeg?auto=compress&cs=tinysrgb&w=1200',
    route: '/recipes'
  },
  {
    title: ['Meal Prep', 'Coach'],
    description:
      'Get meal prep plans tuned to household size, health goals, and available time plus nutritional analysis from uploaded dishes.',
    tags: ['Meal Prep', 'Nutrition Analysis'],
    image: 'https://images.pexels.com/photos/450062/pexels-photo-450062.jpeg?auto=compress&cs=tinysrgb&w=1200',
    route: '/nutrition'
  },
  {
    title: ['Food', 'Stories'],
    description:
      'Explore cultural heritage, ancestral wisdom, and the science behind traditional dishes that connect communities worldwide.',
    tags: ['Food History', 'Plant History'],
    image: 'https://images.pexels.com/photos/450545/pexels-photo-450545.jpeg?auto=compress&cs=tinysrgb&w=1200',
    route: '/storytelling'
  }
];

export default function HomePage() {
  return (
    <>
      {/* Featured Hero Section */}
      <div className="p-4 p-md-5 mb-4 rounded text-body-emphasis bg-body-secondary">
        <div className="col-lg-6 px-0">
          <h1 className="display-4 fst-italic">Growing Together for a Sustainable Future</h1>
          <p className="lead my-3">
            Discover plant-based recipes, learn sustainable practices, and join a global community 
            working toward food security, environmental health, and peace through conscious living.
          </p>
          <p className="lead mb-0">
            <Link to="/learning" className="text-body-emphasis fw-bold text-decoration-none">
              Start learning →
            </Link>
          </p>
        </div>
      </div>

      {/* Featured Cards Grid */}
      <div className="row mb-2">
        <div className="col-md-6">
          <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
            <div className="col p-4 d-flex flex-column position-static">
              <strong className="d-inline-block mb-2 text-success-emphasis">Nutrition</strong>
              <h3 className="mb-0">Plant-Based Recipes</h3>
              <div className="mb-1 text-body-secondary">AI-Powered Recipe Generation</div>
              <p className="card-text mb-auto">
                Generate culturally-respectful, nutritious recipes based on your dietary needs, 
                available ingredients, and preferences.
              </p>
              <Link to="/recipes" className="icon-link gap-1 icon-link-hover stretched-link text-decoration-none">
                Explore Recipes
                <svg className="bi" width="16" height="16" fill="currentColor">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </Link>
            </div>
            <div className="col-auto d-none d-lg-block">
              <div className="bd-placeholder-img" style={{width: '200px', height: '250px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem'}}>
                🥗
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
            <div className="col p-4 d-flex flex-column position-static">
              <strong className="d-inline-block mb-2 text-primary-emphasis">Learning</strong>
              <h3 className="mb-0">Educational Modules</h3>
              <div className="mb-1 text-body-secondary">Sustainable Living Courses</div>
              <p className="mb-auto">
                Interactive learning paths covering nutrition, culture, sustainability, and global 
                cuisine with progress tracking and ethical focus.
              </p>
              <Link to="/learning" className="icon-link gap-1 icon-link-hover stretched-link text-decoration-none">
                Start Learning
                <svg className="bi" width="16" height="16" fill="currentColor">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </Link>
            </div>
            <div className="col-auto d-none d-lg-block">
              <div className="bd-placeholder-img" style={{width: '200px', height: '250px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem'}}>
                📚
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-5">
        <div className="col-12 col-xl-12">
          <section className="services-section mb-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="services-header">| Services |</div>
              <Link to="/learning" className="services-link text-decoration-none">
                See more services
              </Link>
            </div>
            <div className="services-accordion mt-3">
              {featuredServices.map((service) => (
                <div className="services-panel" key={service.title.join('-')}>
                  <Link
                    to={service.route}
                    className="service-card text-white text-decoration-none"
                    style={{ backgroundImage: `url(${service.image})` }}
                  >
                    <div className="service-card-body">
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div className="service-tags">
                          {service.tags.map((tag) => (
                            <span className="service-tag" key={`${service.route}-${tag}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="service-arrow" aria-hidden="true">↗</div>
                      </div>
                      <div className="service-long">
                        <h3 className="service-title mb-3">
                          {service.title.map((line, idx) => (
                            <span key={`${service.route}-line-${idx}`} className="d-block">
                              {line}
                            </span>
                          ))}
                        </h3>
                        <p className="service-desc mb-0">{service.description}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="quick-links-section mb-5">
            <div className="text-center text-md-start mb-4">
              <div className="quick-links-eyebrow mb-2">Navigation</div>
              <h2 className="quick-links-heading">
                <span>{quickLinks.length} quick links</span> — one platform
              </h2>
            </div>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 g-lg-4 justify-content-center justify-content-lg-start">
              {quickLinks.map((link, index) => (
                <div className="col" key={link.title}>
                  <Link to={link.route} className="text-decoration-none text-reset">
                    <div className="card quick-link-card h-100 p-3 p-lg-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className="quick-link-label">{String(index + 1).padStart(2, '0')}</span>
                        <span className="quick-link-badge" aria-hidden="true">{link.icon}</span>
                      </div>
                      <h5 className="quick-link-title mb-1">{link.title}</h5>
                      <p className="quick-link-text mb-0">{link.description}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <h3 className="pb-4 mb-4 fst-italic border-bottom">
            Recent Updates
          </h3>

          <article className="blog-post">
            <h2 className="display-5 link-body-emphasis mb-1">Welcome to Planted</h2>
            <p className="blog-post-meta">December 3, 2025</p>
            
            <p>
              Planted is your comprehensive platform for sustainable living, plant-based nutrition, 
              and building a more peaceful world through conscious food choices.
            </p>
            <hr />
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h4 className="fst-italic">About Planted</h4>
              <p className="mb-0">
                A platform dedicated to sustainable living, plant-based nutrition, and global peace 
                through conscious food choices. Join us in creating a healthier planet, one meal at a time.
              </p>
            </div>

            <div className="p-4 mb-4 bg-body-tertiary rounded">
              <h4 className="fst-italic">Core Values</h4>
              <ol className="list-unstyled mb-0">
                <li>🌍 Environmental Sustainability</li>
                <li>🤝 Cultural Respect</li>
                <li>💚 Health & Wellness</li>
                <li>✌️ Peace Through Food</li>
              </ol>
            </div>
            
            <h3>Our Mission</h3>
            <p>
              We believe that food is a powerful tool for change. By embracing plant-based nutrition, 
              respecting cultural food traditions, and sharing knowledge, we can create a more sustainable 
              and equitable future for all.
            </p>

            <h3>What We Offer</h3>
            <ul>
              <li><strong>AI-Powered Recipe Generation</strong> – Create personalized, culturally-respectful recipes</li>
              <li><strong>Plant Care Guidance</strong> – Learn to grow your own food at home</li>
              <li><strong>Nutrition Education</strong> – Understand the science of plant-based eating</li>
              <li><strong>Community Challenges</strong> – Join collective actions for positive impact</li>
              <li><strong>Cultural Storytelling</strong> – Share and discover food traditions from around the world</li>
            </ul>

            <h3>Get Started</h3>
            <p>
              Explore our <Link to="/learning">learning modules</Link> to begin your journey, 
              generate your first <Link to="/recipes">plant-based recipe</Link>, or 
              join our <Link to="/community">community</Link> to connect with like-minded individuals.
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
