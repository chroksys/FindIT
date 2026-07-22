import React from 'react';
import { Heart, MapPin, CalendarBlank } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { AvatarCluster } from './AvatarCluster';
import { formatCompactPrice } from '../lib/formatters';

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  distance: string;
  bannerUrl: string;
  organizer: {
    id?: string;
    name: string;
    avatarUrl: string;
    verified: boolean;
  };
  coHosts?: {
    id: string;
    name: string;
    avatarUrl: string;
    status: 'pending' | 'accepted' | 'declined';
    verified: boolean;
  }[];
  isLiveMode?: boolean;
  isBoosted?: boolean;
  price?: string;
  currency?: string;
  vipPrice?: string;
  rsvps?: { avatarUrl?: string; status: 'going' | 'interested' }[];
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  venue,
  bannerUrl,
  organizer,
  coHosts: _coHosts = [],
  isLiveMode,
  price,
  currency,
  rsvps = []
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

  // Extract formatted date display (e.g. "19 Jul")
  const getFormattedBadgeDate = (dateStr: string) => {
    if (!dateStr) return '19 Jul';
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' });
      return `${day} ${month}`;
    }
    return dateStr.split(',')[0];
  };

  const badgeDate = getFormattedBadgeDate(date);

  return (
    <div 
      className="event-card hover-scale"
      onClick={() => navigate(isLiveMode ? `/live/${id}` : `/events/${id}`)}
      style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        height: '320px',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)'
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
      
      {/* Gradient Overlay for visual clarity */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.85) 100%)',
        zIndex: 1
      }}></div>

      {/* Top Overlay Controls */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        padding: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Left: Organizer & Going count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {organizer && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/organizer/${(organizer as any).id || '1'}`);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(16px)',
                padding: '5px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer'
              }}
            >
              <img 
                src={organizer.avatarUrl} 
                alt={organizer.name}
                style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 600 }}>{organizer.name}</span>
            </div>
          )}

          {rsvps.length > 0 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(16px)',
              padding: '5px 10px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <AvatarCluster rsvps={rsvps} size={20} />
            </div>
          )}

          {isLiveMode && (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: '#e8542c', 
              padding: '5px 10px', 
              borderRadius: '999px', 
              fontWeight: 700, 
              fontSize: '11px', 
              color: '#ffffff'
            }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%' }}></span>
              LIVE
            </div>
          )}
        </div>

        {/* Right: Save Button */}
        <button 
          onClick={handleAction}
          style={{
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            padding: 0
          }}
        >
          <Heart size={18} weight={isSaved ? "fill" : "bold"} color={isSaved ? "var(--color-pin-orange)" : "white"} />
        </button>
      </div>

      {/* Floating Details Card Overlay at Bottom */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        margin: '12px',
        padding: '12px 16px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-navbar)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Left: Date Badge */}
        <div style={{
          backgroundColor: 'var(--bg-page)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '50px',
          textAlign: 'center'
        }}>
          <CalendarBlank size={16} color="var(--color-pin-orange)" weight="bold" />
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            marginTop: '2px',
            lineHeight: 1.1,
            whiteSpace: 'nowrap'
          }}>
            {badgeDate}
          </span>
        </div>

        {/* Middle: Title & Venue */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '16px', 
            fontWeight: 700,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2
          }}>
            {title}
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            color: 'var(--text-secondary)',
            fontSize: '12px',
            marginTop: '4px'
          }}>
            <MapPin size={13} weight="bold" color="var(--color-pin-orange)" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{venue}</span>
          </div>
        </div>

        {/* Right: Price Badge */}
        <div style={{
          backgroundColor: 'var(--color-pin-orange)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '13px',
          padding: '6px 12px',
          borderRadius: '12px',
          whiteSpace: 'nowrap'
        }}>
          {formatCompactPrice(price, currency)}
        </div>
      </div>
    </div>
  );
};
