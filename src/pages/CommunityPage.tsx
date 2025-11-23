import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, limit, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  { value: 'recipe', label: '🍳 Recipe', color: '#f4a460' },
  { value: 'tip', label: '💡 Tip', color: '#8FBC8F' },
  { value: 'challenge', label: '🏆 Challenge', color: '#ff9a9e' },
  { value: 'story', label: '📖 Story', color: '#a8edea' }
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
            <div className="cm-brand-icon">🌍</div>
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
              <span>🤝</span>
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
                    {loading ? 'Posting...' : '📤 Share Post'}
                  </button>
                </div>
              </form>
            </div>
          </article>

          {/* Posts Feed */}
          <div className="cm-posts-container">
            {posts.length === 0 ? (
              <div className="cm-empty-state">
                <span className="cm-empty-icon">🌱</span>
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
                        ❤️ {post.likes} Likes
                      </button>
                      <button className="cm-action-btn">
                        💬 {post.comments} Comments
                      </button>
                      <button className="cm-action-btn">
                        🔗 Share
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
              <h2>🏆 Active Challenges</h2>
              <p className="cm-challenges-subtitle">
                Join global challenges and make a positive impact through food
              </p>
              
              <div className="cm-challenges-list">
                {peaceChallenges.map((challenge) => (
                  <div key={challenge.id} className="cm-challenge-item">
                    <div className="cm-challenge-header">
                      <h4>{challenge.title}</h4>
                      <span className="cm-challenge-badge">{challenge.category}</span>
                    </div>
                    <p className="cm-challenge-desc">{challenge.description}</p>
                    <div className="cm-challenge-stats">
                      <span>👥 {challenge.participants.toLocaleString()} participants</span>
                      <span>
                        ⏰ Ends {new Date(challenge.endsAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <button className="cm-btn-join">Join Challenge</button>
                  </div>
                ))}
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
