import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../components/EventCard';
import { MapPin, MagnifyingGlass, CaretDown } from '@phosphor-icons/react';
import { useEventContext } from '../context/EventContext';
import { useLanguage } from '../context/LanguageContext';

export const Home = () => {
  const { events, selectedCity, setSelectedCity } = useEventContext();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const CITIES = ['All', 'Kampala', 'Nairobi', 'Jinja'];

  const activeEvents = events.filter(e => {
    if (e.isPaused) return false;
    if (selectedCity !== 'All' && e.city !== selectedCity) return false;
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    return true;
  });

  const hottestEvents = activeEvents.filter(e => e.isBoosted);
  const followedEvents = activeEvents.filter(e => e.organizer.isFollowed);
  
  // For discover more, we can just show everything, or exclude the ones already grouped.
  // We'll just show activeEvents for now since it's a general feed, but we can exclude hottest if needed.


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xlarge)' }}>
      {/* Hero / Search Section */}
      <section style={{ 
        paddingTop: 'var(--spacing-hero)',
        paddingBottom: 'var(--spacing-large)',
        position: 'relative'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          
          {/* Location / City Selection */}
          <div className="animate-fade-in-up" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '24px',
            position: 'relative',
            zIndex: 100 /* higher z-index for dropdown */
          }}>
            <MapPin size={18} color="#ffffff" weight="fill" />
            
            {/* Custom Dropdown Trigger */}
            <div 
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}
            >
              <span style={{ 
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
              }}>
                {selectedCity === 'All' ? t('all_cities') : selectedCity}
              </span>
              <CaretDown 
                size={14} 
                color="#ffffff" 
                weight="bold" 
                style={{ 
                  transform: isCityDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>

            {/* Custom Dropdown Menu */}
            {isCityDropdownOpen && (
              <>
                {/* Backdrop to close when clicking outside */}
                <div 
                  onClick={() => setIsCityDropdownOpen(false)} 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                />
                
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '12px',
                  backgroundColor: 'rgba(25, 25, 30, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '160px',
                  zIndex: 100,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                  {CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      style={{
                        background: selectedCity === city ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        color: selectedCity === city ? '#ffffff' : 'var(--text-secondary)',
                        padding: '10px 16px',
                        textAlign: 'left',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: selectedCity === city ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover-scale"
                    >
                      {city === 'All' ? t('all_cities') : city}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-large)' }}>
            <h1 className="animate-fade-in-up" style={{ 
              fontSize: 'clamp(36px, 10vw, 56px)', 
              fontWeight: 800, 
              lineHeight: 1.1,
              maxWidth: '300px',
              margin: 0
            }}>
              Choose Today's Event
            </h1>
            
            <button 
              onClick={() => navigate('/search')}
              className="hover-scale animate-fade-in-up"
              style={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: '999px',
                width: '64px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                animationDelay: '0.1s',
                flexShrink: 0
              }}
            >
              <MagnifyingGlass size={28} weight="bold" color="#000000" />
            </button>
          </div>
          
          {/* Categories */}
          <div className="horizontal-scroll animate-fade-in-up" style={{ 
            gap: '12px', 
            paddingBottom: '16px', 
            margin: '0',
            width: '100%',
            animationDelay: '0.2s' 
          }}>
            {['All', 'Birthday', 'Music', 'Games', 'Anniversary', 'Wedding', 'Art', 'Business', 'Travel', 'Family', 'Sport', 'Hobbies', 'Community', 'Education'].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className="hover-scale" 
                  style={{
                    background: isActive ? '#ffffff' : 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: isActive ? '#000000' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    padding: '10px 24px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* For You / Personalized Section */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-large)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 className="text-section">{t('hottest_events')}</h2>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: 'var(--spacing-medium)' 
          }}>
            {hottestEvents.length > 0 ? hottestEvents.map(event => (
              <EventCard key={`hottest-${event.id}`} {...event} date={event.displayDate} />
            )) : (
              <p className="text-caption">No premium events matching this location.</p>
            )}
          </div>
        </div>
      </section>

      {/* Followed Hosts Section */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 'var(--spacing-xlarge)' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-large)', flexWrap: 'wrap', gap: 'var(--spacing-base)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 className="text-section">{t('from_hosts_you_follow')}</h2>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: 'var(--spacing-medium)' 
          }}>
            {followedEvents.length > 0 ? followedEvents.map(event => (
              <EventCard key={`followed-${event.id}`} {...event} date={event.displayDate} />
            )) : (
              <p className="text-caption">You aren't following any active hosts in this location.</p>
            )}
          </div>
        </div>
      </section>

      {/* Discover More Section */}
      <section className="section" style={{ paddingTop: 'var(--spacing-xlarge)' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-large)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 className="text-section">{t('discover_more')}</h2>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: 'var(--spacing-medium)' 
          }}>
            {activeEvents.map(event => (
              <EventCard key={`trending-${event.id}`} {...event} date={event.displayDate} />
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
};
