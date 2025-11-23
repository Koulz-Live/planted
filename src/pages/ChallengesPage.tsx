import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import './ChallengesPage.css';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'sustainability' | 'culture' | 'nutrition' | 'community';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  goal: string;
  points: number;
  activeParticipants: number;
}

interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: Date;
  status: 'active' | 'completed';
  progress: number;
  completedAt?: Date;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  completedChallenges: number;
  rank: number;
}

const allChallenges: Omit<Challenge, 'id'>[] = [
  {
    title: '30-Day Plant Power',
    description: 'Commit to plant-based eating for 30 days. Document your journey, discover new recipes, and feel the positive impact on your health and the planet.',
    type: 'nutrition',
    difficulty: 'medium',
    duration: '30 days',
    goal: 'Complete 30 days of plant-based meals',
    points: 300,
    activeParticipants: 2847
  },
  {
    title: 'Zero Waste Week',
    description: 'Challenge yourself to create zero food waste for an entire week. Use every part of ingredients, compost scraps, and plan meals efficiently.',
    type: 'sustainability',
    difficulty: 'hard',
    duration: '7 days',
    goal: 'Produce zero food waste for 7 consecutive days',
    points: 200,
    activeParticipants: 1523
  },
  {
    title: 'Cultural Food Explorer',
    description: 'Cook and share dishes from 5 different cultures. Learn their stories, respect traditions, and expand your culinary horizons.',
    type: 'culture',
    difficulty: 'medium',
    duration: '2 weeks',
    goal: 'Prepare and document 5 culturally diverse meals',
    points: 250,
    activeParticipants: 1892
  },
  {
    title: 'Local Food Champion',
    description: 'Source 100% of your food from local farmers and markets for one week. Support your community and reduce food miles.',
    type: 'sustainability',
    difficulty: 'medium',
    duration: '7 days',
    goal: 'Purchase all food locally for 7 days',
    points: 180,
    activeParticipants: 987
  },
  {
    title: 'Community Meal Share',
    description: 'Organize and host a shared meal with neighbors or community members. Break bread together and build connections.',
    type: 'community',
    difficulty: 'easy',
    duration: '1 day',
    goal: 'Host a community meal event',
    points: 150,
    activeParticipants: 654
  },
  {
    title: 'Fermentation Journey',
    description: 'Learn fermentation basics and create 3 different fermented foods. Discover this ancient preservation technique.',
    type: 'nutrition',
    difficulty: 'hard',
    duration: '3 weeks',
    goal: 'Successfully ferment 3 different foods',
    points: 280,
    activeParticipants: 743
  },
  {
    title: 'Seasonal Eating Challenge',
    description: 'Eat only seasonal produce for 2 weeks. Reconnect with nature\'s rhythm and reduce environmental impact.',
    type: 'sustainability',
    difficulty: 'easy',
    duration: '14 days',
    goal: 'Consume only seasonal foods for 14 days',
    points: 160,
    activeParticipants: 1234
  },
  {
    title: 'Recipe Documentation Project',
    description: 'Document and share 10 family recipes with their cultural stories and significance. Preserve culinary heritage.',
    type: 'culture',
    difficulty: 'easy',
    duration: '30 days',
    goal: 'Document 10 traditional family recipes',
    points: 220,
    activeParticipants: 892
  }
];

const typeColors = {
  sustainability: '#8FBC8F',
  culture: '#a8edea',
  nutrition: '#ff9a9e',
  community: '#667eea'
};

const difficultyLabels = {
  easy: '⭐ Easy',
  medium: '⭐⭐ Medium',
  hard: '⭐⭐⭐ Hard'
};

const mockLeaderboard: LeaderboardEntry[] = [
  { userId: 'user1', userName: 'Sarah Green', totalPoints: 1450, completedChallenges: 7, rank: 1 },
  { userId: 'user2', userName: 'Miguel Santos', totalPoints: 1280, completedChallenges: 6, rank: 2 },
  { userId: 'demo-user', userName: 'You', totalPoints: 0, completedChallenges: 0, rank: 3 },
  { userId: 'user4', userName: 'Aisha Khan', totalPoints: 950, completedChallenges: 5, rank: 4 },
  { userId: 'user5', userName: 'Chen Wei', totalPoints: 820, completedChallenges: 4, rank: 5 }
];

export default function ChallengesPage() {
  const [challenges] = useState<Challenge[]>(
    allChallenges.map((c, i) => ({ ...c, id: `challenge-${i}` }))
  );
  const [userChallenges, setUserChallenges] = useState<Map<string, UserChallenge>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadUserChallenges();
  }, []);

  const loadUserChallenges = async () => {
    try {
      const q = query(
        collection(db, 'userChallenges'),
        where('userId', '==', 'demo-user')
      );
      const snapshot = await getDocs(q);
      
      const challengesMap = new Map<string, UserChallenge>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        challengesMap.set(data.challengeId, {
          id: doc.id,
          userId: data.userId,
          challengeId: data.challengeId,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          status: data.status || 'active',
          progress: data.progress || 0,
          completedAt: data.completedAt?.toDate()
        });
      });

      setUserChallenges(challengesMap);
    } catch (err) {
      console.error('Error loading challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challenge: Challenge) => {
    try {
      await addDoc(collection(db, 'userChallenges'), {
        userId: 'demo-user',
        challengeId: challenge.id,
        joinedAt: Timestamp.now(),
        status: 'active',
        progress: 0
      });
      await loadUserChallenges();
    } catch (err) {
      console.error('Error joining challenge:', err);
    }
  };

  const completeChallenge = async (challengeId: string) => {
    try {
      const userChallenge = userChallenges.get(challengeId);
      if (userChallenge) {
        await updateDoc(doc(db, 'userChallenges', userChallenge.id), {
          status: 'completed',
          progress: 100,
          completedAt: Timestamp.now()
        });
        await loadUserChallenges();
      }
    } catch (err) {
      console.error('Error completing challenge:', err);
    }
  };

  const leaveChallenge = async (challengeId: string) => {
    try {
      const userChallenge = userChallenges.get(challengeId);
      if (userChallenge) {
        await deleteDoc(doc(db, 'userChallenges', userChallenge.id));
        await loadUserChallenges();
      }
    } catch (err) {
      console.error('Error leaving challenge:', err);
    }
  };

  const getFilteredChallenges = () => {
    return challenges.filter(challenge => {
      const userChallenge = userChallenges.get(challenge.id);
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return userChallenge && userChallenge.status === 'active';
      if (activeTab === 'completed') return userChallenge && userChallenge.status === 'completed';
      return false;
    });
  };

  const getStats = () => {
    const active = Array.from(userChallenges.values()).filter(c => c.status === 'active').length;
    const completed = Array.from(userChallenges.values()).filter(c => c.status === 'completed').length;
    const totalPoints = Array.from(userChallenges.values())
      .filter(uc => uc.status === 'completed')
      .reduce((sum, uc) => {
        const challenge = challenges.find(c => c.id === uc.challengeId);
        return sum + (challenge?.points || 0);
      }, 0);
    return { active, completed, totalPoints };
  };

  const stats = getStats();
  const filteredChallenges = getFilteredChallenges();

  // Update leaderboard with user's actual stats
  const leaderboard = mockLeaderboard.map(entry => 
    entry.userId === 'demo-user' 
      ? { ...entry, totalPoints: stats.totalPoints, completedChallenges: stats.completed }
      : entry
  ).sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  if (loading) {
    return (
      <div className="challenges-page">
        <div className="ch-loading">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="challenges-page">
      {/* Top Navigation */}
      <header className="ch-nav">
        <div className="ch-nav-inner">
          <div className="ch-brand">
            <div className="ch-brand-icon">🏆</div>
            <span>Planted</span>
          </div>
          <nav className="ch-nav-links">
            <a href="/">Home</a>
            <a href="/plant-care">Plant Care</a>
            <a href="/recipes">Recipes</a>
            <a href="/nutrition">Nutrition</a>
            <a href="/community">Community</a>
            <a href="/challenges" className="active">Challenges</a>
          </nav>
        </div>
      </header>

      <main className="ch-shell">
        {/* Hero Header */}
        <header className="ch-hero-header">
          <div className="ch-eyebrow">
            <span>🎯</span>
            Food Challenges
          </div>
          <h1 className="ch-title">Challenges</h1>
          <p className="ch-subtitle">
            Take on food-related challenges focused on sustainability, cultural exploration, 
            nutrition goals, and community building. Track your progress and earn points!
          </p>
        </header>

        {/* Stats Dashboard */}
        <section className="ch-stats-dashboard">
          <div className="ch-stat-card">
            <div className="ch-stat-icon">🔥</div>
            <div className="ch-stat-value">{stats.active}</div>
            <div className="ch-stat-label">Active Challenges</div>
          </div>
          <div className="ch-stat-card">
            <div className="ch-stat-icon">✅</div>
            <div className="ch-stat-value">{stats.completed}</div>
            <div className="ch-stat-label">Completed</div>
          </div>
          <div className="ch-stat-card">
            <div className="ch-stat-icon">⭐</div>
            <div className="ch-stat-value">{stats.totalPoints}</div>
            <div className="ch-stat-label">Total Points</div>
          </div>
          <div className="ch-stat-card">
            <div className="ch-stat-icon">🏅</div>
            <div className="ch-stat-value">#{leaderboard.find(e => e.userId === 'demo-user')?.rank}</div>
            <div className="ch-stat-label">Global Rank</div>
          </div>
        </section>

        <div className="ch-content-layout">
          {/* Main Column: Challenges */}
          <section className="ch-main-column">
            {/* Filter Tabs */}
            <div className="ch-tabs">
              <button 
                className={`ch-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Challenges ({challenges.length})
              </button>
              <button 
                className={`ch-tab ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active ({stats.active})
              </button>
              <button 
                className={`ch-tab ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed ({stats.completed})
              </button>
            </div>

            {/* Challenges Grid */}
            <div className="ch-challenges-grid">
              {filteredChallenges.length === 0 ? (
                <div className="ch-empty-state">
                  <span className="ch-empty-icon">🎯</span>
                  <h3>No challenges found</h3>
                  <p>
                    {activeTab === 'active' && 'Join a challenge to get started!'}
                    {activeTab === 'completed' && 'Complete challenges to see them here!'}
                  </p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => {
                  const userChallenge = userChallenges.get(challenge.id);
                  const isJoined = !!userChallenge;
                  const isCompleted = userChallenge?.status === 'completed';

                  return (
                    <article 
                      key={challenge.id} 
                      className={`ch-challenge-card ${isCompleted ? 'completed' : ''}`}
                    >
                      <div className="ch-challenge-header">
                        <span 
                          className="ch-type-badge"
                          style={{ backgroundColor: typeColors[challenge.type] }}
                        >
                          {challenge.type}
                        </span>
                        <span className="ch-difficulty-badge">
                          {difficultyLabels[challenge.difficulty]}
                        </span>
                      </div>

                      <h3>{challenge.title}</h3>
                      <p className="ch-challenge-desc">{challenge.description}</p>

                      <div className="ch-challenge-meta">
                        <div className="ch-meta-item">
                          <span className="ch-meta-icon">⏱️</span>
                          <span>{challenge.duration}</span>
                        </div>
                        <div className="ch-meta-item">
                          <span className="ch-meta-icon">🎯</span>
                          <span>{challenge.points} points</span>
                        </div>
                        <div className="ch-meta-item">
                          <span className="ch-meta-icon">👥</span>
                          <span>{challenge.activeParticipants.toLocaleString()} active</span>
                        </div>
                      </div>

                      <div className="ch-goal-box">
                        <strong>Goal:</strong> {challenge.goal}
                      </div>

                      {isCompleted && (
                        <div className="ch-completed-banner">
                          ✓ Completed on {userChallenge?.completedAt?.toLocaleDateString()}
                        </div>
                      )}

                      <div className="ch-challenge-actions">
                        {!isJoined ? (
                          <button 
                            className="ch-btn-join"
                            onClick={() => joinChallenge(challenge)}
                          >
                            Join Challenge
                          </button>
                        ) : isCompleted ? (
                          <button className="ch-btn-completed" disabled>
                            Challenge Completed 🎉
                          </button>
                        ) : (
                          <>
                            <button 
                              className="ch-btn-complete"
                              onClick={() => completeChallenge(challenge.id)}
                            >
                              Mark Complete
                            </button>
                            <button 
                              className="ch-btn-leave"
                              onClick={() => leaveChallenge(challenge.id)}
                            >
                              Leave
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          {/* Right Column: Leaderboard */}
          <aside className="ch-right-column">
            <article className="ch-leaderboard-card">
              <h2>🏆 Global Leaderboard</h2>
              <p className="ch-leaderboard-subtitle">
                Top challengers by total points earned
              </p>
              
              <div className="ch-leaderboard-list">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.userId} 
                    className={`ch-leaderboard-entry ${entry.userId === 'demo-user' ? 'current-user' : ''}`}
                  >
                    <div className="ch-rank">
                      {entry.rank <= 3 ? (
                        <span className={`ch-rank-medal rank-${entry.rank}`}>
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="ch-rank-number">#{entry.rank}</span>
                      )}
                    </div>
                    <div className="ch-leaderboard-info">
                      <div className="ch-leaderboard-name">{entry.userName}</div>
                      <div className="ch-leaderboard-stats">
                        {entry.totalPoints} pts • {entry.completedChallenges} completed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </main>
    </div>
  );
}
