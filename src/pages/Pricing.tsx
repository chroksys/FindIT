import React, { useState } from 'react';
import { useUserContext } from '../context/UserContext';
import type { SubscriptionTier, HostProfile } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Check, X, Sparkle } from '@phosphor-icons/react';

export const Pricing: React.FC = () => {
  const { role, profile, updateSubscription } = useUserContext();
  const navigate = useNavigate();
  const hostProfile = profile as HostProfile;
  const currentSubscription = role === 'host' ? hostProfile?.subscription : null;
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (role !== 'host') {
      navigate('/login');
      return;
    }
    updateSubscription(tier);
    navigate('/dashboard', { replace: true });
  };

  const plans = [
    {
      name: 'Free Host',
      price: '$0',
      period: 'forever',
      description: 'Ideal for trying out event creation and local host verification.',
      features: [
        'Up to 2 active events',
        'Gate Pass ticket reservations (Pay at Gate)',
        'Basic QR code digital tickets',
        'Standard event search placement',
        'Manual KYB Verification application'
      ],
      buttonText: 'Current Plan',
      tier: 'Free' as SubscriptionTier,
      popular: false
    },
    {
      name: 'Starter',
      price: billingCycle === 'yearly' ? '$8' : '$10',
      period: 'per month',
      description: 'Perfect for small event organizers & community hosts.',
      features: [
        'Up to 5 active events',
        'Gate Pass & QR Ticket management',
        '1-Click ticket image save to Camera Roll',
        'Custom promo & discount codes',
        'Basic event analytics'
      ],
      buttonText: 'Upgrade to Starter',
      tier: 'Starter' as SubscriptionTier,
      popular: false
    },
    {
      name: 'Growth',
      price: billingCycle === 'yearly' ? '$24' : '$30',
      period: 'per month',
      description: 'For active hosts who want live broadcasting & sub-events.',
      features: [
        'Unlimited active events',
        'Sub-events & schedules grouping',
        'Live Control Center & attendee broadcast feed',
        'Co-host collaboration invitations',
        'Full sales & impression analytics dashboard'
      ],
      buttonText: 'Upgrade to Growth',
      tier: 'Growth' as SubscriptionTier,
      popular: true
    },
    {
      name: 'Pro',
      price: billingCycle === 'yearly' ? '$60' : '$75',
      period: 'per month',
      description: 'Ultimate toolkit for top promoters, agencies & venues.',
      features: [
        'Everything in Growth',
        'Featured "Hottest Events" boosted promotion',
        'Dedicated Hottest page listing (/hottest)',
        'Priority verified organizer placement',
        '24/7 dedicated organizer support'
      ],
      buttonText: 'Upgrade to Pro',
      tier: 'Pro' as SubscriptionTier,
      popular: false
    }
  ];

  const comparisonCategories = [
    {
      category: 'Event Creation & Management',
      items: [
        { name: 'Active Events Limit', free: '2 Events', starter: '5 Events', growth: 'Unlimited', pro: 'Unlimited' },
        { name: 'Sub-events & Schedule Grouping', free: false, starter: false, growth: true, pro: true },
        { name: 'Co-Host Collaborations', free: false, starter: '1 Co-Host', growth: '3 Co-Hosts', pro: 'Unlimited' },
        { name: 'Custom Promo & Discount Codes', free: false, starter: true, growth: true, pro: true },
        { name: 'Event Gallery & Media Uploads', free: 'Up to 3 photos', starter: 'Up to 6 photos', growth: 'Unlimited', pro: 'Unlimited' }
      ]
    },
    {
      category: 'Ticketing & Gate Control',
      items: [
        { name: 'Gate Pass Reservations (Pay at Entrance)', free: true, starter: true, growth: true, pro: true },
        { name: 'Instant Digital QR Code Tickets', free: true, starter: true, growth: true, pro: true },
        { name: '1-Click Ticket Image Save to Camera Roll', free: true, starter: true, growth: true, pro: true },
        { name: 'Ticket Scanner & Gate Verification', free: true, starter: true, growth: true, pro: true }
      ]
    },
    {
      category: 'Live Broadcasting & Engagement',
      items: [
        { name: 'Live Control Center Broadcast Feed', free: false, starter: false, growth: true, pro: true },
        { name: 'Attendee Real-Time Live Mode', free: false, starter: false, growth: true, pro: true },
        { name: 'Featured "Hottest Events" Promotion', free: false, starter: false, growth: false, pro: true },
        { name: 'Dedicated Hottest Page Placement (/hottest)', free: false, starter: false, growth: false, pro: true }
      ]
    },
    {
      category: 'Analytics & Verification',
      items: [
        { name: 'KYB Host Verification Application', free: true, starter: true, growth: true, pro: true },
        { name: 'Real-Time Sales & Ticket Analytics', free: 'Basic Overview', starter: 'Basic Overview', growth: 'Full Analytics', pro: 'Advanced Analytics + Export' },
        { name: 'Priority Discovery Placement', free: false, starter: false, growth: 'Standard Boost', pro: 'Top Priority' },
        { name: 'Dedicated Organizer Support', free: 'Standard', starter: 'Standard', growth: 'Priority', pro: '24/7 Dedicated' }
      ]
    }
  ];

  return (
    <div className="container section page-with-nav" style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 24px) + 20px)' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto var(--spacing-xlarge)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(232, 84, 44, 0.12)', color: 'var(--color-pin-orange)', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
          <Sparkle size={18} weight="fill" />
          <span>HOST SUBSCRIPTION PLANS</span>
        </div>
        <h1 className="text-hero animate-fade-in-up" style={{ fontSize: '40px', marginBottom: '12px' }}>
          Flexible plans for every host
        </h1>
        <p className="text-body animate-fade-in-up" style={{ color: 'var(--text-secondary)', fontSize: '16px', animationDelay: '0.1s', margin: '0 0 24px 0' }}>
          Power your events with live broadcasting, instant QR gate passes, sub-events, and boosted promotion.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '999px', padding: '4px' }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              background: billingCycle === 'monthly' ? 'var(--color-pin-orange)' : 'transparent',
              color: billingCycle === 'monthly' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              background: billingCycle === 'yearly' ? 'var(--color-pin-orange)' : 'transparent',
              color: billingCycle === 'yearly' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Yearly <span style={{ backgroundColor: '#2ecc71', color: '#000', fontSize: '10px', padding: '2px 6px', borderRadius: '999px', fontWeight: 800 }}>SAVE 20%</span>
          </button>
        </div>
      </div>

      {/* Subscription Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--spacing-large)', alignItems: 'stretch', marginBottom: '60px' }}>
        {plans.map((plan, idx) => {
          const isCurrent = currentSubscription === plan.tier;
          
          return (
            <div key={plan.name} className={`animate-fade-in-up ${plan.popular ? 'hover-lift' : ''}`} style={{ 
              animationDelay: `${0.1 * (idx + 1)}s`,
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '20px', 
              border: plan.popular ? '2px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: plan.popular ? '0 12px 32px rgba(232, 84, 44, 0.2)' : 'var(--shadow-soft)'
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-pin-orange)', color: 'white', padding: '4px 16px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Most Popular
                </div>
              )}
              
              <div style={{ padding: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginTop: plan.popular ? '12px' : '0' }}>
                <h3 className="text-section" style={{ fontSize: '22px', marginBottom: '6px' }}>{plan.name}</h3>
                <p className="text-caption" style={{ color: 'var(--text-secondary)', fontSize: '13px', minHeight: '38px', margin: '0 0 16px 0' }}>{plan.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{plan.price}</span>
                  <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>/{plan.period}</span>
                </div>
              </div>

              <div style={{ padding: '24px', flexGrow: 1 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px' }}>
                      <CheckCircle size={18} color="var(--color-pin-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: '24px', paddingTop: 0 }}>
                <button 
                  onClick={() => handleUpgrade(plan.tier)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: isCurrent ? 'default' : 'pointer',
                    backgroundColor: isCurrent ? 'var(--border-color)' : plan.popular ? 'var(--color-pin-orange)' : 'var(--text-primary)',
                    color: isCurrent ? 'var(--text-secondary)' : plan.popular ? '#ffffff' : 'var(--bg-page)',
                    transition: 'all 0.2s ease'
                  }}
                  className={!isCurrent ? 'hover-scale' : ''}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Active Plan' : plan.buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table Section */}
      <div style={{ marginTop: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Detailed Feature Comparison
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            Compare features across Free, Starter, Growth, and Pro tiers
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', width: '35%' }}>Features</th>
                <th style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', width: '15%' }}>Free</th>
                <th style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', width: '15%' }}>Starter</th>
                <th style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 700, color: 'var(--color-pin-orange)', textAlign: 'center', width: '17%' }}>Growth</th>
                <th style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', width: '18%' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {comparisonCategories.map((cat) => (
                <React.Fragment key={cat.category}>
                  <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <td colSpan={5} style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 800, color: 'var(--color-pin-orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {cat.category}
                    </td>
                  </tr>
                  {cat.items.map((item) => (
                    <tr key={item.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {typeof item.free === 'boolean' ? (
                          item.free ? <Check size={20} color="var(--color-success)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-secondary)" style={{ opacity: 0.3, margin: '0 auto' }} />
                        ) : item.free}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {typeof item.starter === 'boolean' ? (
                          item.starter ? <Check size={20} color="var(--color-success)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-secondary)" style={{ opacity: 0.3, margin: '0 auto' }} />
                        ) : item.starter}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {typeof item.growth === 'boolean' ? (
                          item.growth ? <Check size={20} color="var(--color-pin-orange)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-secondary)" style={{ opacity: 0.3, margin: '0 auto' }} />
                        ) : item.growth}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {typeof item.pro === 'boolean' ? (
                          item.pro ? <Check size={20} color="var(--color-success)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-secondary)" style={{ opacity: 0.3, margin: '0 auto' }} />
                        ) : item.pro}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
