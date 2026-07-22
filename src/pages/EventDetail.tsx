import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  MapPin, CalendarBlank, Star, CheckCircle, ThumbsUp, CaretLeft, 
  ShareNetwork, Ticket, WarningCircle,
  Bell, GoogleLogo, AppleLogo, MicrosoftOutlookLogo, CalendarPlus, SpinnerGap, NavigationArrow
} from '@phosphor-icons/react';

import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { EventCard } from '../components/EventCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { AvatarCluster } from '../components/AvatarCluster';
import { supabase } from '../lib/supabase';
import { Share } from '@capacitor/share';
import { formatCompactPrice } from '../lib/formatters';

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, addReview, followHost, unfollowHost, followedHostIds, rsvpToEvent } = useEventContext();
  const { role, profile } = useUserContext();
  const { t } = useLanguage();
  
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);

  const event = events.find(e => e.id === id);
  const collaborations = events.filter(e => event?.collaborations?.includes(e.id));
  const parentEvent = event?.parentEventId ? events.find(e => e.id === event.parentEventId) : null;
  const subEvents = events.filter(e => e.parentEventId === id);

  useEffect(() => {
    if (id) {
      // Track page view
      const trackView = async () => {
        try {
          await supabase.from('page_views').insert({
            event_id: id,
            viewer_id: profile?.id || null
          });
        } catch (err) {
          console.error('Failed to track page view', err);
        }
      };
      trackView();
    }
  }, [id, profile?.id]);

  const handleAction = (callback?: () => void) => {
    if (role === 'guest') {
      navigate('/login');
    } else if (callback) {
      callback();
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'guest') { navigate('/login'); return; }
    if (reviewRating === 0) { setReviewError('Please select a star rating.'); return; }
    if (!reviewComment.trim()) { setReviewError('Please write a comment.'); return; }
    setReviewError('');
    setIsSubmittingReview(true);
    try {
      await addReview(event!.id, reviewRating, reviewComment);
      setReviewSubmitted(true);
      setReviewRating(0);
      setReviewComment('');
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: event?.title || 'FindIt Event',
        text: event?.description ? `${event.title} - ${event.description.substring(0, 100)}...` : 'Check out this event on FindIt!',
        url: window.location.href,
        dialogTitle: 'Share Event',
      });
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('canceled') || err?.message?.includes('cancelled')) {
        return;
      }
      if (navigator.share) {
        try {
          await navigator.share({
            title: event?.title || 'FindIt Event',
            text: event?.description || 'Check out this event!',
            url: window.location.href,
          });
          return;
        } catch (webErr: any) {
          if (webErr?.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (clipboardErr) {
        console.error('Clipboard error:', clipboardErr);
      }
    }
  };

  const generateCalendarDates = () => {
    if (!event) return { start: '', end: '' };
    const startDate = new Date(`${event.date}T${event.time || '00:00'}:00`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    const formatICSDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    return { start: formatICSDate(startDate), end: formatICSDate(endDate) };
  };

  const handleGoogleCalendar = () => {
    if (!event) return;
    const dates = generateCalendarDates();
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${dates.start}/${dates.end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;
    window.open(url, '_blank');
    setShowCalendar(false);
  };

  const handleICSDownload = () => {
    if (!event) return;
    const dates = generateCalendarDates();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${dates.start}`,
      `DTEND:${dates.end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.venue}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCalendar(false);
  };

  if (!event) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0' }}>
        <h1 className="text-hero" style={{ marginBottom: 'var(--spacing-base)' }}>Event Not Found</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-large)' }}>We couldn't find the event you were looking for.</p>
        <Link to="/" className="btn-primary hover-scale">Back to Discover</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '120px' }}>
      {/* Top Header Bar - Scrollable with proper safe-area padding & unwrapped icon buttons */}
      <div style={{ 
        position: 'relative', 
        zIndex: 100, 
        backgroundColor: 'transparent',
        padding: 'calc(max(env(safe-area-inset-top, 0px), 24px) + 12px) var(--spacing-medium) 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button 
          onClick={() => navigate(-1)} 
          className="hover-scale"
          title="Back"
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          <CaretLeft size={26} weight="bold" />
        </button>

        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Event Details
        </span>

        <button 
          onClick={handleShare}
          className="hover-scale"
          title="Share Event"
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          <ShareNetwork size={26} weight="bold" />
        </button>
      </div>

      {/* Clean Banner / Hero Image (No overlay text) */}
      <div className="container" style={{ marginTop: 'var(--spacing-small)' }}>
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '42vh', 
          minHeight: '280px', 
          maxHeight: '480px',
          borderRadius: '24px', 
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <img 
            src={event.bannerUrl} 
            alt={event.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }} 
          />
        </div>
      </div>

      {/* Event Details Content Container */}
      <div className="container" style={{ marginTop: 'var(--spacing-base)' }}>
        <div className="grid-responsive" style={{ display: 'grid', gap: 'var(--spacing-large)', alignItems: 'start' }}>
          
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            
            {/* 1. Title on Left, Category Badge on Right (Stretched) */}
            <div className="animate-fade-in-up" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              gap: '12px', 
              flexWrap: 'wrap', 
              marginBottom: '16px' 
            }}>
              <h1 style={{ color: 'var(--text-primary)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, margin: 0, lineHeight: 1.2, flex: '1 1 auto', minWidth: '200px' }}>
                {event.title}
              </h1>
              <span className="badge badge-default" style={{ backgroundColor: 'var(--color-pin-orange)', color: '#ffffff', margin: 0, padding: '6px 14px', fontSize: '13px', borderRadius: '999px', fontWeight: 700, flexShrink: 0 }}>
                {event.category}
              </span>
            </div>

            {/* 2. Description or About the Event */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.05s', marginBottom: '20px' }}>
              <h2 className="text-section" style={{ fontSize: '18px', marginBottom: '8px' }}>{t('about_this_event')}</h2>
              <p className="text-body" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
                {event.description}
              </p>
            </div>

            {/* 3. Date and Venue on the same line */}
            <div className="animate-fade-in-up" style={{ 
              animationDelay: '0.1s',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              gap: '16px',
              backgroundColor: 'var(--bg-card)', 
              padding: '16px 20px', 
              borderRadius: '18px', 
              border: '1px solid var(--border-color)',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CalendarBlank size={26} color="var(--color-pin-orange)" weight="bold" />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{event.displayDate}</div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{event.displayTime}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={26} color="var(--color-pin-orange)" weight="fill" />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{event.venue}</div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{event.city || 'Kampala, Uganda'}</div>
                </div>
              </div>
            </div>

            {/* 4. Host Card (Clickable button leading to Host Profile) */}
            <div 
              className="animate-fade-in-up hover-scale"
              onClick={() => navigate(`/organizer/${(event.organizer as any).id || '1'}`)}
              style={{ 
                animationDelay: '0.15s',
                backgroundColor: 'var(--bg-card)', 
                borderRadius: '18px', 
                border: '1px solid var(--border-color)', 
                padding: '16px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer', 
                marginBottom: '20px',
                boxShadow: 'var(--shadow-soft)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src={event.organizer.avatarUrl} alt={event.organizer.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px' }}>{event.organizer.name}</span>
                    {event.organizer.verified && <CheckCircle size={16} weight="fill" color="var(--color-success)" />}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{event.organizer.followers.toLocaleString()} Followers</div>
                </div>
              </div>
              <button 
                className={followedHostIds.includes(event.organizer.id || '') ? 'btn-secondary' : 'btn-accent'} 
                disabled={isFollowLoading}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (role === 'guest') { navigate('/login'); return; }
                  const hostId = event.organizer.id || '';
                  if (!hostId) return;
                  setIsFollowLoading(true);
                  try {
                    if (followedHostIds.includes(hostId)) {
                      await unfollowHost(hostId);
                    } else {
                      await followHost(hostId, event.organizer.name);
                    }
                  } finally {
                    setIsFollowLoading(false);
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', borderRadius: '999px', opacity: isFollowLoading ? 0.7 : 1 }}
              >
                {isFollowLoading ? (
                  <><SpinnerGap size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</>
                ) : followedHostIds.includes(event.organizer.id || '') ? (
                  <><CheckCircle size={16} /> Following</>
                ) : (
                  <><Bell size={16} /> Follow</>
                )}
              </button>
            </div>

            {/* 5. Action Card (3 Buttons: Add to Calendar, Interested, Going) */}
            <div className="animate-fade-in-up" style={{ 
              animationDelay: '0.2s',
              backgroundColor: 'var(--bg-card)', 
              padding: '16px 20px', 
              borderRadius: '18px', 
              border: '1px solid var(--border-color)',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '130px' }}>
                  <button className="btn-secondary hover-lift" onClick={() => handleAction(() => setShowCalendar(!showCalendar))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px 14px', fontSize: '13px' }}>
                    <CalendarPlus size={18} /> {t('add_to_calendar')}
                  </button>
                  {showCalendar && (
                    <div className="glass-dropdown" style={{ left: 0, right: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100%', top: '100%', marginTop: '8px' }}>
                      <button className="btn-ghost" onClick={handleGoogleCalendar} style={{ justifyContent: 'flex-start' }}><GoogleLogo size={18} /> Google</button>
                      <button className="btn-ghost" onClick={handleICSDownload} style={{ justifyContent: 'flex-start' }}><AppleLogo size={18} /> Apple</button>
                      <button className="btn-ghost" onClick={handleICSDownload} style={{ justifyContent: 'flex-start' }}><MicrosoftOutlookLogo size={18} /> Outlook</button>
                    </div>
                  )}
                </div>
                
                {(() => {
                  const userRsvp = profile?.id ? event.rsvps?.find(r => r.userId === profile.id)?.status : null;
                  
                  return (
                    <>
                      <button 
                        className={userRsvp === 'interested' ? "btn-accent hover-lift" : "btn-secondary hover-lift"} 
                        onClick={() => handleAction(() => rsvpToEvent(event.id, userRsvp === 'interested' ? null : 'interested'))} 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: '1 1 auto', minWidth: '110px', padding: '10px 14px', fontSize: '13px' }}
                      >
                        <ThumbsUp size={18} weight={userRsvp === 'interested' ? "fill" : "regular"} /> {t('interested')}
                      </button>
                      <button 
                        className={userRsvp === 'going' ? "btn-accent hover-lift" : "btn-primary hover-lift"} 
                        onClick={() => handleAction(() => rsvpToEvent(event.id, userRsvp === 'going' ? null : 'going'))} 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: '1 1 auto', minWidth: '110px', padding: '10px 14px', fontSize: '13px' }}
                      >
                        <CheckCircle size={18} weight={userRsvp === 'going' ? "fill" : "regular"} /> {t('going')}
                      </button>
                    </>
                  );
                })()}
              </div>

              {event.rsvps && event.rsvps.length > 0 && (
                <div style={{ marginTop: '12px', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <AvatarCluster rsvps={event.rsvps} size={28} />
                </div>
              )}
            </div>

            {/* Tickets & Pricing Section Card */}
            <div className="animate-fade-in-up card-padding" style={{ 
              animationDelay: '0.22s', 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '18px', 
              border: '1px solid var(--border-color)', 
              marginBottom: '24px',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Ticket size={22} color="var(--color-pin-orange)" weight="fill" />
                <h3 className="text-card-title" style={{ margin: 0, fontSize: '18px' }}>{t('tickets') || 'Tickets & Pricing'}</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                {event.earlyBird && (
                  <div style={{ backgroundColor: 'rgba(232, 84, 44, 0.1)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--color-pin-orange)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-pin-orange)', fontWeight: 700, fontSize: '14px' }}>Early Bird Offer</span>
                      <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>
                        {formatCompactPrice(event.earlyBird.price, event.currency)}
                      </span>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-page)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 600 }}>General Admission</span>
                  <span style={{ fontWeight: 800 }}>
                    {formatCompactPrice(event.price, event.currency)}
                  </span>
                </div>
                {event.vipPrice && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(232, 84, 44, 0.1)', borderRadius: '14px', border: '1px solid var(--color-pin-orange)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-pin-orange)' }}>VIP Admission</span>
                    <span style={{ fontWeight: 800, color: 'var(--color-pin-orange)' }}>
                      {formatCompactPrice(event.vipPrice, event.currency)}
                    </span>
                  </div>
                )}
              </div>

              {!event.organizer?.verified && (
                <div style={{ borderRadius: '14px', border: '1px solid rgba(232, 84, 44, 0.35)', backgroundColor: 'rgba(232, 84, 44, 0.08)', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <WarningCircle size={20} color="var(--color-pin-orange)" weight="fill" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-pin-orange)', marginBottom: '2px' }}>Pay at the Gate</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                      Host is unverified. Online payment is disabled; please pay cash or Mobile Money at the venue entrance.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Parent Event Banner */}
            {parentEvent && (
              <Link to={`/event/${parentEvent.id}`} className="animate-fade-in-up hover-lift" style={{ display: 'block', backgroundColor: 'rgba(255, 107, 0, 0.1)', border: '1px solid var(--color-pin-orange)', borderRadius: 'var(--radius-card)', padding: 'var(--spacing-medium)', marginBottom: 'var(--spacing-large)', textDecoration: 'none', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={parentEvent.bannerUrl} alt={parentEvent.title} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <div className="text-caption" style={{ color: 'var(--color-pin-orange)', fontWeight: 600 }}>PART OF A MAIN EVENT</div>
                    <div className="text-body" style={{ fontWeight: 700 }}>{parentEvent.title}</div>
                  </div>
                </div>
              </Link>
            )}

            {/* Sub-Events Section */}
            {subEvents.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.25s', marginBottom: 'var(--spacing-large)' }}>
                <h2 className="text-section" style={{ fontSize: '20px', marginBottom: 'var(--spacing-base)' }}>Schedule / Sub-Events</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
                  {subEvents.map(subEvent => (
                    <EventCard key={subEvent.id} {...subEvent} />
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Section */}
            {event.gallery && event.gallery.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', marginBottom: 'var(--spacing-large)' }}>
                <h2 className="text-section" style={{ fontSize: '20px', marginBottom: 'var(--spacing-base)' }}>{t('gallery')}</h2>
                <div style={{ display: 'flex', gap: 'var(--spacing-base)', overflowX: 'auto', paddingBottom: 'var(--spacing-small)' }}>
                  {event.gallery.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt="Gallery item" 
                      className="hover-lift"
                      style={{ width: '250px', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-card)', flexShrink: 0, cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.35s', marginBottom: 'var(--spacing-large)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-small)', marginBottom: 'var(--spacing-base)' }}>
                <h2 className="text-section" style={{ fontSize: '20px' }}>{t('reviews')}</h2>
                {event.reviews && event.reviews.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-warning)', gap: '4px' }}>
                    <Star size={18} weight="fill" />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {(event.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / event.reviews.length).toFixed(1)}
                    </span>
                    <span className="text-caption">({event.reviews.length})</span>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
                {/* Leave Review Form */}
                <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px dashed var(--border-color)' }}>
                  {reviewSubmitted ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-base) 0' }}>
                      <CheckCircle size={44} weight="fill" color="var(--color-success)" style={{ marginBottom: '8px' }} />
                      <h3 className="text-card-title" style={{ marginBottom: '4px' }}>Review Submitted!</h3>
                      <p className="text-caption" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-base)' }}>Thank you for sharing your experience.</p>
                      <button className="btn-ghost" onClick={() => setReviewSubmitted(false)}>Write another review</button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview}>
                      <h3 className="text-card-title" style={{ marginBottom: 'var(--spacing-small)' }}>{t('leave_a_review')}</h3>
                      <div
                        style={{ display: 'flex', marginBottom: 'var(--spacing-base)', cursor: 'pointer', gap: '4px' }}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={28}
                            weight={(hoverRating || reviewRating) >= star ? 'fill' : 'regular'}
                            color={(hoverRating || reviewRating) >= star ? 'var(--color-warning)' : 'var(--text-secondary)'}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            className="hover-scale"
                          />
                        ))}
                      </div>
                      <textarea
                        placeholder="Share your experience..."
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                      />
                      {reviewError && (
                        <p style={{ color: 'var(--color-error)', fontSize: '13px', marginBottom: '8px' }}>{reviewError}</p>
                      )}
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmittingReview}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmittingReview ? 0.7 : 1 }}
                      >
                        {isSubmittingReview
                          ? <><SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                          : t('submit_review')}
                      </button>
                    </form>
                  )}
                </div>

                {/* Existing Reviews */}
                {event.reviews && event.reviews.length > 0 ? (
                  event.reviews.map((review: any) => (
                    <div key={review.id} style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--spacing-base)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-small)' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{review.user_name}</span>
                          <div className="text-caption" style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                            {new Date(review.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div style={{ display: 'flex', color: 'var(--color-warning)', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} weight={i < review.rating ? 'fill' : 'regular'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-body" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-caption" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-base) 0' }}>
                    No reviews yet. Be the first to share your experience!
                  </p>
                )}
              </div>
            </div>

            {/* Official Partners Section */}
            {collaborations.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s', marginBottom: 'var(--spacing-large)' }}>
                <h2 className="text-section" style={{ fontSize: '20px', marginBottom: 'var(--spacing-base)' }}>{t('official_partners')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--spacing-base)' }}>
                  {collaborations.map(collab => (
                    <EventCard key={collab.id} {...collab} date={collab.displayDate} />
                  ))}
                </div>
              </div>
            )}

            {/* Location Map Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.45s', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: 'var(--spacing-large)' }}>
              <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'var(--bg-card)' }}>
                <h3 className="text-card-title" style={{ fontSize: '16px' }}>Location Map</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div className="text-caption">{event.venue}</div>
                  {(event as any).coordinates && (
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${(event as any).coordinates.lat},${(event as any).coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary hover-scale"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-pill)' }}
                    >
                      <NavigationArrow size={14} /> {t('get_directions') || 'Get Directions'}
                    </a>
                  )}
                </div>
              </div>
              <div style={{ height: '200px', backgroundColor: 'var(--bg-card)', position: 'relative' }}>
                {(event as any).coordinates ? (
                  <Map
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN || ''}
                    initialViewState={{
                      longitude: (event as any).coordinates.lng,
                      latitude: (event as any).coordinates.lat,
                      zoom: 14
                    }}
                    style={{width: '100%', height: '100%'}}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                  >
                    <Marker longitude={(event as any).coordinates.lng} latitude={(event as any).coordinates.lat} anchor="bottom">
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${(event as any).coordinates.lat},${(event as any).coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-scale" 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}
                        title="Get directions"
                      >
                        <MapPin size={32} weight="fill" color="var(--color-pin-orange)" />
                      </a>
                    </Marker>
                  </Map>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                    <MapPin size={32} color="var(--text-secondary)" />
                    <span className="text-caption">Map coordinates unavailable</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Floating Pill Ticket Bar (without touching screen edges, orange CTA button in light/dark mode) */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 12px) + 12px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '560px',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--border-color)',
        borderRadius: '999px',
        padding: '10px 20px',
        zIndex: 900,
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <span className="text-caption" style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: 1 }}>Total Price</span>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {formatCompactPrice(event.price, event.currency)}
          </div>
        </div>

        {event.organizer?.verified ? (
          event.ticketLink ? (
            <a href={event.ticketLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button 
                className="hover-scale"
                style={{ 
                  backgroundColor: '#e8542c', 
                  color: '#ffffff', 
                  border: 'none', 
                  padding: '12px 28px', 
                  fontSize: '15px', 
                  fontWeight: 700, 
                  borderRadius: '999px',
                  cursor: 'pointer'
                }}
              >
                Buy Ticket
              </button>
            </a>
          ) : (
            <button 
              className="hover-scale" 
              onClick={() => handleAction(() => setShowCheckout(true))} 
              style={{ 
                backgroundColor: '#e8542c', 
                color: '#ffffff', 
                border: 'none', 
                padding: '12px 28px', 
                fontSize: '15px', 
                fontWeight: 700, 
                borderRadius: '999px',
                cursor: 'pointer'
              }}
            >
              Buy Ticket
            </button>
          )
        ) : (
          <button 
            className="hover-scale" 
            onClick={() => handleAction(() => setShowCheckout(true))} 
            style={{ 
              backgroundColor: '#e8542c', 
              color: '#ffffff', 
              border: 'none', 
              padding: '12px 28px', 
              fontSize: '15px', 
              fontWeight: 700, 
              borderRadius: '999px',
              cursor: 'pointer'
            }}
          >
            RSVP / Join
          </button>
        )}
      </div>

      {showCheckout && event && (
        <CheckoutModal event={event} onClose={() => setShowCheckout(false)} />
      )}
    </div>
  );
};
