import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage, AboutPage, PlantCarePage, RecipesPage, NutritionPage, LearningPage, StorytellingPage, CommunityPage, ChallengesPage, SOCPage } from './pages';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <main className="container">
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
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
