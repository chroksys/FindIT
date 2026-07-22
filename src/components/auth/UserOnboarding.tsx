import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { 
  ArrowRight, UserCircle, CheckCircle, Image as ImageIcon, CaretLeft, Spinner,
  MusicNotes, SoccerBall, Laptop, Briefcase, Books, TShirt, Confetti, HandsPraying, 
  UsersThree, Martini, MicrophoneStage, Barbell, ForkKnife, Smiley, HandHeart
} from '@phosphor-icons/react';
import { uploadFile } from '../../lib/uploadFile';
import { PhoneInput } from '../PhoneInput';
import { COUNTRIES } from '../../lib/countries';

const INTERESTS = [
  { id: 'music', label: 'Music', icon: <MusicNotes size={20} /> },
  { id: 'nightlife', label: 'Nightlife & Party', icon: <Martini size={20} /> },
  { id: 'food', label: 'Food & Drink', icon: <ForkKnife size={20} /> },
  { id: 'sports', label: 'Sports', icon: <SoccerBall size={20} /> },
  { id: 'comedy', label: 'Comedy & Theatre', icon: <Smiley size={20} /> },
  { id: 'tech', label: 'Tech & Innovation', icon: <Laptop size={20} /> },
  { id: 'business', label: 'Business', icon: <Briefcase size={20} /> },
  { id: 'education', label: 'Education', icon: <Books size={20} /> },
  { id: 'fashion', label: 'Fashion & Beauty', icon: <TShirt size={20} /> },
  { id: 'festivals', label: 'Festivals', icon: <Confetti size={20} /> },
  { id: 'community', label: 'Community', icon: <UsersThree size={20} /> },
  { id: 'concerts', label: 'Concerts', icon: <MicrophoneStage size={20} /> },
  { id: 'fitness', label: 'Health & Fitness', icon: <Barbell size={20} /> },
  { id: 'charity', label: 'Charity & Causes', icon: <HandHeart size={20} /> },
];

export const UserOnboarding: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const { registerUser } = useUserContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };
  
  // State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return alert('Password must be at least 8 characters.');
    if (!phone) return alert('Phone number is required.');
    
    if (!dob) return alert('Date of birth is required.');
    const ageNum = calculateAge(dob);
    if (ageNum < 16) {
      return alert('You must be at least 16 years old to register.');
    }
    setStep(2); // Go to interests
  };

  const handleInterestsNext = (skip = false) => {
    if (!skip && selectedInterests.length < 2) return alert('Pick at least 2 interests, or skip.');
    setStep(3); // Go to profile setup
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const url = await uploadFile(file, 'avatars', 'profile/');
      setAvatarUrl(url);
    } catch {
      // silently fall back to no avatar
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFinish = async (skip = false) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await registerUser({
        name,
        email,
        interests: selectedInterests,
        city: skip ? undefined : location,
        country,
        phone,
        dob,
        age: calculateAge(dob),
        gender,
        avatarUrl: avatarUrl || undefined,
      }, password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      setStep(1); // Go back to credentials so user can fix the issue
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="container page-no-nav" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      paddingBottom: 'var(--spacing-hero)',
      paddingLeft: 'var(--spacing-medium)',
      paddingRight: 'var(--spacing-medium)'
    }}>
      
      {step === 1 && (
        <div className="card-padding animate-fade-in-up" style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
          <button onClick={onBack} className="btn-ghost" style={{ padding: 0, marginBottom: 'var(--spacing-base)', color: 'var(--text-secondary)' }}>
            <CaretLeft size={20} /> Back
          </button>
          
          <h2 className="text-section" style={{ fontSize: '28px', marginBottom: '8px' }}>Create an Account</h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-large)' }}>Join FindIt to discover and save events.</p>

          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--color-error)', borderRadius: '8px', marginBottom: 'var(--spacing-base)', fontSize: '14px', fontWeight: 500 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="john@example.com" />
            </div>
            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Phone Number *</label>
              <PhoneInput value={phone} onChange={setPhone} required />
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-base)' }}>
              <div style={{ flex: 1 }}>
                <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Date of Birth *</label>
                <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="input-field" max={new Date().toISOString().split('T')[0]} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="input-field" style={{ appearance: 'none' }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Password *</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min. 8 characters" />
            </div>
            <button type="submit" className="btn-primary hover-scale" style={{ width: '100%', marginTop: 'var(--spacing-base)', justifyContent: 'center' }}>
              Create Account <ArrowRight size={20} />
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="card-padding animate-fade-in-up" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-large)' }}>
            <h2 className="text-section" style={{ fontSize: '28px', marginBottom: '8px' }}>What are you into?</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Pick at least 2 interests so we can personalize your feed.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-small)', justifyContent: 'center', marginBottom: 'var(--spacing-large)' }}>
            {INTERESTS.map(interest => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <button 
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className="hover-scale"
                  style={{
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-pill)',
                    border: `2px solid ${isSelected ? 'var(--color-white)' : 'var(--border-color)'}`,
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: isSelected ? 'var(--color-white)' : 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-family, inherit)' }}>{interest.label}</span>
                  {isSelected ? <CheckCircle size={18} weight="fill" /> : interest.icon}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-base)' }}>
            <button onClick={() => handleInterestsNext(true)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Skip</button>
            <button onClick={() => handleInterestsNext(false)} disabled={selectedInterests.length < 2} className="btn-primary hover-scale" style={{ flex: 2, justifyContent: 'center' }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card-padding animate-fade-in-up" style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-large)' }}>
            <h2 className="text-section" style={{ fontSize: '28px', marginBottom: '8px' }}>Complete Your Profile</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Add a photo and location so friends can find you. You can also do this later.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--spacing-large)' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--color-deep-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted-navy)', marginBottom: 'var(--spacing-base)', border: '3px solid var(--border-color)' }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <UserCircle size={64} />}
            </div>
            <button
              type="button"
              className="btn-secondary hover-scale"
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploadingPhoto}
            >
              {isUploadingPhoto
                ? <><Spinner size={20} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                : <><ImageIcon size={20} /> {avatarUrl ? 'Change Photo' : 'Upload Photo'}</>}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-large)' }}>
            <div style={{ marginBottom: 'var(--spacing-base)' }}>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Country</label>
              <select value={country} onChange={e => setCountry(e.target.value)} className="input-field" style={{ appearance: 'none' }}>
                {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Location / City</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input-field" placeholder="e.g., Kampala, Ntinda" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-base)' }}>
            <button onClick={() => handleFinish(true)} disabled={loading} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Skip for now</button>
            <button onClick={() => handleFinish(false)} disabled={loading} className="btn-primary hover-scale" style={{ flex: 2, justifyContent: 'center' }}>
              {loading ? 'Creating account...' : <>{`Done `}<CheckCircle size={20} /></>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
