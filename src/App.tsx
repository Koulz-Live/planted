import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { HomePage, AboutPage, PlantCarePage, RecipesPage, NutritionPage, EducationPage, CommunityHubPage, SOCPage, SOCManagementPage } from './pages';
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
          <Route path="/education" element={<EducationPage />} />
          <Route path="/learning" element={<EducationPage />} />
          <Route path="/storytelling" element={<EducationPage />} />
          <Route path="/community-hub" element={<CommunityHubPage />} />
          <Route path="/community" element={<CommunityHubPage />} />
          <Route path="/challenges" element={<CommunityHubPage />} />
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
