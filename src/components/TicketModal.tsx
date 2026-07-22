import React from 'react';
import { X, DownloadSimple, ShareNetwork, MapPin, CalendarBlank, Clock } from '@phosphor-icons/react';

interface TicketModalProps {
  event: any;
  onClose: () => void;
}

import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const TicketModal: React.FC<TicketModalProps> = ({ event, onClose }) => {
  // Generate a mock ticket ID
  const mockTicketId = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const handleDownload = async () => {
    try {
      // Create off-screen canvas element
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Card Background
      ctx.fillStyle = '#121216';
      ctx.fillRect(0, 0, 600, 900);

      // Border Frame
      ctx.strokeStyle = '#e8542c';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 568, 868);

      // Header Brand
      ctx.fillStyle = '#e8542c';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FINDIT EVENT TICKET', 300, 65);

      // Event Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      const cleanTitle = (event.title || 'Event Ticket').substring(0, 32);
      ctx.fillText(cleanTitle, 300, 120);

      // Admission Badge
      const isGatePass = !event.organizer?.verified;
      ctx.fillStyle = isGatePass ? '#e8542c' : '#ff6b00';
      ctx.beginPath();
      ctx.roundRect(160, 145, 280, 40, 20);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(isGatePass ? '🎫 GATE PASS (PAY AT ENTRANCE)' : '🎟️ GENERAL ADMISSION', 300, 171);

      // Event Details Box
      ctx.fillStyle = '#1c1c24';
      ctx.beginPath();
      ctx.roundRect(40, 210, 520, 210, 16);
      ctx.fill();

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('DATE:', 70, 260);
      ctx.fillText('TIME:', 70, 310);
      ctx.fillText('VENUE:', 70, 360);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(event.displayDate || 'Upcoming Date', 160, 260);
      ctx.fillText(event.displayTime || '6:00 PM', 160, 310);
      ctx.fillText((event.venue || 'Venue Details').substring(0, 35), 160, 360);

      // Dashed Separator Line
      ctx.strokeStyle = '#333340';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(40, 445);
      ctx.lineTo(560, 445);
      ctx.stroke();
      ctx.setLineDash([]);

      // QR Code
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${mockTicketId}`;

      await new Promise((resolve) => {
        qrImg.onload = resolve;
        qrImg.onerror = resolve;
      });

      // QR Code Background Box
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(200, 480, 200, 200, 12);
      ctx.fill();

      try {
        ctx.drawImage(qrImg, 210, 490, 180, 180);
      } catch (e) {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(mockTicketId, 300, 580);
      }

      // Ticket ID Section
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TICKET SERIAL / ID', 300, 720);

      ctx.fillStyle = '#e8542c';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(mockTicketId, 300, 755);

      // Footer
      ctx.fillStyle = '#71717a';
      ctx.font = '13px sans-serif';
      ctx.fillText('Show this ticket QR code at entry gate for verification.', 300, 840);

      const dataUrl = canvas.toDataURL('image/png');

      if (Capacitor.isNativePlatform()) {
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const filename = `FindIt_Ticket_${mockTicketId}.png`;
        
        const fileResult = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title: `Ticket - ${event.title}`,
          text: `My FindIt ticket for ${event.title}`,
          url: fileResult.uri,
          dialogTitle: 'Save Ticket Image to Camera Roll / Gallery'
        });
      } else {
        const link = document.createElement('a');
        link.download = `FindIt-Ticket-${mockTicketId}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err: any) {
      console.error('Save ticket error:', err);
      alert('Saving ticket image failed: ' + (err?.message || 'Unknown error'));
    }
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
