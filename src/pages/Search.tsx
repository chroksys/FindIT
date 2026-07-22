import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import { EventCard } from '../components/EventCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { 
  MagnifyingGlass, Palette, Briefcase, AirplaneTilt, UsersThree, PersonSimpleRun, GameController, HandsClapping, Books, MusicNote, Star, Gift, Heart, Wine, CheckCircle,
  Martini, ForkKnife, Smiley, Laptop, Barbell, TShirt, HandHeart
} from '@phosphor-icons/react';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  { name: 'Birthday', icon: <Gift size={28} weight="fill" /> },
  { name: 'Music', icon: <MusicNote size={28} weight="fill" /> },
  { name: 'Nightlife & Party', icon: <Martini size={28} weight="fill" /> },
  { name: 'Food & Drink', icon: <ForkKnife size={28} weight="fill" /> },
  { name: 'Games', icon: <GameController size={28} weight="fill" /> },
  { name: 'Comedy & Theatre', icon: <Smiley size={28} weight="fill" /> },
  { name: 'Tech & Innovation', icon: <Laptop size={28} weight="fill" /> },
  { name: 'Health & Fitness', icon: <Barbell size={28} weight="fill" /> },
  { name: 'Fashion & Beauty', icon: <TShirt size={28} weight="fill" /> },
  { name: 'Anniversary', icon: <Heart size={28} weight="fill" /> },
  { name: 'Wedding', icon: <Wine size={28} weight="fill" /> },
  { name: 'Art', icon: <Palette size={28} weight="fill" /> },
  { name: 'Business', icon: <Briefcase size={28} weight="fill" /> },
  { name: 'Travel', icon: <AirplaneTilt size={28} weight="fill" /> },
  { name: 'Family', icon: <UsersThree size={28} weight="fill" /> },
  { name: 'Sport', icon: <PersonSimpleRun size={28} weight="fill" /> },
  { name: 'Hobbies', icon: <Star size={28} weight="fill" /> },
  { name: 'Community', icon: <HandsClapping size={28} weight="fill" /> },
  { name: 'Education', icon: <Books size={28} weight="fill" /> },
  { name: 'Charity & Causes', icon: <HandHeart size={28} weight="fill" /> },
];

export const Search = () => {
  const { events, followHost, unfollowHost, followedHostIds, getEventStatus } = useEventContext();
  const { role } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('q') || '';
  const initialCategory = queryParams.get('category') || 'All';
  
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [keyword, category]);

  const activeEvents = events.filter(e => !e.isPaused && !e.parentEventId && getEventStatus(e) !== 'Ended');

  const searchLower = keyword.toLowerCase();
  
  const matchedHostsMap = new Map();
  if (keyword) {
    events.forEach(event => {
      if (event.organizer?.name?.toLowerCase().includes(searchLower)) {
        if (event.organizer.id && !matchedHostsMap.has(event.organizer.id)) {
          matchedHostsMap.set(event.organizer.id, event.organizer);
        }
      }
    });
  }
  const matchedHosts = Array.from(matchedHostsMap.values());

  const filteredEvents = activeEvents.filter(event => {
    const matchesKeyword = 
      (event.title?.toLowerCase() || '').includes(searchLower) ||
      (event.description?.toLowerCase() || '').includes(searchLower) ||
      (event.venue?.toLowerCase() || '').includes(searchLower) ||
      (event.category?.toLowerCase() || '').includes(searchLower) ||
      (event.organizer?.name?.toLowerCase() || '').includes(searchLower);

    const matchesCategory = category === 'All' || event.category === category;

    return matchesKeyword && matchesCategory;
  });

  const isBrowsingCategories = category === 'All' && keyword === '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 'calc(var(--spacing-hero) * 2)' }}>
      
      {/* Sticky Top Bar for Search */}
      <div style={{ 
        position: 'sticky',
        top: 0,
        zIndex: 500,
        backgroundColor: 'var(--bg-page)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-color)',
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 24px) + 8px)',
        paddingBottom: '16px',
        marginBottom: 'var(--spacing-large)'
      }}>
        <div className="container">
          <div className="animate-fade-in-up" style={{ position: 'relative', maxWidth: '100%', zIndex: 10 }}>
            <MagnifyingGlass size={24} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder={t('search_events')} 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ 
                width: '100%',
                padding: '16px 20px 16px 60px', 
                fontSize: '17px', 
                borderRadius: 'var(--radius-pill)', 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-soft)',
                backdropFilter: 'blur(10px)',
                outline: 'none'
              }}
            />
            {keyword && (
              <button 
                onClick={() => setKeyword('')} 
                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>

      {isBrowsingCategories ? (
        /* Dribbble Style Categories Grid */
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-medium)', paddingBottom: '180px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '16px 0', color: 'var(--text-primary)' }}>Choose Categories</h1>
          
          <div className="categories-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '10px' 
          }}>
            {CATEGORIES.map((cat, i) => (
              <div 
                key={cat.name} 
                onClick={() => setCategory(cat.name)}
                className="category-card hover-scale"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '16px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  animationDelay: `${i * 0.03}s`
                }}
              >
                <div style={{ color: 'var(--text-primary)' }}>
                  {cat.icon}
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', lineHeight: 1.2, wordBreak: 'break-word' }}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>

          {/* Floating Get Started Button */}
          <div style={{ position: 'fixed', bottom: '100px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 }}>
            <button 
              onClick={() => document.querySelector('input')?.focus()}
              className="hover-scale"
              style={{
                pointerEvents: 'auto',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-page)',
                border: 'none',
                borderRadius: '999px',
                padding: '16px 48px',
                fontSize: '18px',
                fontWeight: 700,
                boxShadow: '0 0 40px rgba(255,255,255,0.3), 0 10px 20px rgba(0,0,0,0.2)',
                cursor: 'pointer'
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      ) : (
        /* Results Feed */
        <div className="animate-fade-in-up">
          
          {/* Matched Hosts */}
          {matchedHosts.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-xlarge)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 'var(--spacing-base)' }}>Hosts</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-medium)' }}>
                {matchedHosts.map(host => {
                  const isFollowing = followedHostIds.includes(host.id || '');
                  return (
                    <div key={host.id} className="hover-scale" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-card)',
                      padding: 'var(--spacing-medium)',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }} onClick={() => navigate(`/organizer/${host.id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-small)' }}>
                        <img src={host.avatarUrl} alt={host.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {host.name}
                            {host.verified && <CheckCircle size={16} color="var(--color-success)" weight="fill" />}
                          </div>
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{host.followers || 0} followers</div>
                        </div>
                      </div>
                      <button 
                        className={isFollowing ? "btn-secondary" : "btn-primary"}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (role === 'guest') {
                            navigate('/login');
                          } else {
                            if (isFollowing) {
                              unfollowHost(host.id || '');
                            } else {
                              followHost(host.id || '', host.name);
                            }
                          }
                        }}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-large)', width: '100%' }}>
            <h2 className="text-section" style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>
              {category !== 'All' ? `${category} Events` : 'Events'}
            </h2>
            {category !== 'All' && (
              <button 
                onClick={() => setCategory('All')}
                style={{ background: 'none', border: 'none', color: 'var(--color-pin-orange)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
                className="hover-scale"
              >
                View All Categories
              </button>
            )}
          </div>

          {isLoading ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 'var(--spacing-large)',
              width: '100%' 
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '3/4', width: '100%' }}>
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 24px', 
              width: '100%',
              boxSizing: 'border-box',
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '24px', 
              border: '1px dashed var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MagnifyingGlass size={52} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.6 }} />
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>No events found</h3>
              <p className="text-body" style={{ color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto 24px' }}>
                Try a different category or search term.
              </p>
              <button 
                onClick={() => { setKeyword(''); setCategory('All'); }} 
                className="btn-secondary hover-scale" 
                style={{ padding: '12px 28px', borderRadius: '999px', fontWeight: 700 }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 'var(--spacing-large)',
              width: '100%' 
            }}>
              {filteredEvents.map(event => (
                <div key={event.id} className="animate-fade-in-up">
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
