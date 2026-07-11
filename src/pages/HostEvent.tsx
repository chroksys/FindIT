import React, { useRef, useState, useEffect } from 'react';
import { UploadSimple, MapPin, CalendarBlank, Link as LinkIcon, CurrencyDollar, WarningCircle, ArrowRight, CaretLeft, Spinner, ShieldCheck, LockKey } from '@phosphor-icons/react';
import type { HostProfile } from '../context/UserContext';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { uploadFile } from '../lib/uploadFile';

export const HostEvent: React.FC = () => {
  const { addEvent, updateEvent, events } = useEventContext();
  const { getEventLimit, role, profile } = useUserContext();
  const hostProfile = profile as HostProfile;
  const isVerified = hostProfile?.verificationStatus === 'verified';
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const activeEventsCount = events.length; 
  const isLimitReached = !isEditing && activeEventsCount >= getEventLimit();

  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState('');
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    setBannerUploadError('');
    try {
      const url = await uploadFile(file, 'event-banners', 'banners/');
      setFormData(prev => ({ ...prev, bannerUrl: url }));
    } catch (err: any) {
      setBannerUploadError('Banner upload failed: ' + err.message);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    ticketLink: '',
    price: '',
    bannerUrl: 'https://images.unsplash.com/photo-1540039155732-68421c713fca?auto=format&fit=crop&q=80&w=1200', 
    earlyBirdDeadline: '',
    earlyBirdPrice: '',
    collaborationEventId: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      const eventToEdit = events.find(e => e.id === id);
      if (eventToEdit) {
        setFormData({
          title: eventToEdit.title,
          category: eventToEdit.category,
          date: eventToEdit.date,
          time: eventToEdit.time,
          venue: eventToEdit.venue,
          description: eventToEdit.description,
          ticketLink: eventToEdit.ticketLink || '',
          price: eventToEdit.price || '',
          bannerUrl: eventToEdit.bannerUrl,
          earlyBirdDeadline: eventToEdit.earlyBird?.deadline ? eventToEdit.earlyBird.deadline.substring(0, 16) : '',
          earlyBirdPrice: eventToEdit.earlyBird?.price || '',
          collaborationEventId: eventToEdit.collaborations?.[0] || ''
        });
      }
    }
  }, [id, isEditing, events]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const displayDate = formData.date ? new Date(formData.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
    
    let displayTime = 'TBD';
    if (formData.time) {
      const [hourStr, minStr] = formData.time.split(':');
      const hour = parseInt(hourStr, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      displayTime = `${formattedHour}:${minStr} ${ampm}`;
    }

    const eventPayload: any = {
      title: formData.title,
      category: formData.category,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      description: formData.description,
      ticketLink: formData.ticketLink,
      price: formData.price,
      bannerUrl: formData.bannerUrl,
      displayDate,
      displayTime,
      distance: '0km away' 
    };

    if (formData.earlyBirdDeadline && formData.earlyBirdPrice) {
      eventPayload.earlyBird = {
        deadline: new Date(formData.earlyBirdDeadline).toISOString(),
        price: formData.earlyBirdPrice
      };
    }
    
    if (formData.collaborationEventId) {
      eventPayload.collaborations = [formData.collaborationEventId];
    }

    if (isEditing && id) {
      setIsPublishing(true);
      await updateEvent(id, eventPayload);
      setIsPublishing(false);
    } else {
      setIsPublishing(true);
      await addEvent(eventPayload);
      setIsPublishing(false);
    }

    navigate('/dashboard');
  };

  return (
    <div className="container section mobile-page-pad" style={{ maxWidth: '800px' }}>
      {role !== 'host' ? (
        <div className="card-padding text-center animate-fade-in-up" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', margin: '40px auto' }}>
          <WarningCircle size={48} color="var(--color-pin-orange)" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h2 className="text-section" style={{ fontSize: '24px', marginBottom: '12px' }}>Host Access Required</h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Only registered organizers can host and manage events. If you'd like to create an event, please register as a host.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn-secondary hover-scale">Go to Dashboard</Link>
            <Link to="/login" className="btn-accent hover-scale">Create Host Account</Link>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 'var(--spacing-xlarge)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 className="text-hero animate-fade-in-up" style={{ marginBottom: 'var(--spacing-small)' }}>
              {isEditing ? 'Edit your event' : 'Host your next event'}
            </h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ 
                  flex: 1, 
                  height: '4px', 
                  backgroundColor: step >= i ? 'var(--color-pin-orange)' : 'var(--border-color)',
                  borderRadius: '2px',
                  transition: 'background-color 0.3s'
                }} />
              ))}
            </div>
            <p className="text-caption animate-fade-in-up" style={{ color: 'var(--text-secondary)' }}>
              Step {step} of 4: {step === 1 ? 'Basic Info' : step === 2 ? 'Logistics' : step === 3 ? 'Ticketing' : 'Promotion'}
            </p>
          </div>

          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="animate-fade-in-up" style={{ 
            animationDelay: '0.2s',
            backgroundColor: 'var(--bg-card)', 
            padding: 'var(--spacing-large)', 
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-large)'
          }}>

            {step === 1 && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Event Banner</label>
                  <div
                  className="hover-lift"
                  style={{ 
                    border: '2px dashed var(--border-color)', 
                    borderRadius: 'var(--radius-card)',
                    padding: 'var(--spacing-xlarge)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-small)',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-deep-navy)',
                    backgroundImage: `url(${formData.bannerUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {isUploadingBanner ? (
                    <>
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 15, 30, 0.7)' }}></div>
                      <Spinner size={32} color="var(--color-white)" style={{ zIndex: 1, animation: 'spin 1s linear infinite' }} />
                      <span className="text-body" style={{ color: 'var(--color-white)', zIndex: 1 }}>Uploading banner...</span>
                    </>
                  ) : formData.bannerUrl && !formData.bannerUrl.includes('unsplash') ? (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(15, 15, 30, 0.8)', padding: '8px 16px', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', zIndex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
                       <UploadSimple size={16} />
                       <span className="text-caption">Change</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 15, 30, 0.7)' }}></div>
                      <UploadSimple size={32} color="var(--color-white)" style={{ zIndex: 1 }} />
                      <span className="text-body" style={{ color: 'var(--color-white)', zIndex: 1 }}>Click to upload banner image</span>
                      <span className="text-caption" style={{ color: 'var(--color-white)', zIndex: 1 }}>16:9 ratio recommended · Max 10MB</span>
                    </>
                  )}
                  {bannerUploadError && <span className="text-caption" style={{ color: '#ff6b6b', zIndex: 1, position: 'absolute', bottom: '16px' }}>{bannerUploadError}</span>}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleBannerUpload}
                />
                </div>

                <div className="grid-responsive" style={{ display: 'grid', gap: 'var(--spacing-large)' }}>
                  <div className="form-group">
                    <label className="form-label">Event Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} type="text" placeholder="e.g. Nyege Nyege Festival" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} required>
                      <option value="" disabled>Select category</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Music">Music</option>
                      <option value="Games">Games</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Art">Art</option>
                      <option value="Business">Business</option>
                      <option value="Travel">Travel</option>
                      <option value="Family">Family</option>
                      <option value="Sport">Sport</option>
                      <option value="Hobbies">Hobbies</option>
                      <option value="Community">Community</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Tell attendees what to expect..." required></textarea>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid-responsive" style={{ display: 'grid', gap: 'var(--spacing-large)' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <div style={{ position: 'relative' }}>
                      <CalendarBlank size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input name="date" value={formData.date} onChange={handleChange} type="date" min={new Date().toISOString().split('T')[0]} style={{ paddingLeft: '40px' }} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input name="time" value={formData.time} onChange={handleChange} type="time" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue Location</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input name="venue" value={formData.venue} onChange={handleChange} type="text" placeholder="e.g. Serena Hotel, Kampala" style={{ paddingLeft: '40px' }} required />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {/* Verification gate banner */}
                {!isVerified ? (
                  <div style={{ backgroundColor: 'rgba(255, 107, 0, 0.08)', border: '1px solid rgba(255,107,0,0.4)', borderRadius: 'var(--radius-card)', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <LockKey size={32} color="var(--color-pin-orange)" weight="fill" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-pin-orange)', marginBottom: '6px' }}>Online Ticket Sales Locked</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Online ticket sales are exclusively available to <strong style={{ color: 'var(--text-primary)' }}>verified organizers</strong>. You can still publish this event — attendees will pay in cash / at the gate.
                      </p>
                      <Link to="/verify" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--color-pin-orange)', fontWeight: 600, fontSize: '14px' }}>
                        <ShieldCheck size={16} /> Get Verified to Unlock
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: 'rgba(46, 213, 115, 0.08)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: 'var(--radius-card)', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <ShieldCheck size={22} color="var(--color-success)" weight="fill" />
                    <span style={{ fontSize: '14px', color: 'var(--color-success)', fontWeight: 600 }}>Verified Organizer — Online ticket sales enabled</span>
                  </div>
                )}

                <div className="grid-responsive" style={{ display: 'grid', gap: 'var(--spacing-large)', opacity: isVerified ? 1 : 0.4, pointerEvents: isVerified ? 'auto' : 'none' }}>
                  <div className="form-group">
                    <label className="form-label">Ticket Link (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input name="ticketLink" value={formData.ticketLink} onChange={handleChange} type="url" placeholder="https://..." style={{ paddingLeft: '40px' }} disabled={!isVerified} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (for online sales)</label>
                    <div style={{ position: 'relative' }}>
                      <CurrencyDollar size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input name="price" value={formData.price} onChange={handleChange} type="text" placeholder="e.g. 50,000 UGX" style={{ paddingLeft: '40px' }} disabled={!isVerified} />
                    </div>
                  </div>
                </div>

                <div className="grid-responsive" style={{ display: 'grid', gap: 'var(--spacing-large)', marginBottom: 'var(--spacing-large)', opacity: isVerified ? 1 : 0.4, pointerEvents: isVerified ? 'auto' : 'none' }}>
                  <div className="form-group" style={{ backgroundColor: 'rgba(255,107,0,0.05)', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-pin-orange)' }}>
                    <label className="form-label" style={{ color: 'var(--color-pin-orange)' }}>Early Bird Deadline (Optional)</label>
                    <input name="earlyBirdDeadline" value={formData.earlyBirdDeadline} onChange={handleChange} type="datetime-local" className="input-field" style={{ backgroundColor: 'var(--bg-default)' }} disabled={!isVerified} />
                  </div>
                  <div className="form-group" style={{ backgroundColor: 'rgba(255,107,0,0.05)', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-pin-orange)' }}>
                    <label className="form-label" style={{ color: 'var(--color-pin-orange)' }}>Early Bird Price (Optional)</label>
                    <input name="earlyBirdPrice" value={formData.earlyBirdPrice} onChange={handleChange} type="text" placeholder="e.g. $30" className="input-field" style={{ backgroundColor: 'var(--bg-default)' }} disabled={!isVerified} />
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="form-group" style={{ marginBottom: 'var(--spacing-large)' }}>
                  <label className="form-label">Official Collaboration / Cross-Promotion (Optional)</label>
                  <select name="collaborationEventId" value={formData.collaborationEventId} onChange={handleChange} className="input-field">
                    <option value="">None</option>
                    {events.filter(e => e.id !== id).map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                  <span className="text-caption" style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Select another event to feature as an official partner or after-party.</span>
                </div>

                {isLimitReached && (
                  <div className="card-padding" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-card)', display: 'flex', gap: 'var(--spacing-base)', alignItems: 'center' }}>
                    <WarningCircle size={32} color="var(--color-error)" />
                    <div>
                      <h3 className="text-card-title" style={{ color: 'var(--color-error)', marginBottom: '4px' }}>Event Limit Reached</h3>
                      <p className="text-body" style={{ color: 'var(--text-primary)' }}>You have reached the maximum number of events allowed on your current subscription plan.</p>
                      <Link to="/pricing" style={{ color: 'var(--color-pin-orange)', fontWeight: 600, display: 'inline-block', marginTop: '8px' }}>Upgrade Plan</Link>
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-large)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={step === 1 ? () => navigate(isEditing ? '/dashboard' : '/') : prevStep}
              >
                {step === 1 ? 'Cancel' : <><CaretLeft size={20}/> Back</>}
              </button>
              
              {step < 4 ? (
                <button type="submit" className="btn-secondary hover-scale" style={{ padding: '12px 32px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  Next <ArrowRight size={20} />
                </button>
              ) : (
                <button type="submit" disabled={isLimitReached || isPublishing} className={`btn-accent hover-scale ${(isLimitReached || isPublishing) ? 'disabled' : ''}`} style={{ padding: '12px 32px', opacity: (isLimitReached || isPublishing) ? 0.7 : 1, cursor: (isLimitReached || isPublishing) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isPublishing ? <><Spinner size={18} style={{ animation: 'spin 1s linear infinite' }} /> Publishing...</> : (isEditing ? 'Save Changes' : 'Publish Event')}
                </button>
              )}
            </div>

          </form>
        </>
      )}
    </div>
  );
};
