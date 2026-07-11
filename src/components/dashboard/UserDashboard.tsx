import React, { useState } from 'react';
import { TicketModal } from '../TicketModal';
import { ViewAllModal } from '../ViewAllModal';
import { useUserContext, type UserProfile } from '../../context/UserContext';
import { useEventContext } from '../../context/EventContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PencilSimple, 
  MapPin, 
  Bell, 
  LockKey, 
  EnvelopeSimple, 
  Moon, 
  Sun, 
  Question, 
  SignOut,
  Star,
  Translate
} from '@phosphor-icons/react';

const INTEREST_ICONS: Record<string, string> = {
  music: '🎵 Music', sports: '⚽ Sports', tech: '💻 Tech', business: '💼 Business',
  education: '📚 Education', fashion: '👗 Fashion', festivals: '🎉 Festivals',
  religious: '🙏 Religious', community: '🤝 Community', nightlife: '🌙 Nightlife',
  concerts: '🎤 Concerts', fitness: '🏃 Fitness'
};

export const UserDashboard: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [viewAllData, setViewAllData] = useState<{title: string, items: any[], type: 'event' | 'ticket' | 'host' | 'review' | 'attended'} | null>(null);
  const { profile, logout, savedEventIds } = useUserContext();
  const { events } = useEventContext();
  const { resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Type assertion since we know it's a user profile if this renders
  const userProfile = profile as UserProfile;

  // Data
  const savedEvents = events.filter(e => savedEventIds?.includes(e.id));
  const attendedEvents = events.slice(2, 5);
  
  const followedHosts = [
    { id: '1', name: 'Talent Africa', logo: 'https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=100' },
    { id: '2', name: 'Nyege Nyege', logo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=100' },
    { id: '3', name: 'Swangz Ave', logo: 'https://images.unsplash.com/photo-1493225457124-a1a2a4af7894?auto=format&fit=crop&q=80&w=100' },
    { id: '4', name: 'Comedy Store', logo: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=100' },
  ];

  const recentReviews = [
    { id: '1', event: 'Kampala Jazz Night', rating: 4, comment: 'Amazing atmosphere, will definitely go again', date: '15 July 2026' },
    { id: '2', event: 'Startup Grind Kampala', rating: 3, comment: 'Good content but venue was too small', date: '2 July 2026' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container section mobile-page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xlarge)' }}>
      
      {/* Section 1: Identity */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--spacing-base)' }}>
        <img 
          src={userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
          alt="Profile" 
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-color)' }}
        />
        <div>
          <h1 className="text-section" style={{ fontSize: '28px', marginBottom: '4px' }}>{userProfile?.name || 'John Doe'}</h1>
          <div className="text-caption" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <MapPin size={16} /> {userProfile?.city || 'Kampala, Ntinda'}
          </div>
        </div>
        <Link to="/account" className="btn-secondary hover-scale" style={{ padding: '8px 16px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <PencilSimple size={16} /> Edit Profile
        </Link>
      </div>

      {/* Section 2: Stats Grid */}
      <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
          <div style={{ borderRight: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>12</div>
            <div className="text-caption">Saved</div>
          </div>
          <div style={{ borderRight: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>5</div>
            <div className="text-caption">Following</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>28</div>
            <div className="text-caption">Reviews</div>
          </div>
        </div>
      </div>

      {/* Section 3: Interests */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-base)' }}>
          <h3 className="text-card-title">My Interests</h3>
          <button className="text-caption" style={{ color: 'var(--color-pin-orange)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-small)' }}>
          {userProfile?.interests?.length > 0 ? (
            userProfile.interests.map(id => (
              <span key={id} className="badge" style={{ padding: '8px 12px', backgroundColor: 'rgba(255, 87, 34, 0.1)', color: 'var(--color-pin-orange)', border: '1px solid var(--color-pin-orange)' }}>
                {INTEREST_ICONS[id] || id}
              </span>
            ))
          ) : (
            <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>No interests selected.</span>
          )}
        </div>
      </div>

      {/* Section 3.5: My Tickets */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-base)' }}>
          <h3 className="text-card-title">My Tickets</h3>
          <button onClick={() => setViewAllData({title: 'My Tickets', items: savedEvents, type: 'ticket'})} className="btn-ghost text-caption hover-scale" style={{ color: 'var(--text-secondary)', fontWeight: 600, padding: 0 }}>View All</button>
        </div>
        <div className="horizontal-scroll gap-base" style={{ paddingBottom: 'var(--spacing-base)', paddingTop: '8px' }}>
          {savedEvents.map(event => (
            <div key={`ticket-${event.id}`} className="hover-lift card-padding" onClick={() => setSelectedTicket(event)} style={{ 
              width: '280px', 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: 'var(--radius-card)', 
              border: '1px dashed var(--color-pin-orange)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-small)',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 className="text-body" style={{ fontWeight: 600, marginBottom: '4px' }}>{event.title}</h4>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{event.displayDate} • 1x General</div>
                </div>
                <div style={{ backgroundColor: 'var(--color-white)', padding: '4px', borderRadius: '4px' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=ticket-${event.id}`} alt="QR" style={{ width: '40px', height: '40px' }} />
                </div>
              </div>
              <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); setSelectedTicket(event); }} style={{ width: '100%', justifyContent: 'center', padding: '8px' }}>View Ticket</button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Saved Events */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-base)' }}>
          <h3 className="text-card-title">Saved Events</h3>
          <button onClick={() => setViewAllData({title: 'Saved Events', items: savedEvents, type: 'event'})} className="btn-ghost text-caption hover-scale" style={{ color: 'var(--text-secondary)', fontWeight: 600, padding: 0 }}>View All</button>
        </div>
        <div className="horizontal-scroll gap-base" style={{ paddingBottom: 'var(--spacing-base)', paddingTop: '8px' }}>
          {savedEvents.length === 0 ? (
            <div className="text-body" style={{ color: 'var(--text-secondary)', padding: 'var(--spacing-large) 0', textAlign: 'center', width: '100%', minWidth: '300px' }}>
              You haven't saved any events yet.<br/> <Link to="/search" style={{ color: 'var(--color-primary)' }}>Discover events</Link>
            </div>
          ) : savedEvents.map(event => (
            <div key={`saved-${event.id}`} className="hover-lift" style={{ 
              width: '240px', 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: 'var(--radius-card)', 
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              cursor: 'pointer'
            }} onClick={() => navigate(`/events/${event.id}`)}>
              <img src={event.bannerUrl} alt={event.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
              <div style={{ padding: 'var(--spacing-small)' }}>
                <h4 className="text-body" style={{ fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h4>
                <div className="text-caption" style={{ color: 'var(--color-pin-orange)', fontWeight: 600 }}>{event.displayDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Following */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-base)' }}>
          <h3 className="text-card-title">Following</h3>
          <button onClick={() => setViewAllData({title: 'Following', items: followedHosts, type: 'host'})} className="btn-ghost text-caption hover-scale" style={{ color: 'var(--text-secondary)', fontWeight: 600, padding: 0 }}>View All</button>
        </div>
        <div className="horizontal-scroll gap-large" style={{ paddingBottom: 'var(--spacing-small)', paddingLeft: '4px', paddingTop: '8px' }}>
          {followedHosts.map(host => (
            <div key={host.id} className="hover-scale" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <img src={host.logo} alt={host.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
              <span className="text-caption" style={{ fontWeight: 600, textAlign: 'center', width: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{host.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6: My Reviews */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-base)' }}>
          <h3 className="text-card-title">My Reviews</h3>
          <button onClick={() => setViewAllData({title: 'My Reviews', items: recentReviews, type: 'review'})} className="btn-ghost text-caption hover-scale" style={{ color: 'var(--text-secondary)', fontWeight: 600, padding: 0 }}>View All</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
          {recentReviews.map(review => (
            <div key={review.id} className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '2px', color: 'var(--color-pin-orange)', marginBottom: '4px' }}>
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={16} weight={star <= review.rating ? 'fill' : 'regular'} />
                    ))}
                  </div>
                  <h4 className="text-body" style={{ fontWeight: 600 }}>{review.event}</h4>
                </div>
                <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>{review.date}</span>
              </div>
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>"{review.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 7: Attended Events */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-base)' }}>
          <h3 className="text-card-title">Events I've Attended</h3>
          <button onClick={() => setViewAllData({title: 'Events I\'ve Attended', items: attendedEvents, type: 'attended'})} className="btn-ghost text-caption hover-scale" style={{ color: 'var(--text-secondary)', fontWeight: 600, padding: 0 }}>View All</button>
        </div>
        <div className="horizontal-scroll gap-base" style={{ paddingBottom: 'var(--spacing-base)', paddingTop: '8px' }}>
          {attendedEvents.map(event => (
            <div key={`attended-${event.id}`} className="hover-lift" style={{ 
              width: '240px', 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: 'var(--radius-card)', 
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              cursor: 'pointer',
              opacity: 0.8 // slight fade for past events
            }} onClick={() => navigate(`/events/${event.id}`)}>
              <img src={event.bannerUrl} alt={event.title} style={{ width: '100%', height: '120px', objectFit: 'cover', filter: 'grayscale(30%)' }} />
              <div style={{ padding: 'var(--spacing-small)' }}>
                <h4 className="text-body" style={{ fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h4>
                <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{event.displayDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 8: Account Settings */}
      <div style={{ marginBottom: '120px' }}>
        <h3 className="text-card-title" style={{ marginBottom: 'var(--spacing-base)' }}>{t('account_settings')}</h3>
        <div className="settings-grid-container">
          <div className="settings-grid">
            <div className="settings-item hover-scale" style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '12px', cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Translate size={20} color="var(--text-secondary)" />
                <span className="text-body" style={{ fontWeight: 500 }}>{t('language')}</span>
              </div>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as 'en' | 'fr')}
                style={{ 
                  backgroundColor: 'transparent', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 8px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="en" style={{ color: 'black' }}>{t('english')}</option>
                <option value="fr" style={{ color: 'black' }}>{t('french')}</option>
              </select>
            </div>
            
            <button className="settings-item hover-scale">
              <Bell size={20} color="var(--text-secondary)" />
              <span className="text-body" style={{ fontWeight: 500 }}>{t('push_notifications')}</span>
            </button>
            
            <button className="settings-item hover-scale">
              <LockKey size={20} color="var(--text-secondary)" />
              <span className="text-body" style={{ fontWeight: 500 }}>Change Password</span>
            </button>
            
            <button className="settings-item hover-scale">
              <EnvelopeSimple size={20} color="var(--text-secondary)" />
              <span className="text-body" style={{ fontWeight: 500 }}>Change Email</span>
            </button>

            <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="settings-item hover-scale">
              {resolvedTheme === 'dark' ? <Sun size={20} color="var(--text-secondary)" /> : <Moon size={20} color="var(--text-secondary)" />}
              <span className="text-body" style={{ fontWeight: 500 }}>{resolvedTheme === 'dark' ? t('light_mode') : t('dark_mode')}</span>
            </button>

            <button className="settings-item hover-scale">
              <Question size={20} color="var(--text-secondary)" />
              <span className="text-body" style={{ fontWeight: 500 }}>Help & Support</span>
            </button>

            <button onClick={handleLogout} className="settings-item hover-scale" style={{ color: 'var(--color-error)' }}>
              <SignOut size={20} />
              <span className="text-body" style={{ fontWeight: 600 }}>{t('sign_out')}</span>
            </button>
          </div>
        </div>
      </div>

    {selectedTicket && <TicketModal event={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    {viewAllData && <ViewAllModal title={viewAllData.title} items={viewAllData.items} type={viewAllData.type} onClose={() => setViewAllData(null)} onItemClick={viewAllData.type === 'ticket' ? (item) => setSelectedTicket(item) : undefined} />}
    </div>
  );
};
