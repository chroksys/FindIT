import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Heart, Phone, Globe, Star, ArrowRight, SpinnerGap } from '@phosphor-icons/react';
import { EventCard } from '../components/EventCard';
import { ViewAllModal } from '../components/ViewAllModal';
import { useUserContext } from '../context/UserContext';
import { useEventContext } from '../context/EventContext';

export const OrganizerProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useUserContext();
  const [viewAllData, setViewAllData] = useState<{title: string, items: any[], type: 'event' | 'ticket' | 'host' | 'review' | 'attended'} | null>(null);

  const handleAction = (callback: () => void) => {
    if (role === 'guest') {
      navigate('/login');
    } else {
      callback();
    }
  };

  const { events, getEventStatus, followedHostIds, followHost, unfollowHost, loadingEvents } = useEventContext();

  if (loadingEvents) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <SpinnerGap size={48} weight="bold" className="spin" color="var(--color-primary)" />
      </div>
    );
  }

  const hostEvents = events.filter(e => e.organizer.id === id || (!e.organizer.id && id === '1'));
  
  // Dynamic Data for the Organizer Profile
  const firstEvent = hostEvents[0];
  const reviews = hostEvents.flatMap(e => (e.reviews || []).map(r => ({ ...r, event: e.title })));
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  const organizer = firstEvent ? {
    id: id || '1',
    name: firstEvent.organizer.name,
    verified: firstEvent.organizer.verified,
    avatarUrl: firstEvent.organizer.avatarUrl,
    bannerUrl: firstEvent.organizer.bannerUrl || firstEvent.bannerUrl, // Use explicit banner if set, else fallback to first event
    type: 'Event Organizer',
    location: firstEvent.city || 'Kampala',
    bio: firstEvent.organizer.bio || `"Welcome to ${firstEvent.organizer.name}! We curate unforgettable experiences for our community."`,
    website: firstEvent.organizer.website || 'No website',
    phone: firstEvent.organizer.phone || 'No phone',
    stats: {
      followers: firstEvent.organizer.followers || 0,
      totalEvents: hostEvents.length,
      rating: averageRating,
      reviewCount: reviews.length
    }
  } : {
    id: id || '1',
    name: 'Unknown Organizer',
    verified: false,
    avatarUrl: 'https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=150',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
    type: 'Organizer',
    location: 'Unknown',
    bio: 'No bio available.',
    website: '',
    phone: '',
    stats: { followers: 0, totalEvents: 0, rating: 0, reviewCount: 0 }
  };

  const upcomingEvents = hostEvents.filter(e => getEventStatus(e) !== 'Ended');
  const pastEvents = hostEvents.filter(e => getEventStatus(e) === 'Ended');

  return (
    <div style={{ paddingBottom: 'var(--spacing-xlarge)' }}>
      
      {/* Section 1: Identity (Banner + Avatar) */}
      <div style={{ position: 'relative', marginBottom: 'var(--spacing-xlarge)' }}>
        <img 
          src={organizer.bannerUrl} 
          alt="Banner" 
          style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
        />
        <div className="container" style={{ maxWidth: '800px', padding: '0 20px', marginTop: '-60px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--spacing-base)' }}>
            <img 
              src={organizer.avatarUrl} 
              alt={organizer.name} 
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-background)' }}
            />
            <div>
          <h1 className="text-section" style={{ fontSize: '32px', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {organizer.name}
            {organizer.verified && <CheckCircle size={24} weight="fill" color="var(--color-success)" />}
          </h1>
          <div className="text-body" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            {organizer.type} &middot; {organizer.location}
          </div>
        </div>
        
        <p className="text-body" style={{ maxWidth: '500px', fontStyle: 'italic', margin: '8px 0' }}>"{organizer.bio}"</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--spacing-large)', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={18} /> {organizer.website}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={18} /> {organizer.phone}</div>
        </div>

        <button 
          onClick={() => handleAction(() => {
            if (followedHostIds.includes(organizer.id)) {
              unfollowHost(organizer.id);
            } else {
              followHost(organizer.id, organizer.name);
            }
          })}
          className={`btn-primary hover-scale ${followedHostIds.includes(organizer.id) ? 'btn-secondary' : ''}`} 
          style={{ 
            marginTop: '8px', 
            padding: '10px 32px', 
            borderRadius: 'var(--radius-pill)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '16px'
          }}
        >
          {followedHostIds.includes(organizer.id) ? (
            <><CheckCircle size={20} weight="fill" /> Following</>
          ) : (
            <><Heart size={20} /> Follow Host</>
          )}
        </button>
      </div>
      </div>
      </div>

      {/* Wrapping the rest in the container */}
      <div className="container" style={{ maxWidth: '800px', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xlarge)' }}>
        
        {/* Section 2: Stats Grid */}
        <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
            <div style={{ borderRight: '1px solid var(--border-color)' }}>
              <div className="text-section" style={{ fontSize: '24px' }}>{organizer.stats.followers}</div>
              <div className="text-caption">Followers</div>
            </div>
            <div style={{ borderRight: '1px solid var(--border-color)' }}>
              <div className="text-section" style={{ fontSize: '24px' }}>{organizer.stats.totalEvents}</div>
              <div className="text-caption">Events</div>
            </div>
            <div>
              <div className="text-section" style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                {organizer.stats.rating} <Star size={20} weight="fill" color="var(--color-pin-orange)" />
              </div>
              <div className="text-caption">Rating</div>
            </div>
          </div>
        </div>

        {/* Section 3: Upcoming Events */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-medium)' }}>
            <h2 className="text-section" style={{ fontSize: '24px' }}>Upcoming Events</h2>
            <button onClick={() => setViewAllData({title: 'Upcoming Events', items: upcomingEvents, type: 'event'})} className="btn-ghost text-caption hover-scale" style={{ padding: 0 }}>View All</button>
          </div>
          <div className="horizontal-scroll" style={{ margin: '0 -20px', padding: '10px 20px 20px', gap: 'var(--spacing-base)' }}>
            {upcomingEvents.map(event => (
              <div key={event.id} style={{ width: '280px' }}>
                <EventCard {...event} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Past Events */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-medium)' }}>
            <h2 className="text-section" style={{ fontSize: '24px' }}>Past Events</h2>
            <button onClick={() => setViewAllData({title: 'Past Events', items: pastEvents, type: 'event'})} className="btn-ghost text-caption hover-scale" style={{ padding: 0 }}>View All</button>
          </div>
          <div className="horizontal-scroll" style={{ margin: '0 -20px', padding: '10px 20px 20px', gap: 'var(--spacing-base)' }}>
            {pastEvents.map(event => (
              <div key={event.id} style={{ width: '280px', filter: 'grayscale(100%) opacity(0.8)' }}>
                <EventCard {...event} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Reviews */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-large)' }}>
            <h2 className="text-section" style={{ fontSize: '24px' }}>Reviews</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)' }}>
              <Star size={16} weight="fill" color="var(--color-pin-orange)" />
              <span style={{ fontWeight: 600 }}>{organizer.stats.rating}</span>
              <span className="text-caption">({organizer.stats.reviewCount} reviews)</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
            {reviews.map(review => (
              <div key={review.id} className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} weight={i < review.rating ? "fill" : "regular"} color="var(--color-pin-orange)" />
                    ))}
                  </div>
                  <span className="text-caption" style={{ fontWeight: 600 }}>{review.name}</span>
                </div>
                <p className="text-body" style={{ margin: '12px 0', fontStyle: 'italic' }}>"{review.comment}"</p>
                <div className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-pin-orange)', fontWeight: 500 }}>{review.event}</span>
                  <span>&middot;</span>
                  <span>{review.date}</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn-secondary hover-scale" 
            style={{ width: '100%', marginTop: 'var(--spacing-large)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px' }}
            onClick={() => handleAction(() => setViewAllData({title: 'Reviews', items: reviews, type: 'review'}))}
          >
            See All Reviews <ArrowRight size={18} />
          </button>
        </div>

      </div>
      {viewAllData && <ViewAllModal title={viewAllData.title} items={viewAllData.items} type={viewAllData.type} onClose={() => setViewAllData(null)} />}
    </div>
  );
};
