import React from 'react';
import { Heart, MapPin, CalendarBlank } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  distance: string;
  bannerUrl: string;
  organizer: {
    name: string;
    avatarUrl: string;
    verified: boolean;
  };
  isLiveMode?: boolean;
  isBoosted?: boolean;
  price?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  venue,
  bannerUrl,
  organizer,
  isLiveMode,
  price = "$99"
}) => {
  const navigate = useNavigate();
  const { role, savedEventIds, toggleSaveEvent } = useUserContext();
  const isSaved = savedEventIds?.includes(id);

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (role === 'guest') {
      navigate('/login');
    } else {
      await toggleSaveEvent(id);
    }
  };

  return (
    <div 
      className="event-card hover-lift"
      onClick={() => navigate(isLiveMode ? `/live/${id}` : `/events/${id}`)}
      style={{
        position: 'relative',
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        aspectRatio: '0.75',
        width: '100%'
      }}
    >
      {/* Background Image */}
      <img 
        src={bannerUrl} 
        alt={title} 
        style={{ 
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100%', height: '100%', 
          objectFit: 'cover',
          zIndex: 0
        }} 
      />
      
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.95) 100%)',
        zIndex: 1
      }}></div>

      {/* Top Elements (Price & Heart) */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        {/* Glassmorphic Price Pill */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          padding: '8px 16px',
          borderRadius: '999px',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '15px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {price}
        </div>

        {/* Heart Icon */}
        <button 
          onClick={handleAction}
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            transition: 'all 0.2s ease',
            padding: 0
          }}
          className="hover-scale"
        >
          <Heart size={22} weight={isSaved ? "fill" : "regular"} color={isSaved ? "var(--color-error)" : "white"} />
        </button>
      </div>

      {/* Center Elements Spacer */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      </div>

      {/* Bottom Content Area */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <h3 style={{ 
          color: '#ffffff', 
          fontSize: '24px', 
          fontWeight: 800,
          lineHeight: 1.1,
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          margin: 0
        }}>
          {title}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.9)' }}>
            <CalendarBlank size={16} weight="bold" />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.9)' }}>
            <MapPin size={16} weight="bold" />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{venue}</span>
          </div>
        </div>

        {/* Organizer / Host info */}
        {organizer && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/organizer/${(organizer as any).id || '1'}`);
            }}
            className="hover-scale"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginTop: '8px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer'
            }}
          >
            <img 
              src={organizer.avatarUrl} 
              alt={organizer.name}
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
            />
            <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600 }}>{organizer.name}</span>
            {organizer.verified && (
              <span style={{ color: 'var(--color-success)', display: 'flex' }} title="Verified Organizer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
                </svg>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
