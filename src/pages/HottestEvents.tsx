import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import { useEventContext } from '../context/EventContext';
import { EventCard } from '../components/EventCard';

export const HottestEvents: React.FC = () => {
  const navigate = useNavigate();
  const { events, getEventStatus } = useEventContext();

  const popularEvents = events.filter(e => {
    if (e.isPaused) return false;
    if (e.parentEventId) return false;
    const status = getEventStatus(e);
    if (status === 'Ended') return false;
    return e.isBoosted;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--bg-page)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
        padding: 'calc(max(env(safe-area-inset-top, 0px), 24px) + 12px) 16px 12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate(-1)}
            className="hover-scale"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              color: 'var(--text-primary)'
            }}
          >
            <CaretLeft size={26} weight="bold" />
          </button>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Popular Events
          </h1>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '40px' }}>
          Discover the most trending, highly anticipated, and talked-about experiences!
        </p>
      </div>

      {/* Events List */}
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '32px', flex: 1, paddingLeft: '16px', paddingRight: '16px' }}>
        {popularEvents.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700 }}>
              No Popular Events Right Now
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Stay tuned! Exciting and trending experiences will appear here soon.
            </p>
          </div>
        ) : (
          <div className="responsive-events-grid">
            {popularEvents.map(event => (
              <EventCard key={event.id} {...event} date={event.displayDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
