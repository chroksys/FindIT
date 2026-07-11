import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CaretLeft, Megaphone, Users, Ticket, DeviceMobile, Trash, CheckCircle
} from '@phosphor-icons/react';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import type { HostProfile } from '../context/UserContext';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isHost?: boolean;
}

export const HostControlCenter: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events } = useEventContext();
  const { role, profile } = useUserContext();
  const hostProfile = profile as HostProfile;
  
  const [broadcastText, setBroadcastText] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const event = events.find(e => e.id === id);

  // Mock chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'System', text: 'Welcome to the live experience!', time: '18:00' },
    { id: '2', user: 'Host', text: 'Gates are open! Head to the main stage.', time: '18:15', isHost: true },
    { id: '3', user: 'Sarah M.', text: 'The vibe here is crazy already 🔥', time: '18:20' },
    { id: '4', user: 'David K.', text: 'Where is the merchandise tent?', time: '18:25' }
  ]);

  if (role !== 'host') {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0' }}>
        <h1 className="text-hero" style={{ marginBottom: 'var(--spacing-base)' }}>Access Denied</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>You must be logged in as a host to view this page.</p>
        <button className="btn-primary hover-scale" style={{ marginTop: 'var(--spacing-large)' }} onClick={() => navigate('/login')}>Log In</button>
      </div>
    );
  }

  if (hostProfile?.subscription !== 'Pro' && hostProfile?.subscription !== 'Growth') {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0' }}>
        <h1 className="text-hero" style={{ marginBottom: 'var(--spacing-base)', color: 'var(--color-pin-orange)' }}>Pro Feature</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-large)' }}>You must upgrade to a Pro or Growth subscription to broadcast live updates and moderate the chat.</p>
        <button className="btn-accent hover-scale" onClick={() => navigate('/pricing')}>Upgrade Now</button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0' }}>
        <h1 className="text-hero" style={{ marginBottom: 'var(--spacing-base)' }}>Event Not Found</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-primary hover-scale">Back to Dashboard</button>
      </div>
    );
  }

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    // In a real app, this would ping the database/websockets
    const newBroadcast: ChatMessage = {
      id: Date.now().toString(),
      user: 'Host',
      text: broadcastText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: true
    };
    
    setMessages([...messages, newBroadcast]);
    setBroadcastText('');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages(messages.filter(m => m.id !== msgId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-default)' }}>
      
      {/* Toast Notification */}
      {showToast && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-success)', color: 'white', padding: '12px 24px', borderRadius: 'var(--radius-pill)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', animation: 'fadeInUp 0.3s ease-out' }}>
          <CheckCircle size={20} weight="fill" />
          <span style={{ fontWeight: 600 }}>Announcement broadcasted!</span>
        </div>
      )}

      {/* Sticky Header */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 50, 
        backgroundColor: 'rgba(25, 25, 45, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)', padding: 'var(--spacing-small) var(--spacing-base)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ padding: 0 }}>
            <CaretLeft size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>{event.title}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-error)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 600, fontSize: '11px', color: 'white', boxShadow: '0 2px 8px rgba(231, 76, 60, 0.4)' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
            CONTROL CENTER
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-base)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>
        
        {/* Analytics Section */}
        <div>
          <h2 className="text-section" style={{ fontSize: '18px', marginBottom: 'var(--spacing-small)' }}>Live Stats</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-small)' }}>
            <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Users size={24} color="var(--color-pin-orange)" style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '20px', fontWeight: 700 }}>1.2k</div>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>Check-ins</div>
            </div>
            <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <DeviceMobile size={24} color="var(--color-success)" style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '20px', fontWeight: 700 }}>458</div>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>App Active</div>
            </div>
            <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Ticket size={24} color="var(--text-primary)" style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '20px', fontWeight: 700 }}>2k</div>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>Capacity</div>
            </div>
          </div>
        </div>

        {/* Broadcast Section */}
        <div className="card-padding" style={{ backgroundColor: 'rgba(231, 76, 60, 0.05)', borderRadius: 'var(--radius-card)', border: '1px dashed var(--color-error)' }}>
          <h2 className="text-section" style={{ fontSize: '18px', marginBottom: 'var(--spacing-small)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={20} color="var(--color-error)" /> Broadcast Announcement
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-base)' }}>
            Push a priority notification to all attendees currently using the app.
          </p>
          <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-small)' }}>
            <textarea 
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="e.g. 'Main acts delayed by 15 mins. Head to the bar!'"
              className="input-field"
              rows={3}
              style={{ borderRadius: 'var(--radius-input)', resize: 'none' }}
            />
            <button type="submit" className="btn-primary hover-scale" style={{ alignSelf: 'flex-end', backgroundColor: 'var(--color-error)', color: 'white' }}>
              Send Broadcast
            </button>
          </form>
        </div>

        {/* Feed Moderation Section */}
        <div style={{ paddingBottom: 'var(--spacing-hero)' }}>
          <h2 className="text-section" style={{ fontSize: '18px', marginBottom: 'var(--spacing-small)' }}>Live Feed Moderation</h2>
          <p className="text-caption" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-base)' }}>Delete inappropriate messages from the public feed.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-small)' }}>
            {messages.slice().reverse().map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: msg.isHost ? 'var(--color-pin-orange)' : 'var(--text-primary)' }}>{msg.user}</span>
                    <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>{msg.time}</span>
                  </div>
                  <p className="text-body" style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
                </div>
                {!msg.isHost && (
                  <button onClick={() => handleDeleteMessage(msg.id)} className="btn-ghost hover-scale" style={{ padding: '8px', color: 'var(--color-error)', backgroundColor: 'rgba(231, 76, 60, 0.1)' }}>
                    <Trash size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
