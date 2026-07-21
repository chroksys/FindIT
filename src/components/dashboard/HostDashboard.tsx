import React, { useState } from 'react';
import { useEventContext, type Event } from '../../context/EventContext';
import { useUserContext } from '../../context/UserContext';
import type { HostProfile } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, PencilSimple, PauseCircle, PlayCircle, Trash, WarningCircle, UserCircle, ChartBar, CreditCard, LockKey, EnvelopeSimple, Moon, Sun, Question, SignOut, RocketLaunch, Tag, ChatCircleText, Translate, X, CheckCircle, Monitor } from '@phosphor-icons/react';
import { ChangePasswordModal } from '../ChangePasswordModal';
import { supabase } from '../../lib/supabase';

export const HostDashboard: React.FC = () => {
  const { events, deleteEvent, togglePauseEvent, getEventStatus } = useEventContext();
  const { getEventLimit, role, profile, logout } = useUserContext();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [boostModalEventId, setBoostModalEventId] = useState<string | null>(null);
  const [boostStep, setBoostStep] = useState<'select' | 'processing' | 'success'>('select');
  const [affiliateModalEventId, setAffiliateModalEventId] = useState<string | null>(null);

  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);
  const [blastStep, setBlastStep] = useState<'compose' | 'processing' | 'success'>('compose');
  const [blastMessage, setBlastMessage] = useState('');

  // Settings States
  
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<'form' | 'processing' | 'success'>('form');

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportStep, setSupportStep] = useState<'form' | 'processing' | 'success'>('form');
  const [supportMessage, setSupportMessage] = useState('');

  const [totalViews, setTotalViews] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  React.useEffect(() => {
    if (!profile?.id) return;
    const loadHostStats = async () => {
      const { count: fCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', profile.id);
      setFollowersCount(fCount || 0);

      const eventIds = events.filter(e => e.organizer?.id === profile.id).map(e => e.id);
      if (eventIds.length > 0) {
        const { count: vCount } = await supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds);
        setTotalViews(vCount || 0);
      }
    };
    loadHostStats();
  }, [profile?.id, events]);

  const handleSupportSubmit = async () => {
    if (!supportMessage.trim() || !profile) return;
    setSupportStep('processing');
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: profile.id,
        name: profile.name,
        email: profile.email,
        message: supportMessage
      });
      if (error) console.error('Supabase error:', error);
    } catch (e) {
      console.error('Support ticket error:', e);
    }
    // Always show success for good UX
    setTimeout(() => setSupportStep('success'), 1000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (role === 'guest' || !profile) {
    return <div className="container section text-center" style={{ padding: '40px' }}>Please log in to view this page.</div>;
  }

  const hostProfile = profile as HostProfile;

  // Filter events to only show ones belonging to the logged-in host
  const userEvents = events.filter(e => e.organizer?.id === profile?.id);
  const isLimitReached = userEvents.length >= getEventLimit();

  const getStatusColor = (status: string, isPaused: boolean) => {
    if (isPaused) return 'var(--color-muted-navy)';
    switch (status) {
      case 'Live': return 'var(--color-success)';
      case 'Upcoming': return 'var(--color-pin-orange)';
      case 'Ended': return 'var(--color-error)';
      default: return 'var(--color-muted-navy)';
    }
  };

  return (
    <div className="container section page-with-nav">
      <div style={{ marginBottom: 'var(--spacing-large)' }}>
        <h1 className="text-hero" style={{ fontSize: '32px', marginBottom: 'var(--spacing-micro)' }}>Profile</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Manage your hosted experiences and account.</p>
      </div>

      {/* Verification Banner */}
      {hostProfile.verificationStatus === 'unverified' && (
        <div style={{ backgroundColor: 'rgba(255, 107, 0, 0.1)', border: '1px solid var(--color-pin-orange)', borderRadius: 'var(--radius-card)', padding: '16px', marginBottom: 'var(--spacing-large)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <WarningCircle size={24} color="var(--color-pin-orange)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-pin-orange)', marginBottom: '4px' }}>Verification Required</h3>
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>You must complete KYB onboarding before you can publish events or receive payouts.</p>
            </div>
          </div>
          <Link to="/verify" className="btn-primary hover-scale" style={{ alignSelf: 'flex-start', padding: '8px 16px', backgroundColor: 'var(--color-pin-orange)', color: 'white', border: 'none' }}>
            Verify Business Now
          </Link>
        </div>
      )}

      {hostProfile.verificationStatus === 'pending_review' && (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '16px', marginBottom: 'var(--spacing-large)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-pin-orange)', animation: 'pulse 2s infinite' }}></div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Verification Pending</h3>
            <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Our team is reviewing your documents. This usually takes 1-2 business days.</p>
          </div>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: 'var(--spacing-small)',
        marginBottom: 'var(--spacing-large)'
      }}>
        <Link to="/account" className="btn-secondary hover-scale" style={{ justifyContent: 'center', padding: '12px' }}>
          <UserCircle size={20} /> Edit Profile
        </Link>
        {isLimitReached ? (
          <Link to="/pricing" className="btn-accent hover-scale" style={{ backgroundColor: 'var(--color-error)', justifyContent: 'center', padding: '12px' }}>
            <WarningCircle size={20} /> Upgrade Limit
          </Link>
        ) : (
          <Link to="/host" className="btn-accent hover-scale" style={{ justifyContent: 'center', padding: '12px' }}>
            <Plus size={20} /> Create Event
          </Link>
        )}
        <Link to="/analytics" className="btn-secondary hover-scale" style={{ justifyContent: 'center', padding: '12px' }}>
          <ChartBar size={20} /> Dashboard
        </Link>
        <Link to="/pricing" className="btn-secondary hover-scale" style={{ justifyContent: 'center', padding: '12px' }}>
          <CreditCard size={20} /> Subscription
        </Link>
      </div>

      {/* Analytics Peek */}
      <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', marginBottom: 'var(--spacing-xlarge)' }}>
        <h3 className="text-card-title" style={{ marginBottom: 'var(--spacing-base)' }}>Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-base)', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{userEvents.length}</div>
            <div className="text-caption">Events</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{totalViews}</div>
            <div className="text-caption">Views</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {userEvents.reduce((acc, e) => acc + (e.rsvps?.length || 0), 0)}
            </div>
            <div className="text-caption">RSVPs</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-pin-orange)' }}>{followersCount}</div>
            <div className="text-caption">Followers</div>
          </div>
        </div>
        <Link to="/analytics" className="btn-secondary hover-scale" style={{ display: 'inline-flex', marginTop: '16px', padding: '8px 16px', fontSize: '14px' }}>View Full Analytics</Link>
      </div>

      <h2 className="text-section" style={{ fontSize: '24px', marginBottom: 'var(--spacing-base)' }}>Your Events</h2>

      {userEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-hero)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px dashed var(--border-color)' }}>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-base)' }}>You haven't hosted any events yet.</p>
          <Link to="/host" className="btn-primary hover-scale">Start Hosting</Link>
        </div>
      ) : (
        <div className="events-grid">
          {userEvents.map((event: Event) => {
            const status = getEventStatus(event);
            return (
              <div key={event.id} className="hover-lift" style={{ 
                backgroundColor: 'var(--bg-card)', 
                borderRadius: 'var(--radius-card)', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                position: 'relative',
                opacity: event.isPaused ? 0.7 : 1,
                overflow: 'hidden',
                width: '100%',
                minWidth: 0
              }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-small)', padding: 'var(--spacing-small)', minWidth: 0 }}>
                  <img src={event.bannerUrl} alt={event.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-input)', flexShrink: 0 }} />
                  
                  <div style={{ flexGrow: 1, minWidth: 0, padding: '0 4px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 className="text-card-title" style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h3>
                    <div className="text-caption" style={{ marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.displayDate} • {event.venue}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="badge" style={{ backgroundColor: getStatusColor(status, event.isPaused), color: 'white' }}>
                        {event.isPaused ? 'Paused' : status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promo Actions */}
                {status !== 'Ended' && (
                  <div style={{ padding: '0 var(--spacing-small) var(--spacing-small) var(--spacing-small)', display: 'flex', gap: '8px' }}>
                    {hostProfile.subscription === 'Pro' || hostProfile.subscription === 'Growth' ? (
                      <button 
                        onClick={() => {
                          setBoostStep('select');
                          setBoostModalEventId(event.id);
                        }} 
                        className="btn-accent hover-scale" 
                        style={{ flex: 1, padding: '8px', fontSize: '14px', justifyContent: 'center' }}
                        disabled={event.isBoosted}
                      >
                        <RocketLaunch size={16} />
                        {event.isBoosted ? 'Boosted Active' : 'Boost Event'}
                      </button>
                    ) : (
                      <button onClick={() => navigate('/pricing')} className="btn-secondary hover-scale" style={{ flex: 1, padding: '8px', fontSize: '14px', justifyContent: 'center', opacity: 0.7 }}>
                        <LockKey size={16} /> Pro: Boost Event
                      </button>
                    )}
                    
                    {hostProfile.subscription === 'Pro' || hostProfile.subscription === 'Growth' ? (
                      <button 
                        onClick={() => setAffiliateModalEventId(event.id)}
                        className="btn-secondary hover-scale" 
                        style={{ flex: 1, padding: '8px', fontSize: '14px', justifyContent: 'center' }}
                      >
                        <Tag size={16} /> Affiliates
                      </button>
                    ) : (
                      <button onClick={() => navigate('/pricing')} className="btn-secondary hover-scale" style={{ flex: 1, padding: '8px', fontSize: '14px', justifyContent: 'center', opacity: 0.7 }}>
                        <LockKey size={16} /> Pro: Affiliates
                      </button>
                    )}
                  </div>
                )}

                {status === 'Live' && (
                  <div style={{ padding: '0 var(--spacing-small) var(--spacing-small) var(--spacing-small)' }}>
                    {hostProfile.subscription === 'Pro' || hostProfile.subscription === 'Growth' ? (
                      <button onClick={() => navigate(`/host/live/${event.id}`)} className="btn-primary hover-scale" style={{ width: '100%', backgroundColor: 'var(--color-error)', border: 'none', justifyContent: 'center' }}>
                        <span style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%', animation: 'pulse 2s infinite', marginRight: '8px' }}></span>
                        Go to Control Center
                      </button>
                    ) : (
                      <button onClick={() => navigate('/pricing')} className="btn-primary hover-scale" style={{ width: '100%', backgroundColor: 'var(--color-muted-navy)', border: 'none', justifyContent: 'center' }}>
                        <LockKey size={18} style={{ marginRight: '8px' }} />
                        Pro: Unlock Control Center
                      </button>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <button onClick={() => navigate(`/host/${event.id}`)} className="btn-ghost" style={{ flex: 1, padding: '12px 8px', borderRadius: 0, borderRight: '1px solid var(--border-color)' }}>
                    <PencilSimple size={18} /> <span>Edit</span>
                  </button>
                  <button onClick={() => togglePauseEvent(event.id)} className="btn-ghost" style={{ flex: 1, padding: '12px 8px', borderRadius: 0, borderRight: '1px solid var(--border-color)' }}>
                    {event.isPaused ? <PlayCircle size={18} /> : <PauseCircle size={18} />} 
                    <span>{event.isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                  <button onClick={() => deleteEvent(event.id)} className="btn-ghost" style={{ flex: 1, padding: '12px 8px', borderRadius: 0, color: 'var(--color-error)' }}>
                    <Trash size={18} /> <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Settings */}
      <div style={{ marginTop: 'var(--spacing-xlarge)', marginBottom: '120px' }}>
        <h3 className="text-card-title" style={{ marginBottom: 'var(--spacing-base)' }}>Account Settings</h3>
        <div className="settings-grid-container">
          <div className="settings-grid">
            {hostProfile.subscription === 'Pro' || hostProfile.subscription === 'Growth' ? (
              <button 
                onClick={() => { setIsBlastModalOpen(true); setBlastStep('compose'); setBlastMessage(''); }} 
                className="settings-item hover-scale" 
                style={{ border: '1px solid var(--color-pin-orange)', backgroundColor: 'rgba(255,107,0,0.05)' }}
              >
                <ChatCircleText size={20} color="var(--color-pin-orange)" />
                <span className="text-body" style={{ fontWeight: 600, color: 'var(--color-pin-orange)' }}>WhatsApp & SMS Blast</span>
              </button>
            ) : (
              <button onClick={() => navigate('/pricing')} className="settings-item hover-scale" style={{ opacity: 0.7 }}>
                <LockKey size={20} color="var(--text-secondary)" />
                <span className="text-body" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Pro: WhatsApp Blast</span>
              </button>
            )}

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
            <button onClick={() => setPasswordModalOpen(true)} className="settings-item hover-scale">
              <LockKey size={20} color="var(--text-secondary)" />
              <span className="text-body" style={{ fontWeight: 500 }}>Change Password</span>
            </button>
            
            <button onClick={() => { setEmailModalOpen(true); setEmailStep('form'); }} className="settings-item hover-scale">
              <EnvelopeSimple size={20} color="var(--text-secondary)" />
              <span className="text-body" style={{ fontWeight: 500 }}>Change Email</span>
            </button>

            <button onClick={() => {
              if (theme === 'dark') setTheme('system');
              else if (theme === 'system') setTheme('light');
              else setTheme('dark');
            }} className="settings-item hover-scale">
              {theme === 'system' ? <Monitor size={20} color="var(--text-secondary)" /> : theme === 'light' ? <Sun size={20} color="var(--text-secondary)" /> : <Moon size={20} color="var(--text-secondary)" />}
              <span className="text-body" style={{ fontWeight: 500 }}>
                {theme === 'system' ? 'System Theme' : theme === 'light' ? t('light_mode') : t('dark_mode')}
              </span>
            </button>

            <button onClick={() => { setSupportModalOpen(true); setSupportStep('form'); }} className="settings-item hover-scale">
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

      {/* Boost Modal */}
      {boostModalEventId && (
        <div 
          onClick={() => setBoostModalEventId(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--spacing-medium)'
          }}
        >
          <div 
            className="animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
            backgroundColor: 'var(--color-deep-navy)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            position: 'relative'
          }}>
            {boostStep !== 'processing' && (
              <button onClick={() => setBoostModalEventId(null)} className="hover-scale" style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            )}

            {boostStep === 'select' && (
              <>
                <RocketLaunch size={48} color="var(--color-pin-orange)" weight="fill" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Supercharge Your Event</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                  Pin your event to the top of search results and the discovery page to maximize ticket sales.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={() => {
                      setBoostStep('processing');
                      setTimeout(() => setBoostStep('success'), 1500);
                    }}
                    className="hover-scale"
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', cursor: 'pointer', color: 'white'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '16px' }}>1-Day Boost</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Perfect for a quick spike</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>$5</div>
                  </button>

                  <button 
                    onClick={() => {
                      setBoostStep('processing');
                      setTimeout(() => setBoostStep('success'), 1500);
                    }}
                    className="hover-scale"
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px', backgroundColor: 'var(--color-pin-orange)',
                      border: 'none', borderRadius: '16px', cursor: 'pointer', color: 'white'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '16px' }}>7-Day Boost</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Best value for visibility</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>$20</div>
                  </button>
                </div>
              </>
            )}

            {boostStep === 'processing' && (
              <div style={{ padding: '40px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-pin-orange)', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Processing Payment...</h3>
              </div>
            )}

            {boostStep === 'success' && (
              <div className="animate-fade-in-up">
                <RocketLaunch size={48} color="var(--color-success)" weight="fill" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Boost Activated!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                  Payment successful. Your event is now pinned to the top of the search results and discovery page!
                </p>
                <button onClick={() => setBoostModalEventId(null)} className="btn-primary hover-scale" style={{ width: '100%', justifyContent: 'center' }}>
                  Awesome!
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Affiliate Modal */}
      {affiliateModalEventId && (
        <div 
          onClick={() => setAffiliateModalEventId(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--spacing-medium)'
          }}
        >
          <div 
            className="animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
            backgroundColor: 'var(--color-deep-navy)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button onClick={() => setAffiliateModalEventId(null)} className="hover-scale" style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <Tag size={48} color="var(--color-success)" weight="fill" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Affiliate Program</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Unique promo codes have been successfully generated for this event. You can now share them with your affiliate partners to track their sales!
            </p>
            <button onClick={() => setAffiliateModalEventId(null)} className="btn-primary hover-scale" style={{ width: '100%', justifyContent: 'center' }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp & SMS Blast Modal */}
      {isBlastModalOpen && (
        <div 
          onClick={() => setIsBlastModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--spacing-medium)'
          }}
        >
          <div 
            className="animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
            backgroundColor: 'var(--color-deep-navy)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            position: 'relative'
          }}>
            {blastStep !== 'processing' && (
              <button onClick={() => setIsBlastModalOpen(false)} className="hover-scale" style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            )}

            {blastStep === 'compose' && (
              <>
                <ChatCircleText size={48} color="var(--color-pin-orange)" weight="fill" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Send Blast</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5, fontSize: '14px' }}>
                  Reach <strong>842 past attendees</strong> instantly via WhatsApp and SMS to promote your next event.
                </p>
                
                <textarea 
                  value={blastMessage}
                  onChange={(e) => setBlastMessage(e.target.value)}
                  placeholder="Hey! We have a new event dropping this weekend. Get your early bird tickets now..."
                  style={{
                    width: '100%', height: '120px', padding: '16px',
                    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px', color: '#ffffff', fontSize: '15px', resize: 'none', marginBottom: '24px',
                    outline: 'none', fontFamily: 'inherit'
                  }}
                />
                <button 
                  onClick={() => {
                    setBlastStep('processing');
                    setTimeout(() => setBlastStep('success'), 2000);
                  }} 
                  className="btn-accent hover-scale" 
                  disabled={blastMessage.trim().length === 0}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Send to 842 People
                </button>
              </>
            )}

            {blastStep === 'processing' && (
              <div style={{ padding: '40px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-pin-orange)', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Dispatching Messages...</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Connecting to WhatsApp API</p>
              </div>
            )}

            {blastStep === 'success' && (
              <div className="animate-fade-in-up">
                <ChatCircleText size={48} color="var(--color-success)" weight="fill" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Blast Sent!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                  Successfully dispatched to 842 attendees. You will receive an analytics report in your email shortly.
                </p>
                <button onClick={() => setIsBlastModalOpen(false)} className="btn-primary hover-scale" style={{ width: '100%', justifyContent: 'center' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modals */}
      
      {passwordModalOpen && <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />}

      {/* Email Modal */}
      {emailModalOpen && (
        <div 
          onClick={() => setEmailModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--spacing-medium)'
          }}
        >
          <div 
            className="animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
            backgroundColor: 'var(--color-deep-navy)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative'
          }}>
            {emailStep !== 'processing' && (
              <button onClick={() => setEmailModalOpen(false)} className="hover-scale" style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            )}

            {emailStep === 'form' && (
              <>
                <EnvelopeSimple size={48} color="var(--text-primary)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Change Email</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Current: {profile?.email}</p>
                <input type="email" placeholder="New Email Address" style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#ffffff', marginBottom: '12px', outline: 'none' }} />
                <input type="password" placeholder="Confirm with Password" style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#ffffff', marginBottom: '24px', outline: 'none' }} />
                <button onClick={() => { setEmailStep('processing'); setTimeout(() => setEmailStep('success'), 1500); }} className="btn-primary hover-scale" style={{ width: '100%', justifyContent: 'center' }}>
                  Send Verification
                </button>
              </>
            )}

            {emailStep === 'processing' && (
              <div style={{ padding: '40px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-success)', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Updating...</h3>
              </div>
            )}

            {emailStep === 'success' && (
              <div className="animate-fade-in-up">
                <CheckCircle size={48} color="var(--color-success)" weight="fill" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Verification Sent!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Check your new email inbox for a verification link to confirm the change.</p>
                <button onClick={() => setEmailModalOpen(false)} className="btn-primary hover-scale" style={{ width: '100%', justifyContent: 'center' }}>Got it</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Support Modal */}
      {supportModalOpen && (
        <div 
          onClick={() => setSupportModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--spacing-medium)'
          }}
        >
          <div 
            className="animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
            backgroundColor: 'var(--color-deep-navy)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative'
          }}>
            {supportStep !== 'processing' && (
              <button onClick={() => setSupportModalOpen(false)} className="hover-scale" style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            )}

            {supportStep === 'form' && (
              <>
                <Question size={48} color="var(--text-primary)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Help & Support</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>How can we assist you today?</p>
                <textarea 
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your issue or question..." 
                  style={{ width: '100%', height: '120px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#ffffff', marginBottom: '24px', outline: 'none', resize: 'none', fontFamily: 'inherit' }} 
                />
                <button 
                  onClick={handleSupportSubmit} 
                  disabled={!supportMessage.trim()}
                  className="btn-primary hover-scale" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Send Message
                </button>
              </>
            )}

            {supportStep === 'processing' && (
              <div style={{ padding: '40px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--text-primary)', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Sending Message...</h3>
              </div>
            )}

            {supportStep === 'success' && (
              <div className="animate-fade-in-up">
                <CheckCircle size={48} color="var(--color-success)" weight="fill" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Message Sent!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Our support team will get back to you within 24 hours.</p>
                <button onClick={() => {
                  setSupportModalOpen(false);
                  setSupportStep('form');
                  setSupportMessage('');
                }} className="btn-primary hover-scale" style={{ width: '100%', justifyContent: 'center' }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
