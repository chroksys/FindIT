import React from 'react';
import { useUserContext } from '../context/UserContext';
import { HostAccount } from '../components/account/HostAccount';
import { UserAccount } from '../components/account/UserAccount';
import { Navigate } from 'react-router-dom';

export const Account: React.FC = () => {
  const { role, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-pin-orange)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (role === 'guest') {
    return <Navigate to="/login" replace />;
  }

  if (role === 'host') {
    return <HostAccount />;
  }

  if (role === 'user') {
    return <UserAccount />;
  }

  return null;
};
