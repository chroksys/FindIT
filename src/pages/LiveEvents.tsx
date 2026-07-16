import { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { EventCard } from '../components/EventCard';
import { Broadcast, MagnifyingGlass } from '@phosphor-icons/react';

export const LiveEvents = () => {
  const { events, getEventStatus } = useEventContext();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter for only Live events that are not paused, and match search query
  const liveEvents = events.filter(e => {
    if (e.parentEventId) return false; // Hide sub-events from main feed
    const isLive = !e.isPaused && getEventStatus(e) === 'Live';
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return isLive && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xlarge)', paddingBottom: 'var(--spacing-xlarge)' }}>
      {/* Header Section */}
      <section style={{ 
        paddingTop: 'var(--spacing-hero)',
        paddingBottom: 'var(--spacing-large)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-small)' }}>
            <div style={{ position: 'relative' }}>
              <Broadcast size={32} color="var(--color-white)" weight="fill" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: 'var(--color-white)', borderRadius: '50%', border: '2px solid transparent', animation: 'pulse 2s infinite', boxShadow: '0 0 10px rgba(255,255,255,0.8)' }}></div>
            </div>
            <h1 className="text-hero animate-fade-in-up" style={{ fontSize: '36px' }}>
              Live Right Now
            </h1>
          </div>
          <p className="text-body animate-fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.1s', marginBottom: 'var(--spacing-base)' }}>
            Catch the action as it happens. Here are all the events currently taking place.
          </p>
          
          <div className="search-bar animate-fade-in-up" style={{ animationDelay: '0.2s', position: 'relative' }}>
            <MagnifyingGlass size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search live events or venues..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '44px', width: '100%', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </section>

      {/* Live Snippets Feed */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {liveEvents.length === 0 ? (
            <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0', animationDelay: '0.2s' }}>
              <MagnifyingGlass size={48} color="var(--text-secondary)" style={{ marginBottom: 'var(--spacing-base)' }} />
              <h2 className="text-section" style={{ marginBottom: 'var(--spacing-small)' }}>No events are live right now</h2>
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Check back later or browse upcoming events on the Discover page.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: 'var(--spacing-large)' 
            }}>
              {liveEvents.map((event, idx) => (
                <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${0.1 * (idx + 1)}s` }}>
                  {/* Additional Live indicator specifically for this view */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-error)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontWeight: 600, fontSize: '12px', color: 'white', boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)' }}>
                      <span style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                      LIVE
                    </div>
                    <EventCard {...event} date={event.displayDate} isLiveMode={true} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
