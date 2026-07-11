import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';
import { EventCard } from '../components/EventCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { MagnifyingGlass, Palette, Briefcase, AirplaneTilt, UsersThree, PersonSimpleRun, GameController, HandsClapping, Books, MusicNote, Star } from '@phosphor-icons/react';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  { name: 'Art', icon: <Palette size={32} weight="fill" /> },
  { name: 'Business', icon: <Briefcase size={32} weight="fill" /> },
  { name: 'Travel', icon: <AirplaneTilt size={32} weight="fill" /> },
  { name: 'Family', icon: <UsersThree size={32} weight="fill" /> },
  { name: 'Sport', icon: <PersonSimpleRun size={32} weight="fill" /> },
  { name: 'Hobbies', icon: <Star size={32} weight="fill" /> },
  { name: 'Community', icon: <HandsClapping size={32} weight="fill" /> },
  { name: 'Games', icon: <GameController size={32} weight="fill" /> },
  { name: 'Education', icon: <Books size={32} weight="fill" /> },
  { name: 'Music', icon: <MusicNote size={32} weight="fill" /> },
];

export const Search = () => {
  const { events } = useEventContext();
  const location = useLocation();
  const { t } = useLanguage();
  
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('q') || '';
  
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [keyword, category]);

  const activeEvents = events.filter(e => !e.isPaused);

  const filteredEvents = activeEvents.filter(event => {
    const searchLower = keyword.toLowerCase();
    const matchesKeyword = 
      (event.title?.toLowerCase() || '').includes(searchLower) ||
      (event.description?.toLowerCase() || '').includes(searchLower) ||
      (event.venue?.toLowerCase() || '').includes(searchLower) ||
      (event.category?.toLowerCase() || '').includes(searchLower);

    const matchesCategory = category === 'All' || event.category === category;

    return matchesKeyword && matchesCategory;
  });

  const isBrowsingCategories = category === 'All' && keyword === '';

  return (
    <div className="container section mobile-page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)', paddingBottom: 'calc(var(--spacing-hero) * 2)' }}>
      
      {/* Search Bar (Floating Style) */}
      <div className="animate-fade-in-up" style={{ position: 'relative', maxWidth: '100%', zIndex: 10 }}>
        <MagnifyingGlass size={24} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
        <input 
          type="text" 
          placeholder={t('search_events')} 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ 
            width: '100%',
            padding: '20px 20px 20px 60px', 
            fontSize: '18px', 
            borderRadius: 'var(--radius-pill)', 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)',
            outline: 'none'
          }}
        />
        {keyword && (
          <button 
            onClick={() => setKeyword('')} 
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {isBrowsingCategories ? (
        /* Dribbble Style Categories Grid */
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-medium)', paddingBottom: '180px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '16px 0', color: '#ffffff' }}>Choose Categories</h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '16px' 
          }}>
            {CATEGORIES.map((cat, i) => (
              <div 
                key={cat.name} 
                onClick={() => setCategory(cat.name)}
                className="category-card"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  animationDelay: `${i * 0.05}s`
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {cat.icon}
                </div>
                <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '15px' }}>{cat.name}</span>
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
                backgroundColor: '#ffffff',
                color: '#000000',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-large)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
              {category !== 'All' ? `${category} Events` : 'Search Results'}
            </h2>
            {category !== 'All' && (
              <button 
                onClick={() => setCategory('All')}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
              >
                View All Categories
              </button>
            )}
          </div>

          {isLoading ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 'var(--spacing-large)' 
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '3/4', width: '100%' }}>
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <MagnifyingGlass size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No events found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try a different category or search term.</p>
              <button onClick={() => { setKeyword(''); setCategory('All'); }} className="btn-secondary" style={{ marginTop: '24px' }}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 'var(--spacing-large)' 
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
  );
};
