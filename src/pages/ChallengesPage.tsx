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
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard'
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
    <div className="challenges-page container">
      {/* Hero Section */}
      <div className="p-4 p-md-5 mb-4 rounded text-body-emphasis bg-body-secondary">
        <div className="col-lg-8 px-0">
          <h1 className="display-4 fst-italic">🏆 Food Challenges</h1>
          <p className="lead my-3">
            Take on food-related challenges focused on sustainability, cultural exploration, 
            nutrition goals, and community building. Track your progress, earn points, and climb the leaderboard!
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <span className="badge bg-primary fs-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/>
              </svg>
              {stats.active} Active
            </span>
            <span className="badge bg-success fs-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
              </svg>
              {stats.completed} Completed
            </span>
            <span className="badge bg-warning text-dark fs-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
              </svg>
              {stats.totalPoints} Points
            </span>
            <span className="badge bg-info fs-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702z"/>
                <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/>
              </svg>
              Rank #{leaderboard.find(e => e.userId === 'demo-user')?.rank}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-5">
        <div className="col-md-8">
          <h3 className="pb-4 mb-4 fst-italic border-bottom">Available Challenges</h3>
          
          {/* Filter Tabs */}
          <nav className="nav nav-underline mb-4">
            <button 
              className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              All ({challenges.length})
            </button>
            <button 
              className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              Active ({stats.active})
            </button>
            <button 
              className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              Completed ({stats.completed})
            </button>
          </nav>

          {/* Challenges List */}
          <div>
            {filteredChallenges.length === 0 ? (
              <div className="text-center p-5 bg-body-tertiary rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16" className="text-secondary mb-3">
                  <path d="M8 1a6.5 6.5 0 0 1 6.5 6.5 6.5 6.5 0 0 1-3.25 5.63l-.5.865A1.5 1.5 0 0 1 9.5 15h-3a1.5 1.5 0 0 1-1.25-.715l-.5-.865A6.5 6.5 0 0 1 1.5 7.5 6.5 6.5 0 0 1 8 1"/>
                </svg>
                <h3 className="text-body-emphasis">No challenges found</h3>
                <p className="text-body-secondary">
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
                    className="blog-post mb-4 pb-4 border-bottom"
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h2 className="display-6 link-body-emphasis mb-2">{challenge.title}</h2>
                        <div className="d-flex gap-2 mb-2">
                          <span className="badge bg-secondary" style={{ backgroundColor: typeColors[challenge.type] }}>
                            {challenge.type}
                          </span>
                          <span className={`badge ${challenge.difficulty === 'easy' ? 'bg-success' : challenge.difficulty === 'medium' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {difficultyLabels[challenge.difficulty]}
                          </span>
                        </div>
                      </div>
                      {isCompleted && (
                        <span className="badge bg-success fs-6">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    <p className="mb-3">{challenge.description}</p>

                    <div className="p-3 mb-3 bg-body-tertiary rounded">
                      <strong>Goal:</strong> {challenge.goal}
                    </div>

                    <div className="d-flex gap-4 mb-3 text-body-secondary small">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                        </svg>
                        {challenge.duration}
                      </span>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                        </svg>
                        {challenge.points} points
                      </span>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                        </svg>
                        {challenge.activeParticipants.toLocaleString()} active
                      </span>
                    </div>

                    {isCompleted && userChallenge?.completedAt && (
                      <div className="alert alert-success mb-3" role="alert">
                        <strong>✓ Completed</strong> on {userChallenge.completedAt.toLocaleDateString()}
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      {!isJoined ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => joinChallenge(challenge)}
                        >
                          Join Challenge
                        </button>
                      ) : isCompleted ? (
                        <button className="btn btn-success" disabled>
                          Challenge Completed 🎉
                        </button>
                      ) : (
                        <>
                          <button 
                            className="btn btn-success"
                            onClick={() => completeChallenge(challenge.id)}
                          >
                            Mark Complete
                          </button>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => leaveChallenge(challenge.id)}
                          >
                            Leave Challenge
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar: Leaderboard */}
        <div className="col-md-4">
          <div className="position-sticky" style={{ top: '2rem' }}>
            <div className="p-4 bg-body-tertiary rounded">
              <div className="text-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="text-warning">
                  <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935M3.504 1q.01.775.056 1.469c.13 2.028.457 3.546.87 4.667C5.294 9.48 6.484 10 7 10a.5.5 0 0 1 .5.5v2.61a1 1 0 0 1-.757.97l-1.426.356a.5.5 0 0 0-.179.085L4.5 15h7l-.638-.479a.5.5 0 0 0-.18-.085l-1.425-.356a1 1 0 0 1-.757-.97V10.5A.5.5 0 0 1 9 10c.516 0 1.706-.52 2.57-2.864.413-1.12.74-2.64.87-4.667q.045-.694.056-1.469z"/>
                </svg>
                <h4 className="fst-italic mt-2">Global Leaderboard</h4>
                <p className="text-body-secondary small mb-0">Top challengers by total points earned</p>
              </div>
              
              <div>
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.userId} 
                    className={`d-flex align-items-center gap-3 py-3 border-top ${entry.userId === 'demo-user' ? 'bg-primary-subtle rounded px-2' : ''}`}
                  >
                    <div className="flex-shrink-0" style={{ width: '32px', textAlign: 'center' }}>
                      {entry.rank <= 3 ? (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          fill={entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32'}
                          viewBox="0 0 16 16"
                        >
                          <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702z"/>
                          <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/>
                        </svg>
                      ) : (
                        <span className="fw-bold text-body-secondary">#{entry.rank}</span>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{entry.userName}</div>
                      <small className="text-body-secondary">
                        {entry.totalPoints} pts • {entry.completedChallenges} completed
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
