import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { HomePage, AboutPage, PlantCarePage, RecipesPage, NutritionPage, LearningPage, StorytellingPage, CommunityPage, ChallengesPage, SOCPage, SOCManagementPage } from './pages';
import './App.css';

function App() {
  return (
    <Router>
      <a href="#main-content" className="skip-to-main">Skip to main content</a>
      <Navigation />
      <main id="main-content" className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/plant-care" element={<PlantCarePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/storytelling" element={<StorytellingPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/soc" element={<SOCPage />} />
          <Route path="/soc-management" element={<SOCManagementPage />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </Router>
  );
}

export default App;
