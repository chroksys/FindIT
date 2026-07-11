import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, UserCircle, Compass, Plus, User, Broadcast, Bell, CalendarBlank } from '@phosphor-icons/react';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useTheme();
  const { role, profile } = useUserContext();
  const { t } = useLanguage();
  const isHome = location.pathname === '/';
  
  const [showNotifications, setShowNotifications] = useState(false);
  const mockNotifications: any[] = [];
  
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  
  // Hide entire global navbar for immersive live pages
  if (location.pathname.startsWith('/live/') && location.pathname !== '/live') return null;
  if (location.pathname.startsWith('/host/live/')) return null;


  return (
    <>
      {/* Top Navigation */}
      <nav className="navbar-top" style={{ 
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-navbar)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo(Light).svg" 
              alt="FindIt Logo" 
              style={{ 
                height: '36px',
                width: 'auto',
                filter: 'drop-shadow(0 0 8px rgba(255, 87, 34, 0.3))'
              }}
            />
            <span className="text-section" style={{ display: 'none', margin: 0, fontSize: '24px' }}>FindIt</span>
          </Link>

          {/* Right Side: Desktop Nav + Universal Theme Toggle */}
          <div style={{ display: 'flex', gap: 'var(--spacing-large)', alignItems: 'center' }}>
            
            <div className="hide-on-mobile" style={{ display: 'flex', gap: 'var(--spacing-large)', alignItems: 'center' }}>
              <Link to="/" className="text-body hover-scale" style={{ 
                fontWeight: location.pathname === '/' ? 700 : 400,
                color: location.pathname === '/' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>
                {t('discover')}
              </Link>
              <Link to="/live" className="text-body hover-scale" style={{ 
                fontWeight: location.pathname === '/live' ? 700 : 400,
                color: location.pathname === '/live' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>
                {t('live_snippets')}
              </Link>
              <Link to="/host" className="text-body hover-scale" style={{ 
                fontWeight: location.pathname.startsWith('/host') ? 700 : 400,
                color: location.pathname.startsWith('/host') ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>
                {t('host_event')}
              </Link>
              <Link to="/dashboard" className="text-body hover-scale" style={{ 
                fontWeight: location.pathname === '/dashboard' ? 700 : 400,
                color: location.pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>
                {t('profile')}
              </Link>
            </div>
            
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button 
                className="btn-ghost hover-scale" 
                aria-label="Notifications" 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ padding: '8px', position: 'relative' }}
              >
                <Bell size={24} color="var(--text-primary)" />
                {unreadCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '2px', right: '2px', 
                    minWidth: '16px', height: '16px', 
                    backgroundColor: 'var(--color-error)', 
                    color: 'white', 
                    borderRadius: '8px', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--bg-default)',
                    padding: '0 4px',
                    lineHeight: 1
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="glass-dropdown animate-fade-in-up" style={{ 
                  position: 'absolute', top: '100%', right: '-10px', 
                  width: '320px', padding: '0', overflow: 'hidden', zIndex: 100 
                }}>
                  <div style={{ padding: 'var(--spacing-base)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-default)' }}>
                    <h3 className="text-section" style={{ fontSize: '16px', margin: 0 }}>{t('notifications')}</h3>
                    <button className="text-caption" style={{ color: 'var(--color-pin-orange)', background: 'none', border: 'none', cursor: 'pointer' }}>{t('mark_all_read')}</button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {mockNotifications.length > 0 ? mockNotifications.map(notification => (
                      <div key={notification.id} onClick={() => { navigate(notification.link); setShowNotifications(false); }} style={{ 
                        padding: 'var(--spacing-base)', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: notification.read ? 'var(--bg-card)' : 'rgba(255,107,0,0.05)',
                        cursor: 'pointer'
                      }} className="hover-lift">
                        <div className="text-body" style={{ fontSize: '14px', marginBottom: '4px' }}>{notification.text}</div>
                        <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{notification.time}</div>
                      </div>
                    )) : (
                      <div style={{ padding: 'var(--spacing-large)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No new notifications
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 'var(--spacing-small)', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                    <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-caption hover-scale" style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'inline-block' }}>{t('view_all')}</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="hide-on-mobile" style={{ display: 'flex', gap: 'var(--spacing-large)', alignItems: 'center' }}>
              <Link to="/search" className="btn-ghost hover-scale" style={{ padding: '8px' }} aria-label="Search">
                <MagnifyingGlass size={24} />
              </Link>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>
              {role === 'guest' ? (
                <Link to="/login" className="btn-primary hover-scale" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <UserCircle size={20} />
                  {t('log_in')}
                </Link>
              ) : (
                <Link to="/account" className="btn-secondary hover-scale" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Profile" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <UserCircle size={20} />
                  )}
                  {t('account')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>



      {/* Mobile Bottom Navigation */}
      <nav className="navbar-bottom hide-on-desktop">
        <Link to="/" className={`nav-item-mobile ${location.pathname === '/' ? 'active' : ''}`}>
          <Compass size={24} weight={location.pathname === '/' ? 'fill' : 'regular'} />
          <span>{t('discover')}</span>
        </Link>
        <Link to="/calendar" className={`nav-item-mobile ${location.pathname === '/calendar' ? 'active' : ''}`}>
          <CalendarBlank size={24} weight={location.pathname === '/calendar' ? 'fill' : 'regular'} />
          <span>Calendar</span>
        </Link>
        <Link to="/host/create" className={`nav-item-mobile center-btn ${location.pathname.startsWith('/host') ? 'active' : ''}`}>
          <Plus size={28} weight="bold" />
          <span>{t('host_event')}</span>
        </Link>
        <Link to="/live" className={`nav-item-mobile ${location.pathname === '/live' ? 'active' : ''}`}>
          <Broadcast size={24} weight={location.pathname === '/live' ? 'fill' : 'regular'} />
          <span>Live</span>
        </Link>
        {role === 'guest' ? (
          <Link to="/login" className={`nav-item-mobile ${location.pathname === '/login' ? 'active' : ''}`}>
            <User size={24} weight={location.pathname === '/login' ? 'fill' : 'regular'} />
            <span>{t('log_in')}</span>
          </Link>
        ) : (
          <Link to="/dashboard" className="text-body hover-scale" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: location.pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Profile" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <UserCircle size={24} weight={location.pathname === '/dashboard' ? 'fill' : 'regular'} />
              )}
            </Link>
        )}
      </nav>
    </>
  );
};
