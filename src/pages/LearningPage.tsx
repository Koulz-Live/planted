import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { CardSlider } from '../components/CardSlider';
import { Icon, type IconName } from '../components/Icon';
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

const difficultyMeta: Record<Module['difficulty'], { label: string; icon: IconName }> = {
  beginner: { label: 'Beginner', icon: 'sprout' },
  intermediate: { label: 'Intermediate', icon: 'foliage' },
  advanced: { label: 'Advanced', icon: 'tree' }
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
        collection(getDb(), 'learningProgress'),
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
      await addDoc(collection(getDb(), 'learningProgress'), {
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
        await updateDoc(doc(getDb(), 'learningProgress', progress.id), {
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
    <div className="learning-page container">
      {/* Hero Section */}
      <div 
        className="p-4 p-md-5 mb-4 rounded text-body-emphasis" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic text-white">
            <Icon name="book" className="icon-inline me-2" />
            Learning Pathways
          </h1>
          <p className="lead my-3 text-white">
            Explore structured learning modules on nutrition, cultural respect, sustainable cooking, 
            and ethical food systems. Track your progress and earn certificates as you advance through 
            each pathway.
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <span className="badge bg-success fs-6">{stats.completed} Completed</span>
            <span className="badge bg-warning text-dark fs-6">{stats.inProgress} In Progress</span>
            <span className="badge bg-secondary fs-6">{stats.total - stats.completed} Remaining</span>
            <span className="badge bg-primary fs-6">{Math.round((stats.completed / stats.total) * 100)}% Overall</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-5">
        {/* Main Content - Modules */}
        <div className="col-md-8">
          <h3 className="pb-4 mb-4 fst-italic border-bottom">Available Modules</h3>

          {/* Modules Grid - Desktop */}
          <div className="row g-4 lp-modules-desktop">
            {modules.map((module) => (
              <div key={module.id} className="col-12">
                <article className={`p-4 mb-3 bg-body-tertiary rounded ${module.completed ? 'border border-success' : ''}`}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span 
                      className="badge"
                      style={{ backgroundColor: categoryColors[module.category], color: '#000' }}
                    >
                      {module.category}
                    </span>
                    {module.completed && (
                      <span className="badge bg-success d-inline-flex align-items-center gap-1">
                        <Icon name="checkCircle" className="icon-inline" />
                        Completed
                      </span>
                    )}
                  </div>
                  
                  <h3 className="h4 mb-3">{module.title}</h3>
                  <p className="text-muted">{module.description}</p>

                  <div className="d-flex gap-3 mb-3 flex-wrap">
                    <span className="text-muted d-inline-flex align-items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                      </svg>
                      {module.duration}
                    </span>
                    <span className="text-muted d-inline-flex align-items-center gap-2">
                      <Icon name={difficultyMeta[module.difficulty].icon} className="icon-inline" />
                      {difficultyMeta[module.difficulty].label}
                    </span>
                  </div>

                  <div className="mb-3 p-3 bg-body rounded border">
                    <strong className="d-block mb-1">Ethical Focus:</strong>
                    <span className="text-muted">{module.ethicalFocus}</span>
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={() => setSelectedModule(module)}
                  >
                    View Details
                  </button>
                </article>
              </div>
            ))}
          </div>

          {/* Modules Slider - Mobile */}
          <div className="lp-modules-mobile">
            <CardSlider showIndicators>
              {modules.map((module) => (
                <article 
                  key={module.id} 
                  className={`p-4 bg-body-tertiary rounded ${module.completed ? 'border border-success' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span 
                      className="badge"
                      style={{ backgroundColor: categoryColors[module.category], color: '#000' }}
                    >
                      {module.category}
                    </span>
                    {module.completed && (
                      <span className="badge bg-success d-inline-flex align-items-center gap-1">
                        <Icon name="checkCircle" className="icon-inline" />
                        Completed
                      </span>
                    )}
                  </div>
                  
                  <h3 className="h4 mb-3">{module.title}</h3>
                  <p className="text-muted">{module.description}</p>

                  <div className="d-flex gap-3 mb-3 flex-wrap">
                    <span className="text-muted d-inline-flex align-items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                      </svg>
                      {module.duration}
                    </span>
                    <span className="text-muted d-inline-flex align-items-center gap-2">
                      <Icon name={difficultyMeta[module.difficulty].icon} className="icon-inline" />
                      {difficultyMeta[module.difficulty].label}
                    </span>
                  </div>

                  <div className="mb-3 p-3 bg-body rounded border">
                    <strong className="d-block mb-1">Ethical Focus:</strong>
                    <span className="text-muted">{module.ethicalFocus}</span>
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={() => setSelectedModule(module)}
                  >
                    View Details
                  </button>
                </article>
              ))}
            </CardSlider>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          <div className="position-sticky" style={{ top: '2rem' }}>
            {/* Progress Summary */}
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h4 className="fst-italic">Your Progress</h4>
              <p className="mb-3">Track your learning journey across all modules.</p>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span>Completed</span>
                  <strong>{stats.completed} / {stats.total}</strong>
                </div>
                <div className="progress" role="progressbar" aria-valuenow={(stats.completed / stats.total) * 100} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-bar bg-success" style={{ width: `${(stats.completed / stats.total) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h4 className="fst-italic">Categories</h4>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <span 
                    className="badge me-2"
                    style={{ backgroundColor: categoryColors.nutrition, color: '#000' }}
                  >
                    nutrition
                  </span>
                  <span className="text-muted">
                    {modules.filter(m => m.category === 'nutrition').length} modules
                  </span>
                </li>
                <li className="mb-2">
                  <span 
                    className="badge me-2"
                    style={{ backgroundColor: categoryColors.culture, color: '#000' }}
                  >
                    culture
                  </span>
                  <span className="text-muted">
                    {modules.filter(m => m.category === 'culture').length} modules
                  </span>
                </li>
                <li className="mb-2">
                  <span 
                    className="badge me-2"
                    style={{ backgroundColor: categoryColors.sustainability, color: '#000' }}
                  >
                    sustainability
                  </span>
                  <span className="text-muted">
                    {modules.filter(m => m.category === 'sustainability').length} modules
                  </span>
                </li>
                <li className="mb-2">
                  <span 
                    className="badge me-2"
                    style={{ backgroundColor: categoryColors.cooking, color: '#000' }}
                  >
                    cooking
                  </span>
                  <span className="text-muted">
                    {modules.filter(m => m.category === 'cooking').length} modules
                  </span>
                </li>
              </ul>
            </div>

            {/* Difficulty Levels */}
            <div className="p-4 mb-3 bg-body-tertiary rounded">
              <h4 className="fst-italic">Difficulty Levels</h4>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <span className="d-inline-flex align-items-center gap-2">
                    <Icon name="sprout" className="icon-inline" />
                    Beginner
                  </span>
                  <span className="text-muted ms-2">
                    {modules.filter(m => m.difficulty === 'beginner').length} modules
                  </span>
                </li>
                <li className="mb-2">
                  <span className="d-inline-flex align-items-center gap-2">
                    <Icon name="foliage" className="icon-inline" />
                    Intermediate
                  </span>
                  <span className="text-muted ms-2">
                    {modules.filter(m => m.difficulty === 'intermediate').length} modules
                  </span>
                </li>
                <li className="mb-2">
                  <span className="d-inline-flex align-items-center gap-2">
                    <Icon name="tree" className="icon-inline" />
                    Advanced
                  </span>
                  <span className="text-muted ms-2">
                    {modules.filter(m => m.difficulty === 'advanced').length} modules
                  </span>
                </li>
              </ul>
            </div>

            {/* Learning Tips */}
            <div className="p-4">
              <h4 className="fst-italic">Learning Tips</h4>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                  </svg>
                  Start with beginner modules
                </li>
                <li className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                  </svg>
                  Complete milestones in order
                </li>
                <li className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                  </svg>
                  Practice concepts in your kitchen
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                  </svg>
                  Share your learnings with others
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="lp-modal-overlay" onClick={() => setSelectedModule(null)}>
          <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="card border-0 shadow-lg" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="card-body p-4">
                <button 
                  className="btn-close float-end" 
                  onClick={() => setSelectedModule(null)}
                  aria-label="Close"
                ></button>
                
                <div className="mb-4">
                  <span 
                    className="badge mb-3"
                    style={{ backgroundColor: categoryColors[selectedModule.category], color: '#000' }}
                  >
                    {selectedModule.category}
                  </span>
                  <h2 className="h3 mb-3">{selectedModule.title}</h2>
                  <p className="text-muted">{selectedModule.description}</p>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                      </svg>
                      Duration
                    </span>
                    <strong>{selectedModule.duration}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                      </svg>
                      Difficulty
                    </span>
                    <strong className="d-inline-flex align-items-center gap-2">
                      <Icon name={difficultyMeta[selectedModule.difficulty].icon} className="icon-inline" />
                      {difficultyMeta[selectedModule.difficulty].label}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between pb-2">
                    <span className="text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                        <path d="M8 1a6.5 6.5 0 0 1 6.5 6.5 6.5 6.5 0 0 1-3.25 5.63l-.5.865A1.5 1.5 0 0 1 9.5 15h-3a1.5 1.5 0 0 1-1.25-.715l-.5-.865A6.5 6.5 0 0 1 1.5 7.5 6.5 6.5 0 0 1 8 1"/>
                      </svg>
                      Ethical Focus
                    </span>
                    <strong className="text-end" style={{ maxWidth: '60%' }}>{selectedModule.ethicalFocus}</strong>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="h5 mb-3">Learning Milestones</h3>
                  <ul className="list-group list-group-flush">
                    {selectedModule.milestones.map((milestone, index) => (
                      <li key={index} className="list-group-item d-flex align-items-start">
                        <span className="badge bg-primary rounded-circle me-2" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {index + 1}
                        </span>
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  {selectedModule.completed ? (
                    <div className="alert alert-success d-flex align-items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                      </svg>
                      <div>
                        You completed this module on {selectedModule.completedAt?.toLocaleDateString()}
                      </div>
                    </div>
                  ) : selectedModule.startedAt ? (
                    <button 
                      className="btn btn-success w-100"
                      onClick={() => completeModule(selectedModule)}
                    >
                      Mark as Complete
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary w-100"
                      onClick={() => startModule(selectedModule)}
                    >
                      Start Module
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
