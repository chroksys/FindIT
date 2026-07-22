import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, DeviceMobile, Ticket, ArrowRight, Spinner, WarningCircle, Star } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useEventContext } from '../context/EventContext';
import { useUserContext } from '../context/UserContext';
import { PhoneInput } from './PhoneInput';
import { formatCompactPrice } from '../lib/formatters';

interface CheckoutModalProps {
  event: any;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ event, onClose }) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [ticketType, setTicketType] = useState<'general' | 'early' | 'vip'>(
    event.earlyBird ? 'early' : 'general'
  );
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { profile } = useUserContext();
  const { rsvpToEvent } = useEventContext();
  useLanguage();

  const isUnverifiedHost = !event.organizer?.verified;
  const alreadyReserved = event.rsvps?.some((r: any) => r.userId === profile?.id && r.status === 'going');

  const parsePrice = (priceStr?: string) => {
    if (!priceStr || priceStr === '0' || priceStr.toLowerCase() === 'free') return 0;
    const digits = priceStr.replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : 0;
  };

  const getUnitPrice = () => {
    if (ticketType === 'early' && event.earlyBird?.price) {
      return parsePrice(event.earlyBird.price);
    }
    if (ticketType === 'vip' && event.vipPrice) {
      return parsePrice(event.vipPrice);
    }
    return parsePrice(event.price);
  };

  const unitPrice = getUnitPrice();
  const total = unitPrice * quantity;

  const formatPrice = (amount: number) => {
    return formatCompactPrice(amount, event.currency);
  };

  const handleCheckout = () => {
    if (isUnverifiedHost) {
      // Unverified host: immediate gate pass reservation — save as RSVP 'going'
      setIsProcessing(true);
      setTimeout(async () => {
        await rsvpToEvent(event.id, 'going');
        setIsProcessing(false);
        setStep('success');
      }, 1000);
      return;
    }

    if (step === 'details') {
      if (unitPrice === 0) {
        // Free ticket checkout — save as RSVP 'going'
        setIsProcessing(true);
        setTimeout(async () => {
          await rsvpToEvent(event.id, 'going');
          setIsProcessing(false);
          setStep('success');
        }, 1200);
      } else {
        setStep('payment');
      }
    } else if (step === 'payment') {
      setIsProcessing(true);
      setTimeout(async () => {
        await rsvpToEvent(event.id, 'going');
        setIsProcessing(false);
        setStep('success');
      }, 1800);
    }
  };

  const handleViewTickets = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 'var(--spacing-medium)'
      }}
    >
      <div 
        className="animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
          width: '100%', maxWidth: '500px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          maxHeight: '90vh', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-default)' }}>
          <h3 className="text-section" style={{ margin: 0, fontSize: '19px', fontWeight: 700 }}>
            {step === 'success' 
              ? (isUnverifiedHost ? 'Gate Pass Reserved' : 'Payment Successful') 
              : 'Select Ticket'}
          </h3>
          {step !== 'success' && (
            <button className="btn-ghost hover-scale" onClick={onClose} style={{ padding: '6px', borderRadius: '50%' }}>
              <X size={22} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {step === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Event Header Banner Summary */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', backgroundColor: 'var(--bg-page)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <img src={event.bannerUrl} alt={event.title} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '16px', margin: 0, color: 'var(--text-primary)' }}>{event.title}</h4>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{event.displayDate} • {event.venue}</div>
                </div>
              </div>

              {/* Already Reserved Banner */}
              {alreadyReserved ? (
                <div style={{ 
                  borderRadius: '16px', 
                  border: '1px solid rgba(232, 84, 44, 0.4)', 
                  backgroundColor: 'rgba(232, 84, 44, 0.1)', 
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <CheckCircle size={44} color="var(--color-pin-orange)" weight="fill" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--color-pin-orange)', marginBottom: '6px' }}>
                      Ticket Already Reserved
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                      You already hold a ticket / gate pass reservation for <strong>{event.title}</strong>. Each user is limited to 1 reservation per event to ensure accurate host analytics.
                    </p>
                  </div>
                  <button 
                    onClick={handleViewTickets}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-pin-orange)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                    className="hover-scale"
                  >
                    View My Ticket in Profile
                  </button>
                </div>
              ) : (
                <>
                  {/* Unverified Host Warning Banner */}
                  {isUnverifiedHost && (
                    <div style={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(232, 84, 44, 0.4)', 
                      backgroundColor: 'rgba(232, 84, 44, 0.1)', 
                      padding: '14px 16px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}>
                      <WarningCircle size={24} color="var(--color-pin-orange)" weight="fill" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-pin-orange)', marginBottom: '4px' }}>
                          Unverified Host — Pay at Gate Only
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                          Online payments are disabled for this event because the host is unverified. You can reserve your gate pass below and pay cash or Mobile Money at the entrance.
                        </p>
                      </div>
                    </div>
                  )}

              {/* Ticket Type Selection */}
              <div>
                <label className="text-caption" style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Choose Ticket Type
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Early Bird */}
                  {event.earlyBird && (
                    <div 
                      onClick={() => setTicketType('early')}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '14px',
                        border: ticketType === 'early' ? '2px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
                        backgroundColor: ticketType === 'early' ? 'rgba(232, 84, 44, 0.1)' : 'var(--bg-page)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-pin-orange)', fontSize: '14px' }}>Early Bird Ticket</div>
                        <div className="text-caption" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Limited availability offer</div>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>
                        {formatPrice(parsePrice(event.earlyBird.price))}
                      </span>
                    </div>
                  )}

                  {/* General Admission */}
                  <div 
                    onClick={() => setTicketType('general')}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: ticketType === 'general' ? '2px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
                      backgroundColor: ticketType === 'general' ? 'rgba(232, 84, 44, 0.1)' : 'var(--bg-page)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>General Admission</div>
                      <div className="text-caption" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Standard event entry</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>
                      {formatPrice(parsePrice(event.price))}
                    </span>
                  </div>

                  {/* VIP Admission */}
                  {event.vipPrice && (
                    <div 
                      onClick={() => setTicketType('vip')}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '14px',
                        border: ticketType === 'vip' ? '2px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
                        backgroundColor: ticketType === 'vip' ? 'rgba(232, 84, 44, 0.1)' : 'var(--bg-page)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-pin-orange)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={16} weight="fill" /> VIP Admission
                        </div>
                        <div className="text-caption" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>VIP seating & perks</div>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-pin-orange)' }}>
                        {formatPrice(parsePrice(event.vipPrice))}
                      </span>
                    </div>
                  )}

                </div>
              </div>

              {/* Quantity Picker */}
              <div>
                <label className="text-caption" style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Quantity
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button className="btn-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '8px 16px', fontSize: '18px', borderRadius: '12px' }}>-</button>
                  <span style={{ fontSize: '20px', fontWeight: 700, width: '30px', textAlign: 'center' }}>{quantity}</span>
                  <button className="btn-secondary" onClick={() => setQuantity(quantity + 1)} style={{ padding: '8px 16px', fontSize: '18px', borderRadius: '12px' }}>+</button>
                </div>
              </div>

              {/* Summary Total */}
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-body" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {ticketType === 'early' ? 'Early Bird' : ticketType === 'vip' ? 'VIP Admission' : 'General Admission'} x {quantity}
                  </span>
                  <span className="text-body" style={{ fontWeight: 600 }}>{formatPrice(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-pin-orange)' }}>{formatPrice(total)}</span>
                </div>
              </div>
              </>
              )}
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
                      flex: 1, padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
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
                      flex: 1, padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
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
              <CheckCircle size={72} color={isUnverifiedHost ? "var(--color-pin-orange)" : "var(--color-success)"} weight="fill" style={{ marginBottom: '12px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {isUnverifiedHost ? "Gate Pass Confirmed!" : `You're going to ${event.title}!`}
              </h2>
              <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xlarge)', fontSize: '14px', lineHeight: 1.5 }}>
                {isUnverifiedHost 
                  ? "Your gate pass reservation has been saved. Please pay the host at the entrance gate on event day."
                  : "We've sent a receipt and your ticket details to your email."}
              </p>
              <button className="btn-primary hover-scale" onClick={handleViewTickets} style={{ width: '100%', justifyContent: 'center', borderRadius: '999px', backgroundColor: '#e8542c' }}>
                <Ticket size={22} /> View My Tickets
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step !== 'success' && !alreadyReserved && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            {step === 'payment' && (
              <button className="btn-secondary hover-scale" onClick={() => setStep('details')} disabled={isProcessing} style={{ flex: 1, justifyContent: 'center', borderRadius: '999px' }}>
                Back
              </button>
            )}
            <button 
              className="hover-scale" 
              onClick={handleCheckout} 
              disabled={isProcessing} 
              style={{ 
                flex: 2, 
                justifyContent: 'center', 
                backgroundColor: '#e8542c', 
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isProcessing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Spinner className="spin" size={20} /> Processing...</div>
              ) : isUnverifiedHost ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Reserve Gate Pass <ArrowRight size={20} /></div>
              ) : step === 'details' ? (
                unitPrice === 0 ? 'Claim Free Ticket' : <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Proceed to Payment <ArrowRight size={20} /></div>
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
