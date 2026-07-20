
import { useUserContext } from '../context/UserContext';
import type { SubscriptionTier, HostProfile } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, LockKeyOpen } from '@phosphor-icons/react';

export const Pricing = () => {
  const { role, profile, updateSubscription } = useUserContext();
  const navigate = useNavigate();
  const hostProfile = profile as HostProfile;
  const currentSubscription = role === 'host' ? hostProfile?.subscription : null;

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (role !== 'host') {
      navigate('/login');
      return;
    }
    updateSubscription(tier);
    navigate('/dashboard');
  };

  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: 'forever',
      description: 'Perfect for exploring the platform.',
      features: ['Up to 2 active events', 'Zero-cost manual KYB onboarding', 'Standard discovery placement', 'No Live Control Center access'],
      buttonText: 'Current Plan',
      tier: 'Free Trial' as SubscriptionTier
    },
    {
      name: 'Starter',
      price: '$10',
      period: 'per month',
      description: 'Great for small or occasional organizers.',
      features: ['Up to 5 active events', 'Zero-cost manual KYB onboarding', 'Basic analytics dashboard', 'No Live Control Center access'],
      buttonText: 'Get Starter',
      tier: 'Starter' as SubscriptionTier,
      popular: false
    },
    {
      name: 'Growth',
      price: '$30',
      period: 'per month',
      description: 'For frequent event hosts scaling up.',
      features: ['Unlimited active events', 'Unlock Live Control Center', 'Interactive attendee live chat', 'Featured profile placement'],
      buttonText: 'Get Growth',
      tier: 'Growth' as SubscriptionTier,
      popular: true
    },
    {
      name: 'Pro',
      price: '$75',
      period: 'per month',
      description: 'The ultimate toolkit for agencies and large hosts.',
      features: ['Everything in Growth', 'Priority discovery placement', 'Team access (up to 5 users)', 'Custom event branding', 'Premium 24/7 support'],
      buttonText: 'Get Pro',
      tier: 'Pro' as SubscriptionTier,
      popular: false
    }
  ];

  return (
    <div className="container section">
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: 'var(--spacing-hero) auto var(--spacing-hero)' }}>
        <h1 className="text-hero animate-fade-in-up" style={{ fontSize: '48px', marginBottom: 'var(--spacing-base)' }}>Simple, transparent pricing</h1>
        <p className="text-body animate-fade-in-up" style={{ color: 'var(--text-secondary)', fontSize: '18px', animationDelay: '0.1s' }}>
          Choose the plan that fits your hosting needs. No hidden fees. Cancel anytime.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-large)', alignItems: 'stretch' }}>
        {plans.map((plan, idx) => {
          const isCurrent = currentSubscription === plan.tier;
          
          return (
            <div key={plan.name} className={`animate-fade-in-up ${plan.popular ? 'hover-lift' : ''}`} style={{ 
              animationDelay: `${0.1 * (idx + 1)}s`,
              backgroundColor: 'var(--bg-card)', 
              borderRadius: 'var(--radius-card)', 
              border: plan.popular ? '2px solid var(--color-pin-orange)' : '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-pin-orange)', color: 'white', padding: '4px 12px', borderBottomLeftRadius: 'var(--radius-card)', borderBottomRightRadius: 'var(--radius-card)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Most Popular
                </div>
              )}
              
              <div style={{ padding: 'var(--spacing-large)', paddingBottom: 'var(--spacing-base)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-default)' }}>
                <h3 className="text-section" style={{ fontSize: '24px', marginBottom: '8px', marginTop: plan.popular ? '16px' : '0' }}>{plan.name}</h3>
                <p className="text-caption" style={{ marginBottom: 'var(--spacing-large)', minHeight: '40px' }}>{plan.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '40px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{plan.price}</span>
                  <span className="text-caption">/{plan.period}</span>
                </div>
              </div>

              <div style={{ padding: 'var(--spacing-large)', flexGrow: 1 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {plan.features.map((feature, idx) => {
                    const isUnlock = feature.includes('Unlock') || feature.includes('chat');
                    const isNoAccess = feature.includes('No Live Control Center');
                    
                    return (
                      <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        {isUnlock ? (
                          <LockKeyOpen size={20} color="var(--color-pin-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        ) : isNoAccess ? (
                          <ShieldCheck size={20} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px', opacity: 0.5 }} />
                        ) : (
                          <CheckCircle size={20} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <span className="text-body" style={{ color: isNoAccess ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isNoAccess ? 'line-through' : 'none' }}>
                          {feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div style={{ padding: 'var(--spacing-large)', paddingTop: 0 }}>
                <button 
                  onClick={() => handleUpgrade(plan.tier)}
                  className={plan.popular ? 'btn-accent hover-scale' : 'btn-secondary hover-scale'} 
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : plan.buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
