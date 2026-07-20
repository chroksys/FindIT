import React, { useState } from 'react';
import { X, LockKey, CheckCircle } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { useUserContext } from '../context/UserContext';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const { profile } = useUserContext();
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setStep('processing');
    setError('');

    // Verify current password first by signing in
    // Note: this is a common way to re-authenticate in Supabase
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      setError('Incorrect current password');
      setStep('form');
      return;
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setError(updateError.message);
      setStep('form');
      return;
    }

    // Trigger confirmation email
    try {
      await fetch('/api/notify-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: profile?.email })
      });
    } catch (err) {
      console.error('Failed to trigger confirmation email', err);
    }

    setStep('success');
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--spacing-medium)'
      }}
    >
      <div 
        className="animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-deep-navy)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
          padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative'
        }}
      >
        {step !== 'processing' && (
          <button onClick={onClose} className="hover-scale" style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        )}

        {step === 'form' && (
          <>
            <LockKey size={48} color="var(--text-primary)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Change Password</h3>
            
            {error && (
              <div style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid var(--color-error)', color: 'var(--color-error)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', textAlign: 'left' }}>
                {error}
              </div>
            )}

            <input 
              type="password" 
              placeholder="Current Password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#ffffff', marginBottom: '12px', outline: 'none' }} 
            />
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#ffffff', marginBottom: '12px', outline: 'none' }} 
            />
            <input 
              type="password" 
              placeholder="Confirm New Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#ffffff', marginBottom: '24px', outline: 'none' }} 
            />
            <button onClick={handleSubmit} className="btn-primary hover-scale" style={{ width: '100%', justifyContent: 'center' }}>
              Update Password
            </button>
          </>
        )}

        {step === 'processing' && (
          <div style={{ padding: '40px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-success)', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Securing Account...</h3>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-fade-in-up">
            <CheckCircle size={48} color="var(--color-success)" weight="fill" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Password Updated!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your account is secure with your new password. A confirmation email has been sent.</p>
            <button onClick={onClose} className="btn-primary hover-scale" style={{ width: '100%', justifyContent: 'center' }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
};
