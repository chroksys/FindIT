import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, ArrowCounterClockwise } from '@phosphor-icons/react';

interface CameraModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err: any) {
      setError('Unable to access camera. Please check permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `live_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
          <X size={24} color="white" />
        </button>
        <div style={{ color: 'white', fontWeight: 600 }}>Live Capture</div>
        <button onClick={startCamera} className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }} title="Restart Camera">
          <ArrowCounterClockwise size={24} color="white" />
        </button>
      </div>

      {/* Camera View */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {error ? (
          <div style={{ color: 'var(--color-error)', padding: '24px', textAlign: 'center' }}>
            <p>{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))' }}>
        <button 
          onClick={handleCapture}
          disabled={!!error}
          style={{ 
            width: '72px', height: '72px', borderRadius: '50%', 
            backgroundColor: 'transparent', border: '4px solid white',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: error ? 'not-allowed' : 'pointer',
            opacity: error ? 0.5 : 1,
            padding: 0
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Camera size={28} color="black" />
          </div>
        </button>
      </div>
    </div>
  );
};
