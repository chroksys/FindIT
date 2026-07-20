import React, { useRef, useState } from 'react';
import { useUserContext, type UserProfile } from '../../context/UserContext';
import { EnvelopeSimple, MapPin, User, UploadSimple, ShieldCheck, Spinner } from '@phosphor-icons/react';
import { uploadFile } from '../../lib/uploadFile';
import { PhoneInput } from '../PhoneInput';

const INTERESTS = [
  { id: 'music', label: '🎵 Music' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'business', label: '💼 Business' },
  { id: 'education', label: '📚 Education' },
  { id: 'fashion', label: '👗 Fashion' },
  { id: 'festivals', label: '🎉 Festivals' },
  { id: 'religious', label: '🙏 Religious' },
  { id: 'community', label: '🤝 Community' },
  { id: 'nightlife', label: '🌙 Nightlife' },
  { id: 'concerts', label: '🎤 Concerts' },
  { id: 'fitness', label: '🏃 Fitness' },
];

export const UserAccount = () => {
  const { profile, updateProfile } = useUserContext();
  const userProfile = (profile as UserProfile) || { name: '', email: '', interests: [] };

  const [formData, setFormData] = useState(userProfile);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!profile) {
    return <div className="container section text-center">Please log in to view this page.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const toggleInterest = (id: string) => {
    setFormData(prev => {
      const interests = prev.interests || [];
      const newInterests = interests.includes(id)
        ? interests.filter(i => i !== id)
        : [...interests, id];
      return { ...prev, interests: newInterests };
    });
    setIsSaved(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    setUploadError('');
    try {
      const url = await uploadFile(file, 'avatars', 'profile/');
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      await updateProfile({ avatarUrl: url });
    } catch (err: any) {
      setUploadError('Photo upload failed: ' + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container section" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: 'var(--spacing-xlarge)' }}>
        <h1 className="text-hero animate-fade-in-up" style={{ fontSize: '32px', marginBottom: 'var(--spacing-micro)' }}>Edit Profile</h1>
        <p className="text-body animate-fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.1s' }}>Manage your personal details and interests.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xlarge)' }}>
        <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>
          <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>

            {/* Profile Photo */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--spacing-xlarge)' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={formData.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback'}
                  alt="Profile"
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-deep-navy)' }}
                />
                <button
                  type="button"
                  className="btn-accent hover-scale"
                  style={{ position: 'absolute', bottom: 0, right: 0, padding: '8px', borderRadius: '50%' }}
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  title="Upload profile photo"
                >
                  {isUploadingPhoto ? <Spinner size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <UploadSimple size={20} />}
                </button>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              {uploadError && <p style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '8px' }}>{uploadError}</p>}
              {isUploadingPhoto && <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>Uploading photo...</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="name" value={formData.name} onChange={handleChange} type="text" style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <EnvelopeSimple size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="email" value={formData.email} onChange={handleChange} type="email" style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <PhoneInput 
                name="phone" 
                value={formData.phone || ''} 
                onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))} 
                placeholder="Optional" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">City / Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="city" value={formData.city || ''} onChange={handleChange} type="text" style={{ paddingLeft: '40px' }} placeholder="e.g. Kampala" />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 'var(--spacing-large)' }}>
              <label className="form-label">My Interests</label>
              <p className="text-caption" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Select the categories you want to see in your feed.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-small)' }}>
                {INTERESTS.map(interest => {
                  const isSelected = (formData.interests || []).includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className="hover-scale"
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-pill)',
                        border: `2px solid ${isSelected ? 'var(--color-pin-orange)' : 'var(--border-color)'}`,
                        backgroundColor: isSelected ? 'rgba(255, 87, 34, 0.1)' : 'transparent',
                        color: isSelected ? 'var(--color-pin-orange)' : 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {interest.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--spacing-base)', marginTop: 'var(--spacing-xlarge)' }}>
              {isSaved && <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={20} /> Saved successfully</span>}
              <button type="submit" className="btn-primary hover-scale" style={{ padding: '12px 32px' }}>Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
