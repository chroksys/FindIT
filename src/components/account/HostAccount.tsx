import React, { useRef, useState } from 'react';
import { useUserContext, type HostProfile } from '../../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { Storefront, EnvelopeSimple, Globe, UploadSimple, ShieldCheck, Spinner } from '@phosphor-icons/react';
import { uploadFile } from '../../lib/uploadFile';
import { PhoneInput } from '../PhoneInput';

export const HostAccount = () => {
  const { profile, updateProfile } = useUserContext();
  const hostProfile = profile as HostProfile;
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(profile || { name: '', email: '' });
  const [isSaved, setIsSaved] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!profile) {
    return <div className="container section text-center">Please log in to view this page.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    setUploadError('');
    try {
      const url = await uploadFile(file, 'avatars', 'logos/');
      setFormData((prev: any) => ({ ...prev, avatarUrl: url }));
      await updateProfile({ avatarUrl: url });
    } catch (err: any) {
      setUploadError('Logo upload failed: ' + err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    setUploadError('');
    try {
      const url = await uploadFile(file, 'avatars', 'banners/');
      setFormData((prev: any) => ({ ...prev, bannerUrl: url }));
      await updateProfile({ bannerUrl: url });
    } catch (err: any) {
      setUploadError('Banner upload failed: ' + err.message);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      navigate('/dashboard', { replace: true });
    }, 1500);
  };

  return (
    <div className="container section page-with-nav" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: 'var(--spacing-xlarge)' }}>
        <h1 className="text-hero animate-fade-in-up" style={{ fontSize: '32px', marginBottom: 'var(--spacing-micro)' }}>Account Settings</h1>
        <p className="text-body animate-fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.1s' }}>Manage your host profile and subscription.</p>
      </div>

      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--spacing-xlarge)', alignItems: 'start' }}>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>
          <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
            <h2 className="text-section" style={{ fontSize: '20px', marginBottom: 'var(--spacing-large)' }}>Host Profile</h2>

            {/* Banner Upload */}
            <div className="form-group">
              <label className="form-label">Profile Banner</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
                <img
                  src={formData.bannerUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600'}
                  alt="Banner"
                  style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-card)', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />
                <div>
                  <button
                    type="button"
                    className="btn-secondary hover-scale"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={isUploadingBanner}
                  >
                    {isUploadingBanner
                      ? <><Spinner size={20} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                      : <><UploadSimple size={20} /> Change Banner</>
                    }
                  </button>
                </div>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleBannerUpload}
              />
            </div>

            {/* Logo Upload */}
            <div className="form-group">
              <label className="form-label">Business Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-base)' }}>
                <img
                  src={formData.avatarUrl || 'https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=100'}
                  alt="Logo"
                  style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-pill)', objectFit: 'cover', border: '2px solid var(--color-deep-navy)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary hover-scale"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
                    {isUploadingLogo
                      ? <><Spinner size={20} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                      : <><UploadSimple size={20} /> Change Logo</>
                    }
                  </button>
                  {uploadError && <p style={{ color: 'var(--color-error)', fontSize: '13px', margin: 0 }}>{uploadError}</p>}
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleLogoUpload}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Name</label>
              <div style={{ position: 'relative' }}>
                <Storefront size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="businessName" value={formData.businessName || ''} onChange={handleChange} type="text" style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <div style={{ position: 'relative' }}>
                <EnvelopeSimple size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="email" value={formData.email || ''} onChange={handleChange} type="email" style={{ paddingLeft: '40px' }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <PhoneInput 
                name="phone" 
                value={formData.phone || ''} 
                onChange={(val: string) => setFormData((prev: any) => ({ ...prev, phone: val }))} 
                placeholder="+256..." 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Welcoming Message (Bio)</label>
              <textarea name="bio" value={formData.bio || ''} onChange={handleChange as any} rows={4} style={{ resize: 'vertical' }} placeholder="Welcome to our events! We curate..." />
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              <div style={{ position: 'relative' }}>
                <Globe size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input name="website" value={formData.website || ''} onChange={handleChange} type="url" style={{ paddingLeft: '40px' }} placeholder="https://" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--spacing-base)', marginTop: 'var(--spacing-large)' }}>
              {isSaved && <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={20} /> Saved successfully</span>}
              <button type="submit" className="btn-accent hover-scale" style={{ padding: '12px 32px' }}>Save Changes</button>
            </div>
          </div>
        </form>

        {/* Subscription Sidebar */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', position: 'sticky', top: '24px' }}>
          <div className="card-padding" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-pin-orange)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-base)' }}>
              <h2 className="text-section" style={{ fontSize: '18px' }}>Current Plan</h2>
              <span className="badge" style={{ backgroundColor: 'var(--color-pin-orange)', color: 'white' }}>{hostProfile?.subscription || 'Free Trial'}</span>
            </div>

            <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-large)' }}>
              {hostProfile?.subscription === 'Free Trial' && 'You are currently on the Free Trial. Upgrade to host more events and unlock advanced features.'}
              {hostProfile?.subscription === 'Starter' && 'You have the Starter plan. Great for small organizers.'}
              {hostProfile?.subscription === 'Growth' && 'You have the Growth plan. Unlimited events and advanced analytics!'}
              {hostProfile?.subscription === 'Pro' && 'You are a Pro! Enjoy priority placement and premium support.'}
            </p>

            <Link to="/pricing" style={{ display: 'block' }}>
              <button className="btn-accent hover-scale" style={{ width: '100%', padding: '12px' }}>
                View Plans & Upgrade
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
