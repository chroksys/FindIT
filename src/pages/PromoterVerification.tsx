import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import type { HostProfile } from '../context/UserContext';
import { CaretLeft, ShieldCheck, UploadSimple, File, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { uploadFile } from '../lib/uploadFile';

export const PromoterVerification = () => {
  const navigate = useNavigate();
  const { profile, role, submitKyb } = useUserContext();
  const hostProfile = profile as HostProfile;

  const [formData, setFormData] = useState({
    businessName: hostProfile?.businessName || '',
    ursbNumber: '',
    tin: '',
    nin: ''
  });
  
  const [documents, setDocuments] = useState<{name: string, url: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const docInputRef = useRef<HTMLInputElement>(null);

  // If not a host, they shouldn't be here
  if (role !== 'host') {
    return (
      <div className="container section page-with-nav" style={{ textAlign: 'center' }}>
        <WarningCircle size={48} color="var(--color-error)" style={{ margin: '0 auto var(--spacing-base)' }} />
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be a registered host to access KYB verification.</p>
        <button className="btn-primary mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  // If already pending or verified
  if (hostProfile?.verificationStatus === 'pending_review' || hostProfile?.verificationStatus === 'verified') {
    return (
      <div className="container section page-with-nav" style={{ textAlign: 'center' }}>
        <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto var(--spacing-base)' }} />
        <h2>Verification Submitted</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your profile is currently: {hostProfile.verificationStatus}</p>
        <button className="btn-primary mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const path = await uploadFile(file, 'kyb-documents', 'kyb/');
          return { name: file.name, url: path };
        })
      );
      setDocuments(prev => [...prev, ...uploads]);
    } catch (err: any) {
      setUploadError('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documents.length === 0) {
      alert('Please upload at least one verification document.');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      submitKyb({
        businessName: formData.businessName,
        ursbNumber: formData.ursbNumber,
        tin: formData.tin,
        nin: formData.nin,
        documentUrls: documents.map(d => d.url)
      });
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="container section page-with-nav" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-small)', marginBottom: 'var(--spacing-large)' }}>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: 0 }}>
          <CaretLeft size={24} />
        </button>
        <h1 className="text-hero" style={{ fontSize: '28px', margin: 0 }}>Verify Business</h1>
      </div>

      <div style={{ backgroundColor: 'rgba(255, 107, 0, 0.1)', border: '1px solid var(--color-pin-orange)', borderRadius: 'var(--radius-card)', padding: '16px', marginBottom: 'var(--spacing-xlarge)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <ShieldCheck size={28} color="var(--color-pin-orange)" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Zero-Cost Manual KYB Onboarding</h3>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>To maintain trust on the platform, we require all event promoters to verify their legal business identity. This process is 100% free.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-card)', padding: 'var(--spacing-large)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Business Details</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="text-caption" style={{ fontWeight: 600 }}>Registered Business Name</label>
            <input 
              type="text" 
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              required
              className="input-field" 
              placeholder="e.g. Talent Africa Group" 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="text-caption" style={{ fontWeight: 600 }}>Business Registration / URSB Certificate Number</label>
            <input 
              type="text" 
              name="ursbNumber"
              value={formData.ursbNumber}
              onChange={handleInputChange}
              required
              className="input-field" 
              placeholder="e.g. 80020001234567" 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="text-caption" style={{ fontWeight: 600 }}>Tax Identification Number (TIN)</label>
            <input 
              type="text" 
              name="tin"
              value={formData.tin}
              onChange={handleInputChange}
              required
              className="input-field" 
              placeholder="e.g. 1001234567" 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="text-caption" style={{ fontWeight: 600 }}>Director's National ID Number (NIN)</label>
            <input 
              type="text" 
              name="nin"
              value={formData.nin}
              onChange={handleInputChange}
              required
              className="input-field" 
              placeholder="e.g. CM123456789ABC" 
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-card)', padding: 'var(--spacing-large)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Document Upload Vault</h2>
          <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            Please upload a clear photo or PDF of your URSB Certificate and National ID. These are securely stored and only accessible by our verification team.
          </p>

          {/* Upload Area */}
          <div 
            style={{ 
              border: '2px dashed var(--border-color)', 
              borderRadius: 'var(--radius-card)', 
              padding: 'var(--spacing-xlarge)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              cursor: 'pointer'
            }}
            onClick={() => docInputRef.current?.click()}
            className="hover-scale"
          >
            {isUploading ? (
              <>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--color-pin-orange)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                <span className="text-body" style={{ color: 'var(--color-pin-orange)' }}>Uploading to secure vault...</span>
              </>
            ) : (
              <>
                <UploadSimple size={32} color="var(--text-secondary)" />
                <span className="text-body" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Click to select files</span>
                <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>Supports JPG, PNG, PDF · Max 20MB · Multiple files allowed</span>
              </>
            )}
            {uploadError && <span className="text-caption" style={{ color: 'var(--color-error)' }}>{uploadError}</span>}
          </div>
          <input
            ref={docInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            multiple
            style={{ display: 'none' }}
            onChange={handleDocUpload}
          />

          {/* Uploaded Documents List */}
          {documents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-default)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
                  <File size={24} color="var(--color-pin-orange)" />
                  <span className="text-body" style={{ flex: 1 }}>{doc.name}</span>
                  <CheckCircle size={20} color="var(--color-success)" />
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn-accent" 
          style={{ padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
             <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          ) : (
            <>
              <ShieldCheck size={20} />
              Submit for Verification
            </>
          )}
        </button>
      </form>
    </div>
  );
};
