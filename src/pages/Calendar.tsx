import { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { useLanguage } from '../context/LanguageContext';
import { ViewAllModal } from '../components/ViewAllModal';
import { CalendarBlank } from '@phosphor-icons/react';

export const Calendar = () => {
  const { events } = useEventContext();
  const { t } = useLanguage();
  
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateLabel, setSelectedDateLabel] = useState('');

  // Let's create 24 months for the UI
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const generateMonthData = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    
    // Padding for first day offset (Sun = 0)
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });
    return { year, month, monthName, days };
  };

  const monthsToRender = Array.from({ length: 24 }).map((_, i) => {
    const d = new Date(currentYear, currentMonth + i, 1);
    return generateMonthData(d.getFullYear(), d.getMonth());
  });

  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map events to their actual dates
  const savedEvents = events.filter(e => !e.isPaused && !e.parentEventId); 
  
  const mappedEvents = savedEvents.map((e) => {
    // Parse the ISO date string (e.g., "2026-08-15") rather than the displayDate string
    // Adding T12:00:00 ensures we don't accidentally shift by a day due to timezone differences
    const eventDate = new Date(e.date ? `${e.date}T12:00:00` : e.displayDate);
    
    // If the date is invalid (maybe just says "Tomorrow"), fallback to today + random days
    if (isNaN(eventDate.getTime())) {
      return { ...e, calendarDay: 1, calendarMonth: currentMonth, calendarYear: currentYear };
    }
    
    return { 
      ...e, 
      calendarDay: eventDate.getDate(), 
      calendarMonth: eventDate.getMonth(), 
      calendarYear: eventDate.getFullYear() 
    };
  });

  const getEventsForDay = (day: number, month: number, year: number) => {
    return mappedEvents.filter(e => e.calendarDay === day && e.calendarMonth === month && e.calendarYear === year);
  };

  const handleDayClick = (day: number, month: number, year: number, monthName: string) => {
    const dayEvents = getEventsForDay(day, month, year);
    if (dayEvents.length > 0) {
      setSelectedDayEvents(dayEvents);
      setSelectedDateLabel(`${monthName} ${day}, ${year}`);
      setIsModalOpen(true);
    }
  };

  return (
    <div style={{ paddingBottom: '120px' }}>
      <section className="page-with-nav" style={{ position: 'relative' }}>
        <div className="container">
          
          <h1 className="animate-fade-in-up" style={{ 
            fontSize: 'clamp(28px, 8vw, 36px)', 
            fontWeight: 800, 
            lineHeight: 1.1,
            marginBottom: 'var(--spacing-xlarge)',
            marginTop: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CalendarBlank size={32} weight="fill" color="var(--color-pin-orange)" />
            {t('calendar')}
          </h1>

          {monthsToRender.map((monthData, mIndex) => (
            <div 
              key={`${monthData.year}-${monthData.month}`} 
              className="animate-fade-in-up" 
              style={{ marginBottom: '64px', animationDelay: `${mIndex * 0.1}s` }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: '#ffffff' }}>
                {monthData.monthName} {monthData.year}
              </h2>

              {/* Days of week header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '8px',
                marginBottom: '16px'
              }}>
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} style={{ 
                    textAlign: 'center', 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: 'var(--text-secondary)' 
                  }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid of days */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '12px 8px', // larger gap vertically
                placeItems: 'center'
              }}>
                {monthData.days.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} />;
                  }

                  const dayEvents = getEventsForDay(day, monthData.month, monthData.year);
                  const hasEvents = dayEvents.length > 0;
                  const firstEventBanner = hasEvents ? dayEvents[0].bannerUrl : null;

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day, monthData.month, monthData.year, monthData.monthName)}
                      className={hasEvents ? 'hover-scale' : ''}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: hasEvents ? 'transparent' : 'rgba(255,255,255,0.1)',
                        background: hasEvents 
                          ? `url(${firstEventBanner}) center/cover no-repeat` 
                          : 'rgba(255,255,255,0.03)',
                        color: hasEvents ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '14px',
                        fontWeight: hasEvents ? 800 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: hasEvents ? 'pointer' : 'default',
                        padding: 0,
                        position: 'relative',
                        boxShadow: hasEvents ? '0 4px 15px rgba(0,0,0,0.5)' : 'none',
                        textShadow: hasEvents ? '0 2px 4px rgba(0,0,0,0.8)' : 'none'
                      }}
                    >
                      {/* Dark overlay to make text readable on image */}
                      {hasEvents && (
                        <div style={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          borderRadius: '50%',
                          zIndex: 1
                        }} />
                      )}
                      
                      <span style={{ position: 'relative', zIndex: 2 }}>{day}</span>
                      
                      {/* Multiple events indicator dot */}
                      {dayEvents.length > 1 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-4px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-pin-orange)',
                          zIndex: 3
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* Pop-up Modal for Events */}
      {isModalOpen && (
        <ViewAllModal 
          title={selectedDateLabel}
          items={selectedDayEvents}
          type="event"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
