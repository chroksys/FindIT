import React from 'react';
import { X, DownloadSimple, ShareNetwork, MapPin, CalendarBlank, Clock } from '@phosphor-icons/react';

interface TicketModalProps {
  event: any;
  onClose: () => void;
}

import { Share } from '@capacitor/share';

export const TicketModal: React.FC<TicketModalProps> = ({ event, onClose }) => {
  const handleDownload = () => {
    alert('In the native app, this will save the ticket image to your camera roll/gallery.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `My Ticket to ${event.title}`,
        text: `I'm going to ${event.title}! Get your tickets on FindIt.`,
        url: window.location.href,
        dialogTitle: 'Share Ticket',
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Generate a mock ticket ID
  const mockTicketId = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 'var(--spacing-medium)'
      }}
    >
      <div 
        className="animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)',
          width: '100%', maxWidth: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-strong)',
          maxHeight: '90vh'
        }}
      >
        
        {/* Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-base)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-ghost hover-scale" onClick={handleDownload} style={{ padding: '8px', color: 'var(--text-secondary)' }} title="Download Ticket">
              <DownloadSimple size={24} />
            </button>
            <button className="btn-ghost hover-scale" onClick={handleShare} style={{ padding: '8px', color: 'var(--text-secondary)' }} title="Share Ticket">
              <ShareNetwork size={24} />
            </button>
          </div>
          <button className="btn-ghost hover-scale" onClick={onClose} style={{ padding: '8px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Ticket Content (The part that would be printed/downloaded) */}
        <div id="printable-ticket" style={{ padding: '0 var(--spacing-large) var(--spacing-large)', overflowY: 'auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-large)' }}>
            <img src={event.bannerUrl} alt={event.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-card)' }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-large)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{event.title}</h2>
            <span className="badge" style={{ backgroundColor: 'rgba(255,107,0,0.1)', color: 'var(--color-pin-orange)', padding: '4px 12px', fontSize: '14px' }}>
              General Admission (1x)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 'var(--spacing-xlarge)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <CalendarBlank size={20} color="var(--color-pin-orange)" />
              <span className="text-body">{event.displayDate}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <Clock size={20} color="var(--color-pin-orange)" />
              <span className="text-body">{event.displayTime || '6:00 PM'}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <MapPin size={20} color="var(--color-pin-orange)" />
              <span className="text-body">{event.venue}</span>
            </div>
          </div>

          {/* QR Code Section */}
          <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: 'var(--spacing-large)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', display: 'inline-block' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${mockTicketId}`} alt="QR Code" style={{ width: '120px', height: '120px' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>Ticket ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 600, letterSpacing: '1px' }}>{mockTicketId}</div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};
