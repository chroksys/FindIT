import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft, Users } from '@phosphor-icons/react';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import { EventCard } from '../components/EventCard';

export const FollowingEvents: React.FC = () => {
  const navigate = useNavigate();
  const { events, getEventStatus } = useEventContext();
  const { role } = useUserContext();

  const followedEvents = events.filter(e => {
    if (e.isPaused) return false;
    if (e.parentEventId) return false;
    const status = getEventStatus(e);
    if (status === 'Ended') return false;
    // No city filter — following section shows from ANY city
    return e.organizer?.isFollowed;
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
        padding: 'calc(max(env(safe-area-inset-top, 0px), 24px) + 12px) var(--spacing-medium) 12px'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="var(--color-pin-orange)" weight="fill" />
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              From Hosts You Follow
            </h1>
          </div>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '40px' }}>
          Latest events from hosts in your network
        </p>
      </div>

      {/* Events List */}
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '32px', flex: 1 }}>
        {role === 'guest' ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <Users size={56} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700 }}>
              Sign In to See Events
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 20px 0' }}>
              Follow your favourite hosts and their upcoming events will appear here.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#e8542c',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '12px 28px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </div>
        ) : followedEvents.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <Users size={56} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700 }}>
              No Events Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Start following hosts and their events will show up here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {followedEvents.map(event => (
              <EventCard key={event.id} {...event} date={event.displayDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
