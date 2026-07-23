import React, { useRef, useState, useEffect } from 'react';
import { UploadSimple, MapPin, CalendarBlank, Link as LinkIcon, WarningCircle, ArrowRight, CaretLeft, Spinner, ShieldCheck, LockKey, UsersThree, UserCheck, Crown } from '@phosphor-icons/react';
import type { HostProfile } from '../context/UserContext';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import { CATEGORIES_LIST } from '../lib/categories';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Map } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { uploadFile } from '../lib/uploadFile';
import { supabase } from '../lib/supabase';
import { COUNTRIES, getMajorCities, CITY_COORDINATES } from '../lib/countries';

export const HostEvent: React.FC = () => {
  const { addEvent, updateEvent, events } = useEventContext();
  const { getEventLimit, role, profile } = useUserContext();
  const hostProfile = profile as HostProfile;
  const isVerified = hostProfile?.verificationStatus === 'verified';
  const isPro = hostProfile?.subscription === 'Pro' || hostProfile?.subscription === 'Growth';
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [availableHosts, setAvailableHosts] = useState<{ id: string; name: string; avatarUrl: string; verified: boolean }[]>([]);
  const [selectedHostIds, setSelectedHostIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchVerifiedHosts = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, verified')
        .eq('role', 'host')
        .neq('id', profile?.id || '');
      if (data) {
        setAvailableHosts(data.map((h: any) => ({
          id: h.id,
          name: h.name || 'Unknown Host',
          avatarUrl: h.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host',
          verified: Boolean(h.verified)
        })));
      }
    };
    if (profile?.id) fetchVerifiedHosts();
  }, [profile?.id]);
  
  const activeEventsCount = events.length; 
  const isLimitReached = !isEditing && activeEventsCount >= getEventLimit();

  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState('');
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

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
    endDate: '',
    endTime: '',
    venue: '',
    city: '',
    country: '',
    description: '',
    ticketLink: '',
    price: '',
    vipPrice: '',
    currency: 'USD',
    bannerUrl: 'https://images.unsplash.com/photo-1540039155732-68421c713fca?auto=format&fit=crop&q=80&w=1200', 
    earlyBirdDeadline: '',
    earlyBirdPrice: '',
    collaborationEventId: '',
    parentEventId: '',
    coordinates: { lat: 0.3476, lng: 32.5825 } // Default to Kampala
  });

  const [initializedId, setInitializedId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id && initializedId !== id) {
      const eventToEdit = events.find(e => e.id === id);
      if (eventToEdit) {
        if (eventToEdit.organizer?.id !== profile?.id) {
          navigate('/dashboard');
          return;
        }
        setFormData({
          title: eventToEdit.title,
          category: eventToEdit.category,
          date: eventToEdit.date,
          time: eventToEdit.time,
          endDate: eventToEdit.endDate || '',
          endTime: eventToEdit.endTime || '',
          venue: eventToEdit.venue,
          city: eventToEdit.city || '',
          country: eventToEdit.country || '',
          description: eventToEdit.description,
          ticketLink: eventToEdit.ticketLink || '',
          price: eventToEdit.price || '',
          vipPrice: eventToEdit.vipPrice || '',
          currency: eventToEdit.currency || 'USD',
          bannerUrl: eventToEdit.bannerUrl,
          earlyBirdDeadline: eventToEdit.earlyBird?.deadline ? eventToEdit.earlyBird.deadline.substring(0, 16) : '',
          earlyBirdPrice: eventToEdit.earlyBird?.price || '',
          collaborationEventId: eventToEdit.collaborations?.[0] || '',
          parentEventId: eventToEdit.parentEventId || '',
          coordinates: eventToEdit.coordinates || { lat: 0.3476, lng: 32.5825 }
        });
        setInitializedId(id);
      }
    }
  }, [id, isEditing, events, initializedId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountrySelect = (countryName: string) => {
    const suggested = getMajorCities(countryName);
    let newCity = formData.city;
    if (!suggested.includes(formData.city)) {
      newCity = suggested.length > 0 ? suggested[0] : '';
    }
    let newCoordinates = formData.coordinates;
    if (newCity && CITY_COORDINATES[newCity]) {
      newCoordinates = CITY_COORDINATES[newCity];
    }
    setFormData(prev => ({
      ...prev,
      country: countryName,
      city: newCity,
      coordinates: newCoordinates
    }));
  };

  const handleCitySelect = (cityName: string) => {
    let newCoordinates = formData.coordinates;
    if (CITY_COORDINATES[cityName]) {
      newCoordinates = CITY_COORDINATES[cityName];
    }
    setFormData(prev => ({
      ...prev,
      city: cityName,
      coordinates: newCoordinates
    }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let displayDate = 'TBD';
    if (formData.date) {
      const start = new Date(formData.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      if (formData.endDate && formData.endDate !== formData.date) {
        const end = new Date(formData.endDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        displayDate = `${start} - ${end}`;
      } else {
        displayDate = new Date(formData.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    
    let displayTime = 'TBD';
    if (formData.time) {
      const formatTime = (t: string) => {
        const [hourStr, minStr] = t.split(':');
        const hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minStr} ${ampm}`;
      };
      
      const startT = formatTime(formData.time);
      if (formData.endTime) {
        displayTime = `${startT} - ${formatTime(formData.endTime)}`;
      } else {
        displayTime = startT;
      }
    }

    const eventPayload: any = {
      title: formData.title,
      category: formData.category,
      date: formData.date,
      time: formData.time,
      endDate: formData.endDate || undefined,
      endTime: formData.endTime || undefined,
      venue: formData.venue,
      city: formData.city,
      country: formData.country,
      description: formData.description,
      ticketLink: formData.ticketLink,
      price: formData.price,
      vipPrice: formData.vipPrice,
      currency: formData.currency,
      bannerUrl: formData.bannerUrl,
      displayDate,
      displayTime,
      distance: '0km away',
      coordinates: formData.coordinates,
      parentEventId: formData.parentEventId || undefined
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

    if (selectedHostIds.length > 0) {
      eventPayload.invitedHostIds = selectedHostIds;
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
    <div className="container section page-with-nav" style={{ maxWidth: '800px' }}>
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
                  backgroundColor: step >= i ? 'var(--text-primary)' : 'var(--border-color)',
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
                      {CATEGORIES_LIST.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Part of a Main Event? (Optional)</label>
                  <select name="parentEventId" value={formData.parentEventId} onChange={handleChange}>
                    <option value="">None (This is a standalone/main event)</option>
                    {events
                      .filter(e => e.organizer?.id === profile?.id && (!id || e.id !== id) && !e.parentEventId)
                      .map(e => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
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
                    <label className="form-label">Start Date</label>
                    <div style={{ position: 'relative' }}>
                      <CalendarBlank size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input name="date" value={formData.date} onChange={handleChange} type="date" min={new Date().toISOString().split('T')[0]} style={{ paddingLeft: '40px' }} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input name="time" value={formData.time} onChange={handleChange} type="time" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '13px' }}>(Optional)</span></label>
                    <div style={{ position: 'relative' }}>
                      <CalendarBlank size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input name="endDate" value={formData.endDate} onChange={handleChange} type="date" min={formData.date || new Date().toISOString().split('T')[0]} style={{ paddingLeft: '40px' }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '13px' }}>(Optional)</span></label>
                    <input name="endTime" value={formData.endTime} onChange={handleChange} type="time" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue Name</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input name="venue" value={formData.venue} onChange={handleChange} type="text" placeholder="e.g. Serena Hotel" style={{ paddingLeft: '40px' }} required />
                  </div>
                </div>

                <div className="grid-responsive" style={{ display: 'grid', gap: 'var(--spacing-large)' }}>
                  {/* Country Selection First */}
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={(e) => handleCountrySelect(e.target.value)}
                      className="input-field"
                      style={{ appearance: 'none', cursor: 'pointer', width: '100%' }}
                      required
                    >
                      <option value="">-- Select Country --</option>
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Selection Second */}
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={(e) => handleCitySelect(e.target.value)}
                        type="text"
                        list="city-suggestions-list"
                        className="input-field"
                        placeholder={formData.country ? `e.g. ${getMajorCities(formData.country)[0] || 'Kampala'}` : 'Select country first'}
                        required
                        style={{ width: '100%' }}
                      />
                      <datalist id="city-suggestions-list">
                        {getMajorCities(formData.country).map(cityName => (
                          <option key={cityName} value={cityName} />
                        ))}
                      </datalist>
                    </div>

                    {/* Major City Suggestion Pills */}
                    {getMajorCities(formData.country).length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="text-caption" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Suggested:</span>
                        {getMajorCities(formData.country).slice(0, 6).map(cityName => (
                          <button
                            key={cityName}
                            type="button"
                            onClick={() => handleCitySelect(cityName)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              backgroundColor: formData.city === cityName ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                              color: formData.city === cityName ? '#ffffff' : 'var(--text-secondary)',
                              border: formData.city === cityName ? '1px solid var(--text-primary)' : '1px solid rgba(255, 255, 255, 0.12)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {cityName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Pinpoint Exact Location</label>
                  <p className="text-caption" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-small)' }}>Drag the map to place the pin exactly where your event is located.</p>
                  <div style={{ width: '100%', height: '250px', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                    {MAPBOX_TOKEN ? (
                      <Map
                        initialViewState={{
                          longitude: formData.coordinates.lng,
                          latitude: formData.coordinates.lat,
                          zoom: 13
                        }}
                        mapStyle="mapbox://styles/mapbox/dark-v11"
                        mapboxAccessToken={MAPBOX_TOKEN}
                        onMove={(evt) => setFormData(prev => ({ ...prev, coordinates: { lat: evt.viewState.latitude, lng: evt.viewState.longitude } }))}
                      >
                        {/* Center marker indicating where the map is pointing */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', pointerEvents: 'none', zIndex: 10 }}>
                          <MapPin size={36} weight="fill" color="var(--text-primary)" />
                        </div>
                      </Map>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-deep-navy)' }}>
                        <span className="text-caption">Mapbox token missing</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {!isVerified ? (
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <LockKey size={32} color="var(--text-primary)" weight="fill" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Online Ticket Sales Locked</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Online ticket sales are exclusively available to <strong style={{ color: 'var(--text-primary)' }}>verified organizers</strong>. You can still publish this event — attendees will pay in cash / at the gate.
                      </p>
                      <Link to="/verify" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'underline' }}>
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

                <div className="grid-responsive" style={{ display: 'grid', gap: 'var(--spacing-large)' }}>
                  <div className="form-group" style={{ opacity: isVerified ? 1 : 0.4, pointerEvents: isVerified ? 'auto' : 'none' }}>
                    <label className="form-label">Ticket Link (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input name="ticketLink" value={formData.ticketLink} onChange={handleChange} type="url" placeholder="https://..." style={{ paddingLeft: '40px' }} disabled={!isVerified} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (Gate / Online)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <input name="price" value={formData.price} onChange={handleChange} type="text" placeholder="General Entry" className="input-field" style={{ width: '100%' }} />
                      </div>
                      <select name="currency" value={formData.currency} onChange={handleChange} className="input-field" style={{ width: '90px', padding: '0 8px' }}>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="UGX">UGX</option>
                        <option value="KES">KES</option>
                        <option value="RWF">RWF</option>
                        <option value="TZS">TZS</option>
                        <option value="ZAR">ZAR</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid-responsive" style={{ display: 'grid', gap: 'var(--spacing-large)', marginBottom: 'var(--spacing-large)' }}>
                  <div className="form-group" style={{ backgroundColor: 'rgba(255,215,0,0.05)', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid rgba(255,215,0,0.4)' }}>
                    <label className="form-label" style={{ color: '#e6c200' }}>VIP Price (Optional)</label>
                    <input name="vipPrice" value={formData.vipPrice} onChange={handleChange} type="text" placeholder="VIP Entry" className="input-field" style={{ backgroundColor: 'var(--bg-default)' }} />
                  </div>
                  <div className="form-group" style={{ backgroundColor: 'rgba(255,107,0,0.05)', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-pin-orange)' }}>
                    <label className="form-label" style={{ color: 'var(--color-pin-orange)' }}>Early Bird Price (Optional)</label>
                    <input name="earlyBirdPrice" value={formData.earlyBirdPrice} onChange={handleChange} type="text" placeholder="Early Bird Entry" className="input-field" style={{ backgroundColor: 'var(--bg-default)' }} />
                  </div>
                  <div className="form-group" style={{ backgroundColor: 'rgba(255,107,0,0.05)', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-pin-orange)' }}>
                    <label className="form-label" style={{ color: 'var(--color-pin-orange)' }}>Early Bird Deadline</label>
                    <input name="earlyBirdDeadline" value={formData.earlyBirdDeadline} onChange={handleChange} type="datetime-local" className="input-field" style={{ backgroundColor: 'var(--bg-default)' }} />
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                {/* Multi-Host Co-Hosting Section */}
                <div className="form-group" style={{ marginBottom: 'var(--spacing-large)', backgroundColor: 'var(--bg-default)', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <UsersThree size={24} color="var(--text-primary)" weight="bold" />
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Co-Host & Collaborate</h3>
                        <p className="text-caption" style={{ color: 'var(--text-secondary)', margin: 0 }}>Invite other verified hosts to co-organize this event with you.</p>
                      </div>
                    </div>
                    {isPro && isVerified ? (
                      <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(46,213,115,0.15)', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={14} /> Pro Verified Feature
                      </span>
                    ) : (
                      <Link to="/pricing" style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(255,215,0,0.15)', color: '#e6c200', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Crown size={14} /> Requires Pro & Verified
                      </Link>
                    )}
                  </div>

                  {isPro && isVerified ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {availableHosts.length === 0 ? (
                        <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>No other registered hosts available yet.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                          {availableHosts.map(h => {
                            const isSelected = selectedHostIds.includes(h.id);
                            return (
                              <div
                                key={h.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedHostIds(prev => prev.filter(id => id !== h.id));
                                  } else {
                                    setSelectedHostIds(prev => [...prev, h.id]);
                                  }
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '10px 12px',
                                  borderRadius: '12px',
                                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-card)',
                                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <img src={h.avatarUrl} alt={h.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{h.verified ? 'Verified Host' : 'Host'}</div>
                                </div>
                                {isSelected ? <UserCheck size={18} color="var(--text-primary)" weight="bold" /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid var(--border-color)' }} />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: '12px', border: '1px dashed rgba(255,215,0,0.3)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      Co-hosting allows 2 or more verified hosts to collaborate on an event. Upgrade your subscription to <strong>Pro</strong> and complete <strong>Organizer Verification</strong> to unlock co-hosting invitations!
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--spacing-large)' }}>
                  <label className="form-label">Official Collaboration / Cross-Promotion (Optional)</label>
                  <select name="collaborationEventId" value={formData.collaborationEventId} onChange={handleChange} className="input-field">
                    <option value="">None</option>
                    {events
                      .filter(e => e.organizer?.id === profile?.id && (!id || e.id !== id))
                      .map(e => (
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
                      <Link to="/pricing" style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'inline-block', marginTop: '8px', textDecoration: 'underline' }}>Upgrade Plan</Link>
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
