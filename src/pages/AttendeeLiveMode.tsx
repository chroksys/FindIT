import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CaretLeft, MapPin, ChatCircleText, Megaphone, WarningCircle, PaperPlaneRight, Camera
} from '@phosphor-icons/react';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../lib/uploadFile';
import { CameraModal } from '../components/CameraModal';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  image_url?: string;
  time: string;
  is_host: boolean;
  created_at: string;
}

export const AttendeeLiveMode: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events } = useEventContext();
  const { profile, role } = useUserContext();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'map'>('feed');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const event = events.find(e => e.id === id);

  useEffect(() => {
    if (!event) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('live_feed_messages')
        .select('*, profiles(name)')
        .eq('event_id', event.id)
        .order('created_at', { ascending: true });

      if (data) {
        const formatted = data.map((msg: any) => ({
          id: msg.id,
          user_id: msg.user_id,
          user_name: msg.profiles?.name || 'Unknown',
          text: msg.text,
          image_url: msg.image_url,
          is_host: msg.is_host,
          created_at: msg.created_at,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formatted);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('public:live_feed_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_feed_messages',
        filter: `event_id=eq.${event.id}`
      }, async (payload) => {
        const msg = payload.new;
        // Fetch user profile for name
        const { data: profileData } = await supabase.from('profiles').select('name').eq('id', msg.user_id).single();
        
        const newMessage: ChatMessage = {
          id: msg.id,
          user_id: msg.user_id,
          user_name: profileData?.name || 'Unknown',
          text: msg.text,
          image_url: msg.image_url,
          is_host: msg.is_host,
          created_at: msg.created_at,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, newMessage]);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'live_feed_messages',
        filter: `event_id=eq.${event.id}`
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [event]);

  if (!event) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0' }}>
        <h1 className="text-hero" style={{ marginBottom: 'var(--spacing-base)' }}>Event Not Found</h1>
        <Link to="/" className="btn-primary hover-scale">Back to Discover</Link>
      </div>
    );
  }

  const handleSendMessage = async (e?: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !imageUrl) return;
    
    if (role === 'guest' || !profile?.id) {
      navigate('/login');
      return;
    }

    const text = inputText;
    setInputText('');

    await supabase.from('live_feed_messages').insert({
      event_id: event.id,
      user_id: profile.id,
      text: text,
      image_url: imageUrl || null,
      is_host: role === 'host' && event.organizer?.id === profile.id
    });
  };

  const handleCapturePhoto = async (file: File) => {
    setIsCameraOpen(false);
    setIsUploading(true);
    try {
      const url = await uploadFile(file, 'live-feed-images');
      await handleSendMessage(undefined, url);
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-default)' }}>
      {isCameraOpen && (
        <CameraModal 
          onCapture={handleCapturePhoto} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}
      
      {/* Sticky Header and Tabs */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 50, 
        backgroundColor: 'rgba(25, 25, 45, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ padding: 'var(--spacing-base)', paddingBottom: '16px' }}>
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
              <span style={{ color: 'var(--color-error)', fontWeight: 700 }}>LIVE CHAT:</span> Interact with the host and other attendees.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', padding: '0 var(--spacing-base) 16px var(--spacing-base)' }}>
        <button 
          onClick={() => setActiveTab('feed')}
          style={{ 
            flex: 1, padding: '10px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', 
            backgroundColor: activeTab === 'feed' ? 'var(--color-navy)' : 'transparent',
            color: activeTab === 'feed' ? 'var(--color-pin-orange)' : 'var(--text-secondary)', 
            border: activeTab === 'feed' ? '1px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <ChatCircleText size={20} /> Live Feed
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          style={{ 
            flex: 1, padding: '10px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', 
            backgroundColor: activeTab === 'map' ? 'var(--color-navy)' : 'transparent',
            color: activeTab === 'map' ? 'var(--color-pin-orange)' : 'var(--text-secondary)', 
            border: activeTab === 'map' ? '1px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <MapPin size={20} /> Venue Map
        </button>
      </div>
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
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                No messages yet. Be the first to say hi!
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.user_id === profile?.id ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px', alignSelf: msg.user_id === profile?.id ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: msg.is_host ? 'var(--color-pin-orange)' : 'var(--text-secondary)' }}>
                    {msg.is_host ? '👑 ' : ''}{msg.user_name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{msg.time}</span>
                </div>
                <div style={{ 
                  padding: '10px 14px', 
                  borderRadius: '16px', 
                  borderBottomLeftRadius: msg.user_id === profile?.id ? '16px' : '4px',
                  borderBottomRightRadius: msg.user_id === profile?.id ? '4px' : '16px',
                  backgroundColor: msg.is_host ? 'rgba(255, 107, 0, 0.15)' : msg.user_id === profile?.id ? 'var(--color-navy)' : 'var(--bg-card)',
                  border: msg.is_host ? '1px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}>
                  {msg.image_url && (
                    <img src={msg.image_url} alt="Live feed capture" style={{ width: '100%', borderRadius: '8px', marginBottom: msg.text ? '8px' : '0' }} />
                  )}
                  {msg.text && <div>{msg.text}</div>}
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
          {(event as any).organizer?.subscriptionTier === 'Pro' || true ? (
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => setIsCameraOpen(true)}
                disabled={isUploading}
                className="btn-ghost" 
                style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '50%' }}
              >
                <Camera size={20} color={isUploading ? 'gray' : 'white'} />
              </button>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Say something to the crowd..."
                className="input-field"
                disabled={isUploading}
                style={{ flex: 1, borderRadius: 'var(--radius-pill)', padding: '12px 20px', backgroundColor: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <button type="submit" disabled={isUploading || (!inputText.trim())} className="btn-primary hover-scale" style={{ padding: '12px 16px', borderRadius: '50%', opacity: (!inputText.trim() && !isUploading) ? 0.5 : 1 }}>
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
