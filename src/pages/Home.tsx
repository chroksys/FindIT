import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../components/EventCard';
import { MapPin, MagnifyingGlass, CaretDown, Broadcast, Bell, SlidersHorizontal, X } from '@phosphor-icons/react';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import type { UserProfile } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

export const Home = () => {
  const { events, selectedCity, setSelectedCity, getEventStatus } = useEventContext();
  const { profile, unreadCount } = useUserContext();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dynamicCities = Array.from(new Set(events.map(e => e.city).filter(Boolean))).sort();
  const CITIES = ['All', ...dynamicCities];

  const activeEvents = events.filter(e => {
    if (e.isPaused) return false;
    if (e.parentEventId) return false; // Hide sub-events from main feed
    if (getEventStatus(e) === 'Ended') return false;   // Hide past events
    if (getEventStatus(e) === 'Live') return false;    // Live events belong on the Live page
    if (selectedCity !== 'All' && e.city?.toLowerCase() !== selectedCity.toLowerCase()) return false;
    return true;
  }).sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    const userInterests = (profile as UserProfile)?.interests || [];
    
    if (userInterests.some(i => i.toLowerCase() === a.category.toLowerCase())) scoreA += 100;
    if (userInterests.some(i => i.toLowerCase() === b.category.toLowerCase())) scoreB += 100;

    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    return timeA - timeB;
  });

  // Filter events in real-time when user types in the homepage search bar
  const filteredEvents = activeEvents.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      (e.city && e.city.toLowerCase().includes(q)) ||
      e.category.toLowerCase().includes(q) ||
      (e.organizer?.name && e.organizer.name.toLowerCase().includes(q))
    );
  });

  // Separate count for the live teaser banner
  const liveCount = events.filter(e =>
    !e.isPaused && !e.parentEventId && getEventStatus(e) === 'Live'
  ).length;

  const hottestEvents = filteredEvents.filter(e => e.isBoosted);

  // Following section: ALWAYS show events from followed hosts regardless of selected city
  const followedEvents = events.filter(e => {
    if (e.isPaused) return false;
    if (e.parentEventId) return false;
    if (getEventStatus(e) === 'Ended') return false;
    if (!e.organizer?.isFollowed) return false;
    // Apply keyword search if active
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.city && e.city.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q) ||
        (e.organizer?.name && e.organizer.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xlarge)' }}>
      {/* Hero / Sticky Header Section */}
      <section style={{ 
        position: 'sticky',
        top: 0,
        zIndex: 500,
        backgroundColor: 'var(--bg-page)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 24px) + 8px)',
        paddingBottom: '4px'
      }}>
        <div className="container">
          
          {/* Top Bar: Location Header + Action Icons */}
          <div className="animate-fade-in-up" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '14px',
            position: 'relative',
            zIndex: 100
          }}>
            {/* Left: Location Picker with "Find events in" caption */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
              <span className="text-caption" style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>
                Find events in
              </span>
              
              <div 
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}
              >
                <MapPin size={18} color="var(--text-primary)" weight="fill" />
                <span style={{ 
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  fontWeight: 700,
                }}>
                  {selectedCity === 'All' ? t('all_cities') : selectedCity}
                </span>
                <CaretDown 
                  size={14} 
                  color="var(--text-primary)" 
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
                  <div 
                    onClick={() => setIsCityDropdownOpen(false)} 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    backgroundColor: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: '180px',
                    zIndex: 100,
                    boxShadow: 'var(--shadow-soft)'
                  }}>
                    {CITIES.map(city => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setIsCityDropdownOpen(false);
                        }}
                        style={{
                          background: selectedCity === city ? 'var(--color-deep-navy)' : 'transparent',
                          border: 'none',
                          color: selectedCity === city ? 'var(--text-primary)' : 'var(--text-secondary)',
                          padding: '10px 16px',
                          textAlign: 'left',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: selectedCity === city ? 700 : 500,
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

            {/* Right: Standalone Action Icons (Live & Notification Bell) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => navigate('/live')}
                className="hover-scale"
                title="Live Events"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Broadcast size={28} color="var(--text-primary)" weight="fill" />
              </button>

              <button 
                onClick={() => navigate('/notifications')}
                className="hover-scale"
                title="Notifications"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  position: 'relative'
                }}
              >
                <Bell size={28} weight="bold" />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'var(--text-primary)',
                    borderRadius: '50%'
                  }} />
                )}
              </button>
            </div>
          </div>

          {/* Real-time Search Input Row + Filter Icon Button */}
          <div className="animate-fade-in-up" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '10px'
          }}>
            {/* Working Search Input */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '999px',
              padding: '10px 16px',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <MagnifyingGlass size={20} color="var(--text-secondary)" weight="bold" />
              <input
                type="text"
                placeholder="Search events, venues, hosts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: 500
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  <X size={18} weight="bold" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button 
              onClick={() => navigate('/search')}
              className="hover-scale"
              title="Advanced Search & Categories"
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-page)',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: 'var(--shadow-soft)'
              }}
            >
              <SlidersHorizontal size={20} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      {/* Live Events Teaser Banner */}
      {liveCount > 0 && (
        <section style={{ paddingTop: 0, paddingBottom: 0, marginTop: '-24px' }}>
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
            <h2 className="text-section">{t('hottest_events')}</h2>
            <button 
              onClick={() => navigate('/hottest')}
              className="hover-scale"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View All
            </button>
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
              <p className="text-caption" style={{ paddingLeft: 'var(--spacing-base)' }}>No popular events matching this search or location.</p>
            )}
          </div>
        </div>
      </section>

      {/* Followed Hosts Section */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 'var(--spacing-xlarge)' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-large)' }}>
            <h2 className="text-section">{t('from_hosts_you_follow')}</h2>
            <button 
              onClick={() => navigate('/following')}
              className="hover-scale"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View All
            </button>
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
              <p className="text-caption" style={{ paddingLeft: 'var(--spacing-base)' }}>You aren't following any active hosts matching this search.</p>
            )}
          </div>
        </div>
      </section>

      {/* Discover More Section */}
      <section className="section" style={{ paddingTop: 'var(--spacing-xlarge)' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-large)' }}>
            <h2 className="text-section">{t('discover_more')}</h2>
          </div>
          
          <div className="responsive-events-grid">
            {filteredEvents.map(event => (
              <EventCard key={`trending-${event.id}`} {...event} date={event.displayDate} />
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
};
