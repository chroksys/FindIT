import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, DeviceMobile, Ticket, ArrowRight, Spinner } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { PhoneInput } from './PhoneInput';

interface CheckoutModalProps {
  event: any;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ event, onClose }) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  useLanguage();

  const priceNum = event.price ? parseInt(event.price.replace(/\D/g, ''), 10) || 50000 : 50000;
  const total = priceNum * quantity;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' UGX';
  };

  const handleCheckout = () => {
    if (step === 'details') {
      setStep('payment');
    } else if (step === 'payment') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStep('success');
      }, 2000); // simulate network request
    }
  };

  const handleViewTickets = () => {
    onClose();
    navigate('/dashboard'); // Will go to dashboard where My Tickets lives
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 'var(--spacing-medium)'
    }}>
      <div className="animate-fade-in-up" style={{
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)',
        width: '100%', maxWidth: '480px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-base)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-default)' }}>
          <h3 className="text-section" style={{ margin: 0, fontSize: '20px' }}>
            {step === 'success' ? 'Payment Successful' : 'Checkout'}
          </h3>
          {step !== 'success' && (
            <button className="btn-ghost hover-scale" onClick={onClose} style={{ padding: '8px' }}>
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--spacing-large)', overflowY: 'auto' }}>
          {step === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img src={event.bannerUrl} alt={event.title} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '18px', marginBottom: '4px' }}>{event.title}</h4>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{event.displayDate} • {event.venue}</div>
                </div>
              </div>

              <div>
                <label className="text-caption" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ticket Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button className="btn-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '8px 16px', fontSize: '20px' }}>-</button>
                  <span style={{ fontSize: '20px', fontWeight: 600, width: '30px', textAlign: 'center' }}>{quantity}</span>
                  <button className="btn-secondary" onClick={() => setQuantity(quantity + 1)} style={{ padding: '8px 16px', fontSize: '20px' }}>+</button>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-body" style={{ color: 'var(--text-secondary)' }}>General Admission x {quantity}</span>
                  <span className="text-body">{formatPrice(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="text-body" style={{ color: 'var(--text-secondary)' }}>Fees</span>
                  <span className="text-body">Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-pin-orange)' }}>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>
              <div>
                <h4 style={{ marginBottom: '12px', fontWeight: 600 }}>Select Payment Method</h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setPaymentMethod('momo')}
                    style={{ 
                      flex: 1, padding: '16px', borderRadius: 'var(--radius-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      backgroundColor: paymentMethod === 'momo' ? 'rgba(255,107,0,0.1)' : 'var(--bg-default)',
                      border: paymentMethod === 'momo' ? '2px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <DeviceMobile size={32} color={paymentMethod === 'momo' ? 'var(--color-pin-orange)' : 'var(--text-secondary)'} />
                    <span style={{ fontWeight: 600, color: paymentMethod === 'momo' ? 'var(--color-pin-orange)' : 'var(--text-primary)' }}>Mobile Money</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    style={{ 
                      flex: 1, padding: '16px', borderRadius: 'var(--radius-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      backgroundColor: paymentMethod === 'card' ? 'rgba(255,107,0,0.1)' : 'var(--bg-default)',
                      border: paymentMethod === 'card' ? '2px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <CreditCard size={32} color={paymentMethod === 'card' ? 'var(--color-pin-orange)' : 'var(--text-secondary)'} />
                    <span style={{ fontWeight: 600, color: paymentMethod === 'card' ? 'var(--color-pin-orange)' : 'var(--text-primary)' }}>Bank Card</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'momo' ? (
                <div>
                  <label className="text-caption" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mobile Number</label>
                  <PhoneInput 
                    value="+256 77 123 4567" 
                    onChange={() => {}} 
                    className="input-field" 
                    placeholder="e.g. 077 123 4567" 
                  />
                  <p className="text-caption" style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>You will receive a prompt on your phone to enter your PIN.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="text-caption" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Card Number</label>
                    <input type="text" className="input-field" placeholder="0000 0000 0000 0000" defaultValue="4242 4242 4242 4242" />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="text-caption" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Expiry</label>
                      <input type="text" className="input-field" placeholder="MM/YY" defaultValue="12/25" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="text-caption" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>CVV</label>
                      <input type="text" className="input-field" placeholder="123" defaultValue="123" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--spacing-large) 0' }}>
              <CheckCircle size={80} color="var(--color-success)" weight="fill" style={{ marginBottom: 'var(--spacing-base)' }} />
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>You're going to {event.title}!</h2>
              <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xlarge)' }}>
                We've sent a receipt and your ticket details to your email.
              </p>
              <button className="btn-primary hover-scale" onClick={handleViewTickets} style={{ width: '100%', justifyContent: 'center' }}>
                <Ticket size={24} /> View My Tickets
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step !== 'success' && (
          <div style={{ padding: 'var(--spacing-base) var(--spacing-large)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            {step === 'payment' && (
              <button className="btn-secondary hover-scale" onClick={() => setStep('details')} disabled={isProcessing} style={{ flex: 1, justifyContent: 'center' }}>
                Back
              </button>
            )}
            <button className="btn-primary hover-scale" onClick={handleCheckout} disabled={isProcessing} style={{ flex: 2, justifyContent: 'center' }}>
              {isProcessing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Spinner className="spin" size={20} /> Processing...</div>
              ) : step === 'details' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Proceed to Payment <ArrowRight size={20} /></div>
              ) : (
                `Pay ${formatPrice(total)}`
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
