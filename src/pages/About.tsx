import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      {/* Hero Section */}
      <div 
        className="p-4 p-md-5 mb-4 rounded text-body-emphasis" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic text-white">About Planted</h1>
          <p className="lead my-3 text-white">
            Learn more about our mission, values, and the ways we serve communities pursuing sustainable, plant-forward futures.
          </p>
        </div>
      </div>

      <div className="about-page py-5">
        <div className="col-lg-10 mx-auto">
          <h3 className="pb-4 mb-4 fst-italic border-bottom">Recent Updates</h3>

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
