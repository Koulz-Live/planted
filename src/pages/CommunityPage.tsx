import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, limit, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CardSlider } from '../components/CardSlider';
import './CommunityPage.css';

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string;
  category: 'recipe' | 'tip' | 'challenge' | 'story';
  likes: number;
  comments: number;
  timestamp: Date;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'peace-table' | 'zero-waste' | 'local-food' | 'plant-based';
  participants: number;
  endsAt: Date;
}

const categoryOptions = [
  { value: 'recipe', label: 'Recipe', color: '#f4a460', icon: 'egg-fried' },
  { value: 'tip', label: 'Tip', color: '#8FBC8F', icon: 'lightbulb' },
  { value: 'challenge', label: 'Challenge', color: '#ff9a9e', icon: 'trophy' },
  { value: 'story', label: 'Story', color: '#a8edea', icon: 'book' }
];

const peaceChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Peace Table Challenge',
    description: 'Share a meal from a different culture this week and learn its story',
    category: 'peace-table',
    participants: 1247,
    endsAt: new Date(2025, 11, 30)
  },
  {
    id: '2',
    title: 'Zero Waste Week',
    description: 'Cook with zero food waste for 7 days - use every part!',
    category: 'zero-waste',
    participants: 892,
    endsAt: new Date(2025, 11, 28)
  },
  {
    id: '3',
    title: 'Local Food Month',
    description: 'Source all ingredients from local farmers and markets',
    category: 'local-food',
    participants: 654,
    endsAt: new Date(2025, 11, 25)
  },
  {
    id: '4',
    title: '30-Day Plant Power',
    description: 'Try plant-based meals for 30 days and discover new favorites',
    category: 'plant-based',
    participants: 2103,
    endsAt: new Date(2026, 0, 15)
  }
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ content: '', category: 'recipe' as Post['category'] });
  const [loading, setLoading] = useState(false);

  // Real-time posts listener
  useEffect(() => {
    const q = query(
      collection(db, 'communityPosts'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || 'demo-user',
          userName: data.userName || 'Anonymous',
          content: data.content || '',
          imageUrl: data.imageUrl,
          category: data.category || 'recipe',
          likes: data.likes || 0,
          comments: data.comments || 0,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'communityPosts'), {
        userId: 'demo-user',
        userName: 'Community Member',
        content: newPost.content,
        category: newPost.category,
        likes: 0,
        comments: 0,
        timestamp: Timestamp.now()
      });
      setNewPost({ content: '', category: 'recipe' });
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    return categoryOptions.find(opt => opt.value === category)?.color || '#8FBC8F';
  };

  return (
    <div className="community-page">
      {/* Top Navigation */}
      <header className="cm-nav">
        <div className="cm-nav-inner">
          <div className="cm-brand">
            <div className="cm-brand-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484q-.121.12-.242.234c-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 1 2.04 4.327Z"/>
              </svg>
            </div>
            <span>Planted</span>
          </div>
          <nav className="cm-nav-links">
            <a href="/">Home</a>
            <a href="/plant-care">Plant Care</a>
            <a href="/recipes">Recipes</a>
            <a href="/nutrition">Nutrition</a>
            <a href="/community" className="active">Community</a>
            <a href="/challenges">Challenges</a>
          </nav>
        </div>
      </header>

      <main className="cm-shell">
        {/* Left column: Feed */}
        <section className="cm-main-column">
          <header className="cm-hero-header">
            <div className="cm-eyebrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
              </svg>
              Global Food Community
            </div>
            <h1 className="cm-title">Community Feed</h1>
            <p className="cm-subtitle">
              Share recipes, meal prep strategies, and participate in Peace Table challenges 
              with a global community centered around food and cultural learning.
            </p>
          </header>

          {/* Create Post Card */}
          <article className="cm-card cm-create-post">
            <div className="cm-card-inner">
              <h2>Share with Community</h2>
              <form onSubmit={handleSubmitPost}>
                <textarea
                  className="cm-textarea"
                  placeholder="Share a recipe, tip, or story with the community..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  required
                />
                <div className="cm-post-footer">
                  <div className="cm-category-select">
                    {categoryOptions.map(cat => (
                      <label
                        key={cat.value}
                        className={`cm-category-chip ${newPost.category === cat.value ? 'active' : ''}`}
                        style={{ 
                          backgroundColor: newPost.category === cat.value ? cat.color : 'transparent',
                          borderColor: cat.color
                        }}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={newPost.category === cat.value}
                          onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value as Post['category'] }))}
                          style={{ display: 'none' }}
                        />
                        {cat.label}
                      </label>
                    ))}
                  </div>
                  <button type="submit" className="cm-btn-primary" disabled={loading}>
                    {loading ? 'Posting...' : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                          <path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836z"/>
                        </svg>
                        Share Post
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </article>

          {/* Posts Feed */}
          <div className="cm-posts-container">
            {posts.length === 0 ? (
              <div className="cm-empty-state">
                <span className="cm-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 5.5a2.5 2.5 0 0 1 2.5 2.5v1a1.5 1.5 0 0 1-3 0V8a.5.5 0 0 1 1 0v1a.5.5 0 0 0 1 0V8a1.5 1.5 0 0 0-3 0v1a2.5 2.5 0 0 0 5 0V8a3.5 3.5 0 1 0-7 0v5.5a.5.5 0 0 1-1 0V8a4.5 4.5 0 1 1 9 0v5.5a.5.5 0 0 1-1 0V8a3.5 3.5 0 0 0-7 0v1a1.5 1.5 0 0 0 3 0V8a.5.5 0 0 0-1 0z"/>
                  </svg>
                </span>
                <h3>No posts yet</h3>
                <p>Be the first to share with the community!</p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="cm-card cm-post-card">
                  <div className="cm-card-inner">
                    <div className="cm-post-header">
                      <div className="cm-user-info">
                        <div className="cm-avatar">{post.userName.charAt(0)}</div>
                        <div>
                          <div className="cm-user-name">{post.userName}</div>
                          <div className="cm-post-time">
                            {new Date(post.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <span 
                        className="cm-category-badge"
                        style={{ backgroundColor: getCategoryColor(post.category) }}
                      >
                        {categoryOptions.find(c => c.value === post.category)?.label}
                      </span>
                    </div>
                    <p className="cm-post-content">{post.content}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="Post" className="cm-post-image" />
                    )}
                    <div className="cm-post-actions">
                      <button className="cm-action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                          <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                        </svg>
                        {post.likes} Likes
                      </button>
                      <button className="cm-action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                          <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                          <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2"/>
                        </svg>
                        {post.comments} Comments
                      </button>
                      <button className="cm-action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
                          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Right column: Challenges */}
        <aside className="cm-right-column">
          <article className="cm-card cm-challenges-card">
            <div className="cm-card-inner">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                  <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935M3.504 1q.01.775.056 1.469c.13 2.028.457 3.546.87 4.667C5.294 9.48 6.484 10 7 10a.5.5 0 0 1 .5.5v2.61a1 1 0 0 1-.757.97l-1.426.356a.5.5 0 0 0-.179.085L4.5 15h7l-.638-.479a.5.5 0 0 0-.18-.085l-1.425-.356a1 1 0 0 1-.757-.97V10.5A.5.5 0 0 1 9 10c.516 0 1.706-.52 2.57-2.864.413-1.12.74-2.64.87-4.667q.045-.694.056-1.469z"/>
                </svg>
                Active Challenges
              </h2>
              <p className="cm-challenges-subtitle">
                Join global challenges and make a positive impact through food
              </p>
              
              {/* Desktop: Stacked list */}
              <div className="cm-challenges-list cm-challenges-desktop">
                {peaceChallenges.map((challenge) => (
                  <div key={challenge.id} className="cm-challenge-item">
                    <div className="cm-challenge-header">
                      <h4>{challenge.title}</h4>
                      <span className="cm-challenge-badge">{challenge.category}</span>
                    </div>
                    <p className="cm-challenge-desc">{challenge.description}</p>
                    <div className="cm-challenge-stats">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                        </svg>
                        {challenge.participants.toLocaleString()} participants
                      </span>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                        </svg>
                        Ends {new Date(challenge.endsAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <button className="cm-btn-join">Join Challenge</button>
                  </div>
                ))}
              </div>

              {/* Mobile: Swipeable slider */}
              <div className="cm-challenges-mobile">
                <CardSlider showIndicators>
                  {peaceChallenges.map((challenge) => (
                    <div key={challenge.id} className="cm-challenge-item cm-challenge-slide">
                      <div className="cm-challenge-header">
                        <h4>{challenge.title}</h4>
                        <span className="cm-challenge-badge">{challenge.category}</span>
                      </div>
                      <p className="cm-challenge-desc">{challenge.description}</p>
                      <div className="cm-challenge-stats">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                          </svg>
                          {challenge.participants.toLocaleString()} participants
                        </span>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                          </svg>
                          Ends {new Date(challenge.endsAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <button className="cm-btn-join">Join Challenge</button>
                    </div>
                  ))}
                </CardSlider>
              </div>
            </div>
          </article>

          <article className="cm-card cm-stats-card">
            <div className="cm-card-inner">
              <h3>Community Impact</h3>
              <div className="cm-stats-grid">
                <div className="cm-stat-item">
                  <div className="cm-stat-value">5.2K</div>
                  <div className="cm-stat-label">Members</div>
                </div>
                <div className="cm-stat-item">
                  <div className="cm-stat-value">12.8K</div>
                  <div className="cm-stat-label">Recipes Shared</div>
                </div>
                <div className="cm-stat-item">
                  <div className="cm-stat-value">8.4K</div>
                  <div className="cm-stat-label">Challenges Completed</div>
                </div>
                <div className="cm-stat-item">
                  <div className="cm-stat-value">156</div>
                  <div className="cm-stat-label">Countries</div>
                </div>
              </div>
            </div>
          </article>
        </aside>
      </main>
    </div>
  );
}
