import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CaretLeft, MapPin, ChatCircleText, Megaphone, WarningCircle, PaperPlaneRight, Camera
} from '@phosphor-icons/react';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isHost?: boolean;
}

export const AttendeeLiveMode: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events } = useEventContext();
  const { profile, role } = useUserContext();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'map'>('feed');
  const [inputText, setInputText] = useState('');
  
  const event = events.find(e => e.id === id);

  // Mock chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'System', text: 'Welcome to the live experience!', time: '18:00' },
    { id: '2', user: 'Host', text: 'Gates are open! Head to the main stage.', time: '18:15', isHost: true },
    { id: '3', user: 'Sarah M.', text: 'The vibe here is crazy already 🔥', time: '18:20' },
    { id: '4', user: 'David K.', text: 'Where is the merchandise tent?', time: '18:25' }
  ]);

  useEffect(() => {
    // If not logged in, maybe we still let them view, but they can't chat?
    // Let's just let anyone view, but restrict chat input in the UI.
  }, [role]);

  if (!event) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0' }}>
        <h1 className="text-hero" style={{ marginBottom: 'var(--spacing-base)' }}>Event Not Found</h1>
        <Link to="/" className="btn-primary hover-scale">Back to Discover</Link>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    if (role === 'guest') {
      navigate('/login');
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: profile?.name || 'Attendee',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: role === 'host'
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-default)' }}>
      
      {/* Sticky Header */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 50, 
        backgroundColor: 'rgba(25, 25, 45, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)', padding: 'var(--spacing-base)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-base)' }}>
          <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: 0 }}>
            <CaretLeft size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>{event.title}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-error)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 600, fontSize: '11px', color: 'white', boxShadow: '0 2px 8px rgba(231, 76, 60, 0.4)' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
            LIVE
          </div>
        </div>

        {/* Announcement Banner */}
        <div style={{ backgroundColor: 'rgba(231, 76, 60, 0.15)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-card)', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <Megaphone size={18} color="var(--color-error)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p className="text-caption" style={{ color: 'var(--color-white)', fontWeight: 500 }}>
            <span style={{ color: 'var(--color-error)', fontWeight: 700 }}>HOST ANNOUNCEMENT:</span> Main stage acts are delayed by 15 mins. Grab a drink!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <button 
          onClick={() => setActiveTab('feed')}
          style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'feed' ? '2px solid var(--color-pin-orange)' : '2px solid transparent', color: activeTab === 'feed' ? 'var(--color-pin-orange)' : 'var(--text-secondary)', fontWeight: activeTab === 'feed' ? 600 : 400, background: 'none', border: 'none', borderBottomStyle: 'solid', borderBottomWidth: '2px', cursor: 'pointer' }}
        >
          <ChatCircleText size={20} /> Live Feed
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderBottom: activeTab === 'map' ? '2px solid var(--color-pin-orange)' : '2px solid transparent', color: activeTab === 'map' ? 'var(--color-pin-orange)' : 'var(--text-secondary)', fontWeight: activeTab === 'map' ? 600 : 400, background: 'none', border: 'none', borderBottomStyle: 'solid', borderBottomWidth: '2px', cursor: 'pointer' }}
        >
          <MapPin size={20} /> Venue Map
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        
        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div style={{ 
            padding: 'var(--spacing-base)', 
            paddingBottom: '100px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--spacing-base)',
            minHeight: '100%',
            backgroundImage: `linear-gradient(rgba(10, 10, 20, 0.85), rgba(10, 10, 20, 0.95)), url(${event.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.user === profile?.name ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px', alignSelf: msg.user === profile?.name ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: msg.isHost ? 'var(--color-pin-orange)' : 'var(--text-secondary)' }}>
                    {msg.isHost ? '👑 ' : ''}{msg.user}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{msg.time}</span>
                </div>
                <div style={{ 
                  padding: '10px 14px', 
                  borderRadius: '16px', 
                  borderBottomLeftRadius: msg.user === profile?.name ? '16px' : '4px',
                  borderBottomRightRadius: msg.user === profile?.name ? '4px' : '16px',
                  backgroundColor: msg.isHost ? 'rgba(255, 107, 0, 0.15)' : msg.user === profile?.name ? 'var(--color-navy)' : 'var(--bg-card)',
                  border: msg.isHost ? '1px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <div style={{ width: '100%', height: '100%' }}>
            {(event as any).coordinates ? (
              <Map
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN || ''}
                initialViewState={{
                  longitude: (event as any).coordinates.lng,
                  latitude: (event as any).coordinates.lat,
                  zoom: 16
                }}
                style={{width: '100%', height: '100%'}}
                mapStyle="mapbox://styles/mapbox/dark-v11"
              >
                <Marker longitude={(event as any).coordinates.lng} latitude={(event as any).coordinates.lat} anchor="bottom">
                  <div className="hover-scale" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <MapPin size={40} weight="fill" color="var(--color-pin-orange)" />
                    <div style={{ backgroundColor: 'var(--color-navy)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', fontSize: '12px', fontWeight: 600, border: '1px solid var(--color-pin-orange)' }}>
                      Main Stage
                    </div>
                  </div>
                </Marker>
              </Map>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                <WarningCircle size={32} />
                <p>Venue map unavailable</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Input Area (Only visible on feed tab) */}
      {activeTab === 'feed' && (
        <div style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          padding: 'var(--spacing-base)', 
          backgroundColor: 'rgba(25, 25, 45, 0.95)', backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--border-color)',
          zIndex: 50
        }}>
          {(event as any).organizer?.subscriptionTier === 'Pro' ? (
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-ghost" style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '50%' }}>
                <Camera size={20} />
              </button>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Say something to the crowd..."
                className="input-field"
                style={{ flex: 1, borderRadius: 'var(--radius-pill)', padding: '12px 20px', backgroundColor: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <button type="submit" className="btn-primary hover-scale" style={{ padding: '12px 16px', borderRadius: '50%' }}>
                <PaperPlaneRight size={20} weight="fill" />
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', color: 'var(--text-secondary)' }}>
              <WarningCircle size={20} />
              <span className="text-body" style={{ fontWeight: 500 }}>Chat is locked (Host not on Pro)</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
