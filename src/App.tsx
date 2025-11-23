import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HomePage, PlantCarePage, RecipesPage, NutritionPage, LearningPage, StorytellingPage, CommunityPage, ChallengesPage } from './pages';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plant-care" element={<PlantCarePage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/storytelling" element={<StorytellingPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
