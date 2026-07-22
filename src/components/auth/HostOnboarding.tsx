import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext, type SubscriptionTier } from '../../context/UserContext';
import { ArrowRight, Image as ImageIcon, CaretLeft, CheckCircle, Spinner } from '@phosphor-icons/react';
import { uploadFile } from '../../lib/uploadFile';
import { PhoneInput } from '../PhoneInput';

const ORGANIZER_TYPES = [
  'Event Agency',
  'Music Promoter',
  'Hotel / Venue',
  'Restaurant',
  'University / School',
  'Church / Religious Org',
  'NGO / Community Org',
  'Club / Nightlife',
  'Conference Organizer',
  'Independent Organizer',
  'Other'
];

const PLANS: { tier: SubscriptionTier, price: string, desc: string }[] = [
  { tier: 'Free Trial', price: '$0', desc: 'Try it out for 14 days.' },
  { tier: 'Starter', price: '$10/mo', desc: 'Perfect for small organizers.' },
  { tier: 'Growth', price: '$30/mo', desc: 'Unlimited events + analytics.' },
  { tier: 'Pro', price: '$75/mo', desc: 'Advanced tools & priority support.' },
];

export const HostOnboarding: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const { registerHost } = useUserContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Business Profile
  const [businessName, setBusinessName] = useState('');
  const [organizerType, setOrganizerType] = useState(ORGANIZER_TYPES[0]);
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');

  // Step 3: Plan
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('Free Trial');
  // Logo upload
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const url = await uploadFile(file, 'avatars', 'logos/');
      setLogoUrl(url);
    } catch {
      // silently ignore
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleFinish = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await registerHost({
        name,
        email,
        phone,
        businessName,
        organizerType,
        website,
        bio,
        city,
        subscription: selectedPlan,
        avatarUrl: logoUrl || undefined,
        verificationStatus: 'unverified',
      }, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 'var(--spacing-hero) var(--spacing-medium)'
    }}>
      
      {step === 1 && (
        <div className="card-padding animate-fade-in-up" style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
          <button onClick={onBack} className="btn-ghost" style={{ padding: 0, marginBottom: 'var(--spacing-base)', color: 'var(--text-secondary)' }}>
            <CaretLeft size={20} /> Back
          </button>
          
          <h2 className="text-section" style={{ fontSize: '28px', marginBottom: '8px' }}>Organizer Account</h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-large)' }}>Let's start with your basic contact info.</p>

          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--color-error)', borderRadius: '8px', marginBottom: 'var(--spacing-base)', fontSize: '14px', fontWeight: 500 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Contact Person" />
            </div>
            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Password</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min. 8 characters" />
            </div>
            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Phone Number</label>
              <PhoneInput required value={phone} onChange={(val) => setPhone(val)} className="input-field" placeholder="For verification & support" />
            </div>
            <button type="submit" className="btn-primary hover-scale" style={{ width: '100%', marginTop: 'var(--spacing-base)', justifyContent: 'center' }}>
              Next: Business Profile <ArrowRight size={20} />
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="card-padding animate-fade-in-up" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-large)' }}>
            <h2 className="text-section" style={{ fontSize: '28px', marginBottom: '8px' }}>Business Profile</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>How your audience will see you on FindIt.</p>
          </div>

          <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-base)' }}>
              <div>
                <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Business / Organizer Name</label>
                <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)} className="input-field" placeholder="e.g. Talent Africa" />
              </div>
              <div>
                <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Type of Organizer</label>
                <select required value={organizerType} onChange={e => setOrganizerType(e.target.value)} className="input-field">
                  {ORGANIZER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Logo / Profile Image (Optional)</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-base)', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-deep-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted-navy)' }}>
                  {logoUrl
                    ? <img src={logoUrl} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <ImageIcon size={32} />}
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                >
                  {isUploadingLogo
                    ? <><Spinner size={18} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                    : logoUrl ? 'Change Logo' : 'Choose File'}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>City / Location</label>
              <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="input-field" placeholder="e.g. Kampala" />
            </div>

            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Website (Optional)</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="input-field" placeholder="https://" />
            </div>

            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Short Bio (Optional)</label>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                maxLength={160}
                className="input-field" 
                placeholder="Tell attendees who you are..."
                style={{ resize: 'none', height: '80px' }}
              />
              <div className="text-caption" style={{ textAlign: 'right', marginTop: '4px', color: 'var(--text-secondary)' }}>
                {bio.length}/160
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-base)', marginTop: 'var(--spacing-base)' }}>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
              <button type="submit" className="btn-primary hover-scale" style={{ flex: 2, justifyContent: 'center' }}>
                Next: Pick a Plan <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-large)' }}>
            <h2 className="text-hero" style={{ fontSize: '32px', marginBottom: '8px' }}>Pick a Plan</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>You can always upgrade later as you grow.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-base)', marginBottom: 'var(--spacing-xlarge)' }}>
            {PLANS.map(plan => {
              const isSelected = selectedPlan === plan.tier;
              return (
                <button 
                  key={plan.tier}
                  onClick={() => setSelectedPlan(plan.tier)}
                  className="card-padding hover-lift"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-card)',
                    border: `2px solid ${isSelected ? 'var(--color-pin-orange)' : 'var(--border-color)'}`,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <h3 className="text-card-title">{plan.tier}</h3>
                    {isSelected && <CheckCircle size={20} color="var(--color-pin-orange)" weight="fill" />}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{plan.price}</div>
                  <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>{plan.desc}</p>
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-base)', maxWidth: '400px', margin: '0 auto' }}>
            <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
            <button onClick={handleFinish} disabled={loading} className="btn-primary hover-scale" style={{ flex: 2, justifyContent: 'center' }}>
              {loading ? 'Creating account...' : <>{`Complete Setup `}<CheckCircle size={20} /></>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
