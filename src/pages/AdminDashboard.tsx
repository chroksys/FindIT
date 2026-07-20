import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { CaretLeft, ShieldCheck, CheckCircle, XCircle, File } from '@phosphor-icons/react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, pendingPromoters, approvePromoter, rejectPromoter } = useUserContext();

  // Protect route
  if (role !== 'admin') {
    return (
      <div className="container section page-with-nav" style={{ textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be an administrator to view this page.</p>
        <button className="btn-primary mt-4" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="container section page-with-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-small)', marginBottom: 'var(--spacing-large)' }}>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: 0 }}>
          <CaretLeft size={24} />
        </button>
        <h1 className="text-hero" style={{ fontSize: '28px', margin: 0 }}>Admin Portal</h1>
      </div>

      <div style={{ marginBottom: 'var(--spacing-xlarge)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: 'var(--spacing-base)' }}>Pending KYB Verifications</h2>
        
        {pendingPromoters.length === 0 ? (
          <div style={{ padding: 'var(--spacing-xlarge)', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)' }}>
            <ShieldCheck size={48} color="var(--text-secondary)" style={{ margin: '0 auto var(--spacing-base)' }} />
            <h3>All caught up!</h3>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>There are no pending verification requests at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>
            {pendingPromoters.map((promoter, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: 'var(--spacing-base)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{promoter.businessName}</h3>
                    <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Host User: {promoter.name} ({promoter.email})</p>
                  </div>
                  <div style={{ padding: '4px 12px', backgroundColor: 'rgba(255, 107, 0, 0.1)', color: 'var(--color-pin-orange)', borderRadius: 'var(--radius-pill)', fontSize: '12px', fontWeight: 600 }}>
                    Pending Review
                  </div>
                </div>
                
                <div style={{ padding: 'var(--spacing-base)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>URSB Number</span>
                      <p style={{ fontWeight: 600 }}>{promoter.ursbNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>TIN Number</span>
                      <p style={{ fontWeight: 600 }}>{promoter.tin || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>Director NIN</span>
                      <p style={{ fontWeight: 600 }}>{promoter.nin || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>Uploaded Documents Vault</span>
                    {promoter.documentUrls && promoter.documentUrls.length > 0 ? (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        {promoter.documentUrls.map((_url, i) => (
                          <div key={i} style={{ padding: '8px 12px', backgroundColor: 'var(--bg-default)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} className="hover-scale">
                            <File size={20} color="var(--color-pin-orange)" />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>View Document {i+1}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontWeight: 600, color: 'var(--color-error)' }}>No documents uploaded.</p>
                    )}
                  </div>
                </div>

                <div style={{ padding: 'var(--spacing-base)', backgroundColor: 'var(--bg-default)', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)' }}>
                  <button 
                    onClick={() => rejectPromoter(promoter.email)}
                    className="btn-secondary hover-scale" 
                    style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                  >
                    <XCircle size={20} /> Reject
                  </button>
                  <button 
                    onClick={() => approvePromoter(promoter.email)}
                    className="btn-accent hover-scale" 
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: 'var(--color-success)' }}
                  >
                    <CheckCircle size={20} /> Approve & Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
