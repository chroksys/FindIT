import { useState } from 'react';
import { Heart, Bell, Ticket, ChatCircleText, CaretLeft, Star, SpinnerGap, UserCircle } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

export const Notifications = () => {
  const navigate = useNavigate();
  const { role, isLoading, notifications, unreadCount, markNotificationsAsRead, avatars } = useUserContext();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getIcon = (notif: any) => {
    const isFollow = notif.type === 'follow' || notif.message?.includes('following') || notif.link?.startsWith('/organizer/');
    if (isFollow && notif.link?.startsWith('/organizer/')) {
      const organizerId = notif.link.split('/organizer/')[1];
      if (avatars[organizerId]) {
        return <img src={avatars[organizerId]} alt="Follower Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />;
      }
      return <UserCircle size={24} color="var(--color-info)" weight="fill" />;
    }
    
    if (notif.type === 'review' && notif.link?.includes('?reviewer=')) {
      const reviewerId = notif.link.split('?reviewer=')[1];
      if (avatars[reviewerId]) {
        return <img src={avatars[reviewerId]} alt="Reviewer Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />;
      }
    }
    
    switch (notif.type) {
      case 'ticket': return <Ticket size={24} color="var(--color-success)" />;
      case 'live': return <Heart size={24} color="var(--color-error)" weight="fill" />;
      case 'review': return <Star size={24} color="var(--color-warning)" weight="fill" />;
      case 'chat': return <ChatCircleText size={24} color="var(--color-info)" />;
      case 'follow': return <UserCircle size={24} color="var(--color-info)" weight="fill" />;
      default: return <Bell size={24} color="var(--color-pin-orange)" />;
    }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="container section page-no-nav" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: 'var(--spacing-xlarge)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-base)', marginBottom: 'var(--spacing-xlarge)' }}>
        <Link to="/" className="btn-ghost hover-scale" style={{ padding: '8px' }}>
          <CaretLeft size={24} />
        </Link>
        <h1 className="text-section" style={{ fontSize: '32px', margin: 0 }}>All Notifications</h1>
        {unreadCount > 0 && (
          <span style={{ backgroundColor: 'var(--color-pin-orange)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
            {unreadCount}
          </span>
        )}
      </div>

      {role === 'guest' ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0' }}>
          <Bell size={48} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-base)' }}>
            Sign in to see your notifications.
          </p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-large)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-small)' }}>
              <button
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'btn-secondary' : 'btn-ghost'}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', ...(filter === 'all' ? { backgroundColor: 'var(--color-pin-orange)', color: 'white', borderColor: 'var(--color-pin-orange)' } : {}) }}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={filter === 'unread' ? 'btn-secondary' : 'btn-ghost'}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', ...(filter === 'unread' ? { backgroundColor: 'var(--color-pin-orange)', color: 'white', borderColor: 'var(--color-pin-orange)' } : {}) }}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
            {unreadCount > 0 && (
              <button className="btn-ghost text-caption" style={{ color: 'var(--text-secondary)' }} onClick={() => markNotificationsAsRead()}>
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0' }}>
              <SpinnerGap size={32} color="var(--color-pin-orange)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-hero) 0' }}>
              <Bell size={48} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-small)' }}>
              {filtered.map((notif, index) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationsAsRead(notif.id);
                    if (notif.link && notif.type !== 'follow') {
                      navigate(notif.link);
                    }
                  }}
                  className="animate-fade-in-up hover-lift card-padding"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    backgroundColor: notif.read ? 'var(--bg-card)' : 'rgba(255,107,0,0.05)',
                    borderRadius: 'var(--radius-card)',
                    border: `1px solid ${notif.read ? 'var(--border-color)' : 'rgba(255,107,0,0.2)'}`,
                    display: 'flex',
                    gap: 'var(--spacing-base)',
                    alignItems: 'flex-start',
                    cursor: notif.link ? 'pointer' : 'default'
                  }}
                >
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-default)', borderRadius: '50%', flexShrink: 0 }}>
                    {getIcon(notif)}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div className="text-body" style={{ fontWeight: notif.read ? 400 : 600, marginBottom: '4px' }}>
                      {notif.message.replace('👤 ', '')}
                    </div>
                    <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                      {formatTime(notif.created_at)}
                    </div>
                  </div>
                  {!notif.read && (
                    <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-pin-orange)', borderRadius: '50%', marginTop: '10px', flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
