import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import './LearningPage.css';

interface Module {
  id: string;
  title: string;
  category: 'nutrition' | 'culture' | 'sustainability' | 'cooking';
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  milestones: string[];
  ethicalFocus: string;
  completed?: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  startedAt: Date;
  completedAt?: Date;
  progress: number;
}

const learningModules: Omit<Module, 'id' | 'completed' | 'startedAt' | 'completedAt'>[] = [
  {
    title: 'Foundations of Plant-Based Nutrition',
    category: 'nutrition',
    description: 'Learn the science behind plant-based nutrition, including protein sources, essential nutrients, meal planning strategies, and how to meet all nutritional needs on a plant-forward diet.',
    duration: '2 hours',
    difficulty: 'beginner',
    milestones: [
      'Understanding macronutrients in plants',
      'Complete protein combinations',
      'Iron, B12, and calcium sources',
      'Creating balanced meal plans'
    ],
    ethicalFocus: 'Reducing environmental impact through dietary choices'
  },
  {
    title: 'Cultural Food Traditions & Respect',
    category: 'culture',
    description: 'Explore the deep cultural significance of food traditions around the world. Learn how to approach, appreciate, and honor food heritage with respect and understanding.',
    duration: '1.5 hours',
    difficulty: 'beginner',
    milestones: [
      'Understanding food as cultural identity',
      'Sacred foods and ceremonial meals',
      'Cross-cultural culinary exchange',
      'Avoiding cultural appropriation'
    ],
    ethicalFocus: 'Promoting cultural understanding through shared meals'
  },
  {
    title: 'Sustainable Cooking Practices',
    category: 'sustainability',
    description: 'Master techniques for reducing food waste, sourcing local ingredients, composting, energy-efficient cooking, and creating a sustainable kitchen ecosystem.',
    duration: '2.5 hours',
    difficulty: 'intermediate',
    milestones: [
      'Zero-waste meal prep strategies',
      'Root-to-stem cooking techniques',
      'Local and seasonal sourcing',
      'Composting and kitchen gardens'
    ],
    ethicalFocus: 'Minimizing environmental footprint in the kitchen'
  },
  {
    title: 'Global Cuisine Masterclass',
    category: 'cooking',
    description: 'Dive deep into authentic cooking techniques from Mediterranean, Asian, African, and Latin American cuisines. Learn traditional methods and flavor profiles.',
    duration: '3 hours',
    difficulty: 'intermediate',
    milestones: [
      'Mediterranean flavor building',
      'Asian fermentation techniques',
      'African grain and legume dishes',
      'Latin American spice blends'
    ],
    ethicalFocus: 'Celebrating culinary diversity and authenticity'
  },
  {
    title: 'Advanced Fermentation & Preservation',
    category: 'cooking',
    description: 'Learn ancient and modern fermentation techniques for preserving food, enhancing nutrition, and creating complex flavors. Includes kimchi, kombucha, sourdough, and more.',
    duration: '2 hours',
    difficulty: 'advanced',
    milestones: [
      'Lacto-fermentation basics',
      'Sourdough starter cultivation',
      'Kombucha and fermented drinks',
      'Safety and troubleshooting'
    ],
    ethicalFocus: 'Reviving traditional preservation methods'
  },
  {
    title: 'Food Justice & Ethical Sourcing',
    category: 'sustainability',
    description: 'Understand the social justice issues in the food system, from fair trade to food deserts. Learn how to make ethical purchasing decisions and support equitable food systems.',
    duration: '1.5 hours',
    difficulty: 'intermediate',
    milestones: [
      'Understanding food deserts',
      'Fair trade and worker rights',
      'Supporting local farmers',
      'Community food initiatives'
    ],
    ethicalFocus: 'Advocating for equitable food access'
  }
];

const categoryColors = {
  nutrition: '#ff9a9e',
  culture: '#a8edea',
  sustainability: '#8FBC8F',
  cooking: '#f4a460'
};

const difficultyLabels = {
  beginner: '🌱 Beginner',
  intermediate: '🌿 Intermediate',
  advanced: '🌳 Advanced'
};

export default function LearningPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const q = query(
        collection(db, 'learningProgress'),
        where('userId', '==', 'demo-user')
      );
      const snapshot = await getDocs(q);
      
      const progressMap = new Map<string, UserProgress>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        progressMap.set(data.moduleId, {
          id: doc.id,
          userId: data.userId,
          moduleId: data.moduleId,
          startedAt: data.startedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
          progress: data.progress || 0
        });
      });

      setUserProgress(progressMap);

      // Merge progress with modules
      const modulesWithProgress = learningModules.map((module, index) => {
        const moduleId = `module-${index}`;
        const progress = progressMap.get(moduleId);
        return {
          ...module,
          id: moduleId,
          completed: progress?.completedAt !== undefined,
          startedAt: progress?.startedAt,
          completedAt: progress?.completedAt
        };
      });

      setModules(modulesWithProgress);
    } catch (err) {
      console.error('Error loading progress:', err);
      // Initialize modules without progress
      setModules(learningModules.map((m, i) => ({ ...m, id: `module-${i}` })));
    } finally {
      setLoading(false);
    }
  };

  const startModule = async (module: Module) => {
    try {
      await addDoc(collection(db, 'learningProgress'), {
        userId: 'demo-user',
        moduleId: module.id,
        startedAt: Timestamp.now(),
        progress: 0
      });
      await loadUserProgress();
    } catch (err) {
      console.error('Error starting module:', err);
    }
  };

  const completeModule = async (module: Module) => {
    try {
      const progress = userProgress.get(module.id);
      if (progress) {
        await updateDoc(doc(db, 'learningProgress', progress.id), {
          completedAt: Timestamp.now(),
          progress: 100
        });
        await loadUserProgress();
      }
    } catch (err) {
      console.error('Error completing module:', err);
    }
  };

  const getStats = () => {
    const completed = modules.filter(m => m.completed).length;
    const inProgress = modules.filter(m => m.startedAt && !m.completed).length;
    return { completed, inProgress, total: modules.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="learning-page">
        <div className="lp-loading">Loading modules...</div>
      </div>
    );
  }

  return (
    <div className="learning-page">
      {/* Top Navigation */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-brand">
            <div className="lp-brand-icon">📚</div>
            <span>Planted</span>
          </div>
          <nav className="lp-nav-links">
            <a href="/">Home</a>
            <a href="/plant-care">Plant Care</a>
            <a href="/recipes">Recipes</a>
            <a href="/nutrition">Nutrition</a>
            <a href="/community">Community</a>
            <a href="/learning" className="active">Learning</a>
          </nav>
        </div>
      </header>

      <main className="lp-shell">
        {/* Hero Header */}
        <header className="lp-hero-header">
          <div className="lp-eyebrow">
            <span>🎓</span>
            Educational Pathways
          </div>
          <h1 className="lp-title">Learning Pathways</h1>
          <p className="lp-subtitle">
            Explore structured learning modules on nutrition, cultural respect, sustainable cooking, 
            and ethical food systems. Track your progress and earn certificates.
          </p>
        </header>

        {/* Progress Stats */}
        <section className="lp-stats-bar">
          <div className="lp-stat">
            <div className="lp-stat-value">{stats.completed}</div>
            <div className="lp-stat-label">Completed</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-value">{stats.inProgress}</div>
            <div className="lp-stat-label">In Progress</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-value">{stats.total - stats.completed}</div>
            <div className="lp-stat-label">Remaining</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-value">{Math.round((stats.completed / stats.total) * 100)}%</div>
            <div className="lp-stat-label">Overall Progress</div>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="lp-modules-grid">
          {modules.map((module) => (
            <article 
              key={module.id} 
              className={`lp-module-card ${module.completed ? 'completed' : ''}`}
              style={{ '--category-color': categoryColors[module.category] } as React.CSSProperties}
            >
              <div className="lp-module-header">
                <span 
                  className="lp-category-badge"
                  style={{ backgroundColor: categoryColors[module.category] }}
                >
                  {module.category}
                </span>
                {module.completed && <span className="lp-completed-badge">✓ Completed</span>}
              </div>
              
              <h3>{module.title}</h3>
              <p className="lp-module-desc">{module.description}</p>

              <div className="lp-module-meta">
                <span className="lp-meta-item">⏱️ {module.duration}</span>
                <span className="lp-meta-item">{difficultyLabels[module.difficulty]}</span>
              </div>

              <div className="lp-ethical-focus">
                <strong>Ethical Focus:</strong> {module.ethicalFocus}
              </div>

              <button 
                className="lp-module-btn"
                onClick={() => setSelectedModule(module)}
              >
                View Details
              </button>
            </article>
          ))}
        </section>

        {/* Module Detail Modal */}
        {selectedModule && (
          <div className="lp-modal-overlay" onClick={() => setSelectedModule(null)}>
            <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
              <button className="lp-modal-close" onClick={() => setSelectedModule(null)}>
                ✕
              </button>
              
              <div className="lp-modal-header">
                <span 
                  className="lp-category-badge"
                  style={{ backgroundColor: categoryColors[selectedModule.category] }}
                >
                  {selectedModule.category}
                </span>
                <h2>{selectedModule.title}</h2>
                <p className="lp-modal-desc">{selectedModule.description}</p>
              </div>

              <div className="lp-modal-meta">
                <div className="lp-meta-row">
                  <span>⏱️ Duration:</span>
                  <strong>{selectedModule.duration}</strong>
                </div>
                <div className="lp-meta-row">
                  <span>📊 Difficulty:</span>
                  <strong>{difficultyLabels[selectedModule.difficulty]}</strong>
                </div>
                <div className="lp-meta-row">
                  <span>🎯 Ethical Focus:</span>
                  <strong>{selectedModule.ethicalFocus}</strong>
                </div>
              </div>

              <div className="lp-milestones">
                <h3>Learning Milestones</h3>
                <ul>
                  {selectedModule.milestones.map((milestone, index) => (
                    <li key={index}>
                      <span className="lp-milestone-number">{index + 1}</span>
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lp-modal-actions">
                {selectedModule.completed ? (
                  <div className="lp-completed-message">
                    ✓ You completed this module on {selectedModule.completedAt?.toLocaleDateString()}
                  </div>
                ) : selectedModule.startedAt ? (
                  <button 
                    className="lp-btn-complete"
                    onClick={() => completeModule(selectedModule)}
                  >
                    Mark as Complete
                  </button>
                ) : (
                  <button 
                    className="lp-btn-start"
                    onClick={() => startModule(selectedModule)}
                  >
                    Start Module
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
