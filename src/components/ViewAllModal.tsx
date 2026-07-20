import React from 'react';
import { X, Star } from '@phosphor-icons/react';
import { EventCard } from './EventCard';
import { useNavigate } from 'react-router-dom';

interface ViewAllModalProps {
  title: string;
  items: any[];
  type: 'event' | 'ticket' | 'host' | 'review' | 'attended';
  onClose: () => void;
  onItemClick?: (item: any) => void;
}

export const ViewAllModal: React.FC<ViewAllModalProps> = ({ title, items, type, onClose, onItemClick }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, padding: 'var(--spacing-medium)',
        overflowY: 'auto'
      }}
    >
      <div 
        className="animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)',
          width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-strong)',
          minHeight: '50vh',
          marginTop: '5vh',
          marginBottom: '5vh'
        }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-large)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', zIndex: 10, borderRadius: 'var(--radius-card) var(--radius-card) 0 0' }}>
          <h2 className="text-section" style={{ fontSize: '24px', margin: 0 }}>{title} <span className="text-body" style={{ color: 'var(--text-secondary)' }}>({items.length})</span></h2>
          <button className="btn-ghost hover-scale" onClick={onClose} style={{ padding: '8px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: 'var(--spacing-large)' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--spacing-xlarge) 0' }}>
              Nothing to show here yet.
            </div>
          ) : (
            <div style={{
              display: 'grid', 
              gridTemplateColumns: type === 'review' ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', 
              gap: 'var(--spacing-large)'
            }}>
              {items.map((item) => {
                
                if (type === 'event') {
                  return (
                    <div key={`modal-evt-${item.id}`} onClick={() => { if(onItemClick) onItemClick(item); else { navigate(`/events/${item.id}`); onClose(); } }}>
                      <EventCard {...item} date={item.displayDate} />
                    </div>
                  );
                }

                if (type === 'attended') {
                  return (
                    <div key={`modal-att-${item.id}`} className="hover-lift" style={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderRadius: 'var(--radius-card)', 
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      opacity: 0.8
                    }} onClick={() => { navigate(`/events/${item.id}`); onClose(); }}>
                      <img src={item.bannerUrl} alt={item.title} style={{ width: '100%', height: '120px', objectFit: 'cover', filter: 'grayscale(30%)' }} />
                      <div style={{ padding: 'var(--spacing-small)' }}>
                        <h4 className="text-body" style={{ fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                        <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{item.displayDate}</div>
                      </div>
                    </div>
                  );
                }
                
                if (type === 'ticket') {
                  return (
                    <div key={`modal-tkt-${item.id}`} className="hover-lift card-padding" onClick={() => { if(onItemClick) onItemClick(item); }} style={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderRadius: 'var(--radius-card)', 
                      border: '1px dashed var(--color-pin-orange)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--spacing-small)',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 className="text-body" style={{ fontWeight: 600, marginBottom: '4px' }}>{item.title}</h4>
                          <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{item.displayDate} • 1x General</div>
                        </div>
                        <div style={{ backgroundColor: 'var(--color-white)', padding: '4px', borderRadius: '4px' }}>
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=ticket-${item.id}`} alt="QR" style={{ width: '40px', height: '40px' }} />
                        </div>
                      </div>
                      <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px' }}>View Ticket</button>
                    </div>
                  );
                }

                if (type === 'host') {
                  return (
                    <div key={`modal-host-${item.id}`} className="hover-scale card-padding" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }} onClick={() => { navigate(`/organizer/${item.id}`); onClose(); }}>
                      <img src={item.logo} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                      <span className="text-body" style={{ fontWeight: 600, textAlign: 'center' }}>{item.name}</span>
                      <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>Following</button>
                    </div>
                  );
                }

                if (type === 'review') {
                  return (
                    <div key={`modal-rev-${item.id}`} className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '2px', color: 'var(--color-pin-orange)', marginBottom: '4px' }}>
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} size={16} weight={star <= item.rating ? 'fill' : 'regular'} />
                            ))}
                          </div>
                          <h4 className="text-body" style={{ fontWeight: 600 }}>{item.event}</h4>
                        </div>
                        <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>{item.date}</span>
                      </div>
                      <p className="text-body" style={{ color: 'var(--text-secondary)' }}>"{item.comment}"</p>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
