import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card-padding" style={{ 
      backgroundColor: 'var(--bg-card)', 
      borderRadius: 'var(--radius-card)', 
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-base)',
      height: '100%'
    }}>
      {/* Image Skeleton */}
      <div className="skeleton-pulse" style={{ 
        width: '100%', 
        height: '180px', 
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--border-color)' 
      }}></div>
      
      {/* Content Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        <div className="skeleton-pulse" style={{ width: '80%', height: '24px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }}></div>
        <div className="skeleton-pulse" style={{ width: '40%', height: '16px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }}></div>
        <div className="skeleton-pulse" style={{ width: '60%', height: '16px', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginTop: 'auto' }}></div>
      </div>
    </div>
  );
};
