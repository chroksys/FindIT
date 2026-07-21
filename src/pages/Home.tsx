import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../components/EventCard';
import { MapPin, MagnifyingGlass, CaretDown, Broadcast } from '@phosphor-icons/react';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import type { UserProfile } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

export const Home = () => {
  const { events, selectedCity, setSelectedCity, getEventStatus } = useEventContext();
  const { profile } = useUserContext();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const dynamicCities = Array.from(new Set(events.map(e => e.city).filter(Boolean))).sort();
  const CITIES = ['All', ...dynamicCities];

  const activeEvents = events.filter(e => {
    if (e.isPaused) return false;
    if (e.parentEventId) return false; // Hide sub-events from main feed
    if (getEventStatus(e) === 'Ended') return false;   // Hide past events
    if (getEventStatus(e) === 'Live') return false;    // Live events belong on the Live page
    if (selectedCity !== 'All' && e.city !== selectedCity) return false;
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    return true;
  }).sort((a, b) => {
    // Scoring logic for personalization
    let scoreA = 0;
    let scoreB = 0;
    
    const userInterests = (profile as UserProfile)?.interests || [];
    
    // +100 points if the event's category matches a user's interest
    if (userInterests.some(i => i.toLowerCase() === a.category.toLowerCase())) scoreA += 100;
    if (userInterests.some(i => i.toLowerCase() === b.category.toLowerCase())) scoreB += 100;

    // Primary sort: User interests score
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Highest score first
    }
    
    return timeA - timeB; // Then nearest time first
  });

  // Separate count for the live teaser banner (not filtered by city/category)
  const liveCount = events.filter(e =>
    !e.isPaused && !e.parentEventId && getEventStatus(e) === 'Live'
  ).length;

  const hottestEvents = activeEvents.filter(e => e.isBoosted);
  const followedEvents = activeEvents.filter(e => e.organizer.isFollowed);

  // Discover more: all upcoming events, sorted above

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xlarge)' }}>
      {/* Hero / Search Section */}
      <section className="page-with-nav" style={{ 
        paddingBottom: 'var(--spacing-large)',
        position: 'relative'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          
          {/* Location / City Selection */}
          <div className="animate-fade-in-up" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '24px',
            position: 'relative',
            zIndex: 100 /* higher z-index for dropdown */
          }}>
            <MapPin size={18} color="#ffffff" weight="fill" />
            
            {/* Custom Dropdown Trigger */}
            <div 
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}
            >
              <span style={{ 
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
              }}>
                {selectedCity === 'All' ? t('all_cities') : selectedCity}
              </span>
              <CaretDown 
                size={14} 
                color="#ffffff" 
                weight="bold" 
                style={{ 
                  transform: isCityDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>

            {/* Custom Dropdown Menu */}
            {isCityDropdownOpen && (
              <>
                {/* Backdrop to close when clicking outside */}
                <div 
                  onClick={() => setIsCityDropdownOpen(false)} 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                />
                
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '12px',
                  backgroundColor: 'rgba(25, 25, 30, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '160px',
                  zIndex: 100,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                  {CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      style={{
                        background: selectedCity === city ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        color: selectedCity === city ? '#ffffff' : 'var(--text-secondary)',
                        padding: '10px 16px',
                        textAlign: 'left',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: selectedCity === city ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover-scale"
                    >
                      {city === 'All' ? t('all_cities') : city}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-large)' }}>
            <h1 className="animate-fade-in-up" style={{ 
              fontSize: 'clamp(36px, 10vw, 56px)', 
              fontWeight: 800, 
              lineHeight: 1.1,
              maxWidth: '300px',
              margin: 0
            }}>
              Find Your Next Experience
            </h1>
            
            <button 
              onClick={() => navigate('/search')}
              className="hover-scale animate-fade-in-up"
              style={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: '999px',
                width: '64px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                animationDelay: '0.1s',
                flexShrink: 0
              }}
            >
              <MagnifyingGlass size={28} weight="bold" color="#000000" />
            </button>
          </div>
          
          {/* Categories */}
          <div className="horizontal-scroll animate-fade-in-up" style={{ 
            gap: '12px', 
            paddingBottom: '16px', 
            margin: '0',
            width: '100%',
            animationDelay: '0.2s' 
          }}>
            {['All', 'Birthday', 'Music', 'Games', 'Anniversary', 'Wedding', 'Art', 'Business', 'Travel', 'Family', 'Sport', 'Hobbies', 'Community', 'Education'].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className="hover-scale" 
                  style={{
                    background: isActive ? 'var(--text-primary)' : 'transparent',
                    border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                    color: isActive ? 'var(--bg-page)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    padding: '10px 24px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Events Teaser Banner — shown only when events are live */}
      {liveCount > 0 && (
        <section style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="container">
            <button
              onClick={() => navigate('/live')}
              className="hover-scale"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                background: 'linear-gradient(135deg, rgba(231,76,60,0.15) 0%, rgba(192,57,43,0.08) 100%)',
                border: '1px solid rgba(231,76,60,0.4)',
                borderRadius: 'var(--radius-card)',
                padding: '14px 20px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Broadcast size={24} color="#e74c3c" weight="fill" />
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '8px', height: '8px',
                    backgroundColor: '#e74c3c', borderRadius: '50%',
                    animation: 'livePulse 1.5s ease-in-out infinite'
                  }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                    {liveCount === 1 ? '1 event is live right now' : `${liveCount} events are live right now`}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Tap to join the action →</div>
                </div>
              </div>
              <span style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                fontWeight: 700,
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.5px',
                animation: 'livePulse 1.5s ease-in-out infinite'
              }}>LIVE</span>
            </button>
          </div>
        </section>
      )}

      {/* For You / Personalized Section */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-large)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 className="text-section">{t('hottest_events')}</h2>
            </div>
          </div>
          
          <div className="horizontal-scroll" style={{ 
            gap: 'var(--spacing-medium)',
            paddingBottom: 'var(--spacing-small)',
            margin: '0 calc(-1 * var(--spacing-base))',
            paddingLeft: 'var(--spacing-base)',
            paddingRight: 'var(--spacing-base)'
          }}>
            {hottestEvents.length > 0 ? hottestEvents.map(event => (
              <div key={`hottest-${event.id}`} style={{ width: '85vw', maxWidth: '340px', flexShrink: 0 }}>
                <EventCard {...event} date={event.displayDate} />
              </div>
            )) : (
              <p className="text-caption" style={{ paddingLeft: 'var(--spacing-base)' }}>No premium events matching this location.</p>
            )}
          </div>
        </div>
      </section>

      {/* Followed Hosts Section */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 'var(--spacing-xlarge)' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-large)', flexWrap: 'wrap', gap: 'var(--spacing-base)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 className="text-section">{t('from_hosts_you_follow')}</h2>
            </div>
          </div>
          
          <div className="horizontal-scroll" style={{ 
            gap: 'var(--spacing-medium)',
            paddingBottom: 'var(--spacing-small)',
            margin: '0 calc(-1 * var(--spacing-base))',
            paddingLeft: 'var(--spacing-base)',
            paddingRight: 'var(--spacing-base)'
          }}>
            {followedEvents.length > 0 ? followedEvents.map(event => (
              <div key={`followed-${event.id}`} style={{ width: '85vw', maxWidth: '340px', flexShrink: 0 }}>
                <EventCard {...event} date={event.displayDate} />
              </div>
            )) : (
              <p className="text-caption" style={{ paddingLeft: 'var(--spacing-base)' }}>You aren't following any active hosts in this location.</p>
            )}
          </div>
        </div>
      </section>

      {/* Discover More Section */}
      <section className="section" style={{ paddingTop: 'var(--spacing-xlarge)' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-large)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 className="text-section">{t('discover_more')}</h2>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: 'var(--spacing-medium)' 
          }}>
            {activeEvents.map(event => (
              <EventCard key={`trending-${event.id}`} {...event} date={event.displayDate} />
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
};
