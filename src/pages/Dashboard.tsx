import React from 'react';
import { useUserContext } from '../context/UserContext';
import { HostDashboard } from '../components/dashboard/HostDashboard';
import { UserDashboard } from '../components/dashboard/UserDashboard';
import { Navigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { role, isLoading } = useUserContext();

  // Wait for Supabase session to resolve before redirecting
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-pin-orange)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (role === 'guest') {
    // If they hit dashboard while logged out, send them to login
    return <Navigate to="/login" replace />;
  }

  if (role === 'host') {
    return <HostDashboard />;
  }

  if (role === 'user') {
    return <UserDashboard />;
  }

  return null;
};
