import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Heart, Phone, Globe, Star, ArrowRight } from '@phosphor-icons/react';
import { EventCard } from '../components/EventCard';
import { ViewAllModal } from '../components/ViewAllModal';
import { useUserContext } from '../context/UserContext';

export const OrganizerProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useUserContext();
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewAllData, setViewAllData] = useState<{title: string, items: any[], type: 'event' | 'ticket' | 'host' | 'review' | 'attended'} | null>(null);

  const handleAction = (callback: () => void) => {
    if (role === 'guest') {
      navigate('/login');
    } else {
      callback();
    }
  };

  // Mock Data for the Organizer Profile
  const organizer = {
    id: id || '1',
    name: 'Neon Nights Uganda',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=150',
    bannerUrl: '/neon_banner.png',
    type: 'Music Promoter',
    location: 'Kampala',
    bio: 'Bringing the best live music experiences to East Africa. We curate unforgettable nights with top artists and DJs.',
    website: 'neonights.ug',
    phone: '+256 700 000 000',
    stats: {
      followers: '1.2k',
      totalEvents: '48',
      rating: 4.8,
      reviewCount: 36
    }
  };

  const upcomingEvents = [
    {
      id: 'e1',
      title: 'Kampala Jazz Night',
      date: '2026-08-15',
      venue: 'Serena Hotel, Kampala',
      category: 'Music',
      distance: '2.5 km',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
      organizer: { name: organizer.name, avatarUrl: organizer.avatarUrl, verified: organizer.verified }
    },
    {
      id: 'e2',
      title: 'Neon Rooftop Party',
      date: '2026-08-22',
      venue: 'Skyz Hotel, Naguru',
      category: 'Nightlife',
      distance: '5.1 km',
      bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
      organizer: { name: organizer.name, avatarUrl: organizer.avatarUrl, verified: organizer.verified }
    }
  ];

  const pastEvents = [
    {
      id: 'p1',
      title: 'Afrobeat Festival',
      date: '2026-05-10',
      venue: 'Lugogo Cricket Oval',
      category: 'Festival',
      distance: '4.0 km',
      bannerUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600',
      organizer: { name: organizer.name, avatarUrl: organizer.avatarUrl, verified: organizer.verified }
    },
    {
      id: 'p2',
      title: 'Underground Sound',
      date: '2026-04-22',
      venue: 'The Warehouse',
      category: 'Music',
      distance: '3.2 km',
      bannerUrl: 'https://images.unsplash.com/photo-1540039155732-68421c713fca?auto=format&fit=crop&q=80&w=600',
      organizer: { name: organizer.name, avatarUrl: organizer.avatarUrl, verified: organizer.verified }
    }
  ];

  const reviews = [
    {
      id: 'r1',
      name: 'Jane M.',
      rating: 5,
      comment: "Best event I've attended in Kampala this year! The sound was perfect and the crowd was amazing.",
      event: 'Afrobeat Festival',
      date: '15 May 2026'
    },
    {
      id: 'r2',
      name: 'Brian K.',
      rating: 4,
      comment: "Great lineup, sound could have been a bit better, but overall a fantastic experience.",
      event: 'Underground Sound',
      date: '25 April 2026'
    }
  ];

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
          onClick={() => handleAction(() => setIsFollowing(!isFollowing))}
          className={`btn-primary hover-scale ${isFollowing ? 'btn-secondary' : ''}`} 
          style={{ 
            marginTop: '8px', 
            padding: '10px 32px', 
            borderRadius: 'var(--radius-pill)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            backgroundColor: isFollowing ? 'var(--bg-card)' : 'var(--color-pin-orange)',
            color: isFollowing ? 'var(--text-primary)' : 'white'
          }}
        >
          <Heart size={20} weight={isFollowing ? 'fill' : 'regular'} color={isFollowing ? 'var(--color-error)' : 'white'} /> 
          {isFollowing ? 'Following' : 'Follow'}
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
