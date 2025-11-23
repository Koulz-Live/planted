#!/bin/bash

# Create index files for pages
cat > src/pages/index.tsx << 'PAGES'
export { default as HomePage } from './HomePage';
export { default as PlantCarePage } from './PlantCarePage';
export { default as RecipesPage } from './RecipesPage';
export { default as NutritionPage } from './NutritionPage';
export { default as LearningPage } from './LearningPage';
export { default as StorytellingPage } from './StorytellingPage';
export { default as CommunityPage } from './CommunityPage';
export { default as ChallengesPage } from './ChallengesPage';
PAGES

# Create stub pages
for page in HomePage PlantCarePage RecipesPage NutritionPage LearningPage StorytellingPage CommunityPage ChallengesPage; do
cat > "src/pages/${page}.tsx" << PAGEFILE
export default function ${page}() {
  return (
    <div className="container mt-5">
      <h1>${page}</h1>
      <p>Coming soon... This page is being regenerated.</p>
    </div>
  );
}
PAGEFILE
done

# Create Navigation component
cat > src/components/Navigation.tsx << 'NAV'
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
NAV

# Create types/api.ts stub
mkdir -p src/types
cat > src/types/api.ts << 'TYPES'
// API Types for Planted App
export interface PlantCareRequest {
  plantName: string;
  plantType: string;
  location: string;
  observations: Array<{
    date: string;
    notes: string;
    photoUrl?: string;
  }>;
  plantPhotoUrls?: string[];
}

export interface RecipeRequest {
  availableIngredients: string[];
  dietaryRestrictions: string[];
  cuisinePreference: string;
  skillLevel: string;
  pantryPhotoUrls?: string[];
}

export interface NutritionCoachRequest {
  goal: string;
  dietaryRestrictions: string[];
  culturalPreferences: string;
  householdSize: number;
  mealPhotoUrls?: string[];
}

export interface StorytellingRequest {
  dishName: string;
  region: string;
  foodPhotoUrls?: string[];
}
TYPES

# Create services/api.ts stub
mkdir -p src/services
cat > src/services/api.ts << 'API'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`);
    return response.json();
  },
  post: async (endpoint: string, data: unknown) => {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
API

echo "Stub files created! App should now compile."
