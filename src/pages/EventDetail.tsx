import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  MapPin, CalendarBlank, Star, Ticket, CheckCircle, ThumbsUp, CaretLeft, 
  ShareNetwork, WhatsappLogo, FacebookLogo, InstagramLogo, TwitterLogo, LinkedinLogo, EnvelopeSimple,
  Bell, GoogleLogo, AppleLogo, MicrosoftOutlookLogo, CalendarPlus, Timer, SpinnerGap, CurrencyDollar, NavigationArrow
} from '@phosphor-icons/react';

import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { EventCard } from '../components/EventCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { AvatarCluster } from '../components/AvatarCluster';

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, addReview, followHost, unfollowHost, followedHostIds, rsvpToEvent } = useEventContext();
  const { role, profile } = useUserContext();
  const { t } = useLanguage();
  
  const [showShare, setShowShare] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<null | 'success' | 'error'>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const event = events.find(e => e.id === id);
  const collaborations = events.filter(e => event?.collaborations?.includes(e.id));

  useEffect(() => {
    if (event?.earlyBird?.deadline) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const deadline = new Date(event.earlyBird!.deadline).getTime();
        const distance = deadline - now;
        
        if (distance < 0) {
          setTimeLeft('Expired');
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [event]);

  const handleApplyPromo = () => {
    if (!promoCode) return;
    if (event?.promoCodes?.find(p => p.code.toUpperCase() === promoCode.toUpperCase())) {
      setPromoStatus('success');
    } else {
      setPromoStatus('error');
    }
  };

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'FindIt Event',
          text: event?.description || 'Check out this event!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    setShowShare(false);
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
    <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + var(--spacing-xlarge))' }}>
      {/* Banner / Hero Section */}
      <div style={{ position: 'relative', width: '100%', height: '60vh', minHeight: '400px', backgroundColor: 'var(--bg-page)' }}>
        <img 
          src={event.bannerUrl} 
          alt={event.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', opacity: 0.9 }} 
        />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 25%, var(--bg-page) 65%, var(--bg-page) 100%)',
          pointerEvents: 'none'
        }}></div>

        {/* Top Controls (Back & Share) */}
        <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 20px) + 20px)', left: 'max(env(safe-area-inset-left, 0px), var(--spacing-medium))', right: 'max(env(safe-area-inset-right, 0px), var(--spacing-medium))', display: 'flex', justifyContent: 'space-between', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            width: '44px', height: '44px', borderRadius: '50%', 
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white' 
          }} className="hover-scale">
            <CaretLeft size={24} />
          </Link>

          <div style={{ position: 'relative' }}>
            <button 
              className="hover-scale" 
              onClick={() => handleAction(handleShare)} 
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: '44px', height: '44px', borderRadius: '50%', 
                backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', border: 'none', cursor: 'pointer'
              }}
            >
              <ShareNetwork size={22} />
            </button>
            {showShare && (
              <div className="glass-dropdown" style={{ display: 'flex', gap: '12px', right: 0, top: '54px' }}>
                <button className="social-icon-btn"><WhatsappLogo size={24} /></button>
                <button className="social-icon-btn"><FacebookLogo size={24} /></button>
                <button className="social-icon-btn"><TwitterLogo size={24} /></button>
                <button className="social-icon-btn"><InstagramLogo size={24} /></button>
                <button className="social-icon-btn"><LinkedinLogo size={24} /></button>
                <button className="social-icon-btn"><EnvelopeSimple size={24} /></button>
              </div>
            )}
          </div>
        </div>
        
        {/* Title and Category */}
        <div className="container" style={{ position: 'absolute', bottom: 'var(--spacing-large)', left: 0, right: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-small)' }}>
            <div>
              <span className="badge badge-default animate-fade-in-up" style={{ backgroundColor: 'var(--color-pin-orange)' }}>
                {event.category}
              </span>
            </div>
            <h1 className="text-hero animate-fade-in-up" style={{ margin: 0, lineHeight: 1.1, textShadow: '0 2px 20px var(--bg-page)' }}>{event.title}</h1>
            
            {event.organizer && (
              <div 
                className="animate-fade-in-up hover-scale" 
                style={{ animationDelay: '0.1s', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '8px 16px', backgroundColor: 'rgba(25,25,45,0.6)', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginTop: '8px', width: 'fit-content' }}
                onClick={() => navigate(`/organizer/${(event.organizer as any).id || '1'}`)}
              >
                <img src={event.organizer.avatarUrl} alt={event.organizer.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: 1 }}>Hosted by</div>
                  <div className="text-body" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1.2 }}>
                    {event.organizer.name}
                    {event.organizer.verified && <CheckCircle size={14} weight="fill" color="var(--color-success)" />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 'var(--spacing-large)' }}>
        <div className="grid-responsive" style={{ display: 'grid', gap: 'var(--spacing-xlarge)', alignItems: 'start' }}>
          
          {/* Main Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xlarge)', minWidth: 0 }}>
            
            {/* Quick Details & Actions */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-base)',
              backgroundColor: 'var(--bg-card)', padding: 'var(--spacing-large)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-large)', color: 'var(--text-secondary)', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CalendarBlank size={28} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{event.displayDate}</div>
                    <div className="text-caption">{event.displayTime}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={28} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{event.venue}</div>
                    <div className="text-caption">Kampala, Uganda</div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--spacing-small)', marginTop: 'var(--spacing-medium)', width: '100%', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '150px' }}>
                  <button className="btn-secondary hover-lift" onClick={() => handleAction(() => setShowCalendar(!showCalendar))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                    <CalendarPlus size={20} /> {t('add_to_calendar')}
                  </button>
                  {showCalendar && (
                    <div className="glass-dropdown" style={{ left: 0, right: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100%', top: '100%', marginTop: '8px' }}>
                      <button className="btn-ghost" onClick={handleGoogleCalendar} style={{ justifyContent: 'flex-start' }}><GoogleLogo size={20} /> Google</button>
                      <button className="btn-ghost" onClick={handleICSDownload} style={{ justifyContent: 'flex-start' }}><AppleLogo size={20} /> Apple</button>
                      <button className="btn-ghost" onClick={handleICSDownload} style={{ justifyContent: 'flex-start' }}><MicrosoftOutlookLogo size={20} /> Outlook</button>
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
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: '1 1 auto', minWidth: '120px' }}
                      >
                        <ThumbsUp size={20} weight={userRsvp === 'interested' ? "fill" : "regular"} /> {t('interested')}
                      </button>
                      <button 
                        className={userRsvp === 'going' ? "btn-accent hover-lift" : "btn-primary hover-lift"} 
                        onClick={() => handleAction(() => rsvpToEvent(event.id, userRsvp === 'going' ? null : 'going'))} 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: '1 1 auto', minWidth: '120px' }}
                      >
                        <CheckCircle size={20} weight={userRsvp === 'going' ? "fill" : "regular"} /> {t('going')}
                      </button>
                    </>
                  );
                })()}
              </div>

              {event.rsvps && event.rsvps.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-medium)', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-medium)' }}>
                  <AvatarCluster rsvps={event.rsvps} size={32} />
                </div>
              )}
            </div>

            {/* About Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-section" style={{ fontSize: '24px', marginBottom: 'var(--spacing-base)' }}>{t('about_this_event')}</h2>
              <p className="text-body" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {event.description}
              </p>
            </div>

            {/* Gallery Section */}
            {event.gallery && event.gallery.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-section" style={{ fontSize: '24px', marginBottom: 'var(--spacing-base)' }}>{t('gallery')}</h2>
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

            {/* Organizer Section */}
            <div className="animate-fade-in-up hover-lift card-padding" style={{ animationDelay: '0.3s', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-base)' }}>
                <img src={event.organizer.avatarUrl} alt={event.organizer.name} style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-pill)', objectFit: 'cover' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="text-card-title">{event.organizer.name}</span>
                    {event.organizer.verified && <CheckCircle size={16} weight="fill" color="var(--color-success)" />}
                  </div>
                  <div className="text-caption">{event.organizer.followers.toLocaleString()} Followers</div>
                </div>
              </div>
              <button 
                className={followedHostIds.includes(event.organizer.id || '') ? 'btn-secondary' : 'btn-accent'} 
                disabled={isFollowLoading}
                onClick={async () => {
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
                style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isFollowLoading ? 0.7 : 1 }}
              >
                {isFollowLoading ? (
                  <><SpinnerGap size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</>
                ) : followedHostIds.includes(event.organizer.id || '') ? (
                  <><CheckCircle size={20} /> Following</>
                ) : (
                  <><Bell size={20} /> Follow Organizer</>
                )}
              </button>
            </div>

            {/* Reviews Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-small)', marginBottom: 'var(--spacing-base)' }}>
                <h2 className="text-section" style={{ fontSize: '24px' }}>{t('reviews')}</h2>
                {event.reviews && event.reviews.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-warning)', gap: '4px' }}>
                    <Star size={20} weight="fill" />
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

            {/* Collaborations Section */}
            {collaborations.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.5s', marginTop: 'var(--spacing-large)' }}>
                <h2 className="text-section" style={{ fontSize: '24px', marginBottom: 'var(--spacing-base)' }}>{t('official_partners')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--spacing-base)' }}>
                  {collaborations.map(collab => (
                    <EventCard key={collab.id} {...collab} date={collab.displayDate} />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>
            
            {/* Tickets */}
            <div className="hover-lift animate-fade-in-up card-padding" style={{ animationDelay: '0.2s', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', position: 'sticky', top: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-base)' }}>
                <Ticket size={24} color="var(--color-pin-orange)" />
                <h3 className="text-card-title">{t('tickets')}</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-small)', marginBottom: 'var(--spacing-large)' }}>
                {event.earlyBird && timeLeft !== 'Expired' && (
                  <div style={{ backgroundColor: 'rgba(255,107,0,0.1)', padding: '12px', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-pin-orange)', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--color-pin-orange)', fontWeight: 600 }}>{t('early_bird_offer')}</span>
                      <span style={{ fontWeight: 700, fontSize: '18px' }}>
                        {event.earlyBird.price.includes(event.currency || 'USD') ? event.earlyBird.price : `${event.earlyBird.price} ${event.currency || 'USD'}`}
                      </span>
                    </div>
                    <div className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <Timer size={14} /> {t('ends_in')} <span style={{ fontWeight: 600, color: 'var(--color-pin-orange)', fontFamily: 'monospace' }}>{timeLeft}</span>
                    </div>
                  </div>
                )}
                {event.price && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--spacing-small)', borderBottom: '1px solid var(--border-color)' }}>
                    <span>{t('general_admission')}</span>
                    <span style={{ fontWeight: 600, textDecoration: (event.earlyBird && timeLeft !== 'Expired') ? 'line-through' : 'none', opacity: (event.earlyBird && timeLeft !== 'Expired') ? 0.5 : 1 }}>
                      {event.price.includes(event.currency || 'USD') ? event.price : `${event.price} ${event.currency || 'USD'}`}
                    </span>
                  </div>
                )}
                {event.vipPrice && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffd700', paddingTop: event.price ? 'var(--spacing-small)' : '0' }}>
                    <span>VIP Admission</span>
                    <span style={{ fontWeight: 600 }}>
                      {event.vipPrice.includes(event.currency || 'USD') ? event.vipPrice : `${event.vipPrice} ${event.currency || 'USD'}`}
                    </span>
                  </div>
                )}
                {!event.price && !event.vipPrice && !event.earlyBird && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--spacing-small)', borderBottom: '1px solid var(--border-color)' }}>
                    <span>General Admission</span>
                    <span style={{ fontWeight: 600 }}>Free</span>
                  </div>
                )}
              </div>
              
              {event.organizer.verified ? (
                // Verified organizer: show online Buy Tickets button
                event.ticketLink ? (
                  <a href={event.ticketLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                    <button className="btn-accent hover-scale" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
                      {t('buy_tickets')}
                    </button>
                  </a>
                ) : (
                  <button className="btn-accent hover-scale" onClick={() => handleAction(() => setShowCheckout(true))} style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
                    {t('buy_tickets')}
                  </button>
                )
              ) : (
                // Unverified organizer: Pay at Gate only
                <div style={{ borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,107,0,0.35)', backgroundColor: 'rgba(255,107,0,0.07)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <CurrencyDollar size={22} color="var(--color-pin-orange)" weight="fill" />
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-pin-orange)' }}>Pay at the Gate</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Online ticket sales are not available for this event. Purchase your ticket at the venue entrance on the event day.
                  </p>
                  {event.price && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                      Entry: <span style={{ color: 'var(--color-pin-orange)' }}>
                        {event.price.includes(event.currency || 'USD') ? event.price : `${event.price} ${event.currency || 'USD'}`}
                      </span>
                    </div>
                  )}
                  {event.vipPrice && (
                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                      VIP: <span style={{ color: '#ffd700' }}>
                        {event.vipPrice.includes(event.currency || 'USD') ? event.vipPrice : `${event.vipPrice} ${event.currency || 'USD'}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 'var(--spacing-base)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder={t('promo_code')} 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="input-field" 
                    style={{ flexGrow: 1, padding: '8px 12px' }}
                  />
                  <button onClick={handleApplyPromo} className="btn-secondary" style={{ padding: '8px 16px' }}>{t('apply')}</button>
                </div>
                {promoStatus === 'success' && <div className="text-caption" style={{ color: 'var(--color-success)', marginTop: '8px' }}><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Promo code applied! 10% off.</div>}
                {promoStatus === 'error' && <div className="text-caption" style={{ color: 'var(--color-error)', marginTop: '8px' }}>Invalid promo code.</div>}
              </div>
            </div>

            {/* Map Embed Placeholder */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'var(--color-deep-navy)' }}>
                <h3 className="text-card-title" style={{ fontSize: '16px' }}>Location</h3>
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
              <div style={{ height: '200px', backgroundColor: 'var(--color-muted-navy)', position: 'relative' }}>
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

      {showCheckout && event && (
        <CheckoutModal event={event} onClose={() => setShowCheckout(false)} />
      )}
    </div>
  );
};
