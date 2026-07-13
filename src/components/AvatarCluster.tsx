import React from 'react';

interface AvatarClusterProps {
  rsvps: { avatarUrl?: string; status: 'going' | 'interested' }[];
  size?: number;
}

export const AvatarCluster: React.FC<AvatarClusterProps> = ({ rsvps, size = 32 }) => {
  const going = rsvps.filter(r => r.status === 'going');
  const count = going.length;
  
  if (count === 0) return null;

  // Take up to 3 unique avatars for display
  const avatarsToShow = going
    .map(r => r.avatarUrl)
    .filter(Boolean)
    .slice(0, 3) as string[];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex' }}>
        {avatarsToShow.map((url, i) => (
          <img
            key={i}
            src={url}
            alt="Attendee"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              objectFit: 'cover',
              border: `2px solid var(--bg-card)`,
              marginLeft: i > 0 ? `-${size / 2.5}px` : 0,
              position: 'relative',
              zIndex: 3 - i
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {count} going
      </span>
    </div>
  );
};
