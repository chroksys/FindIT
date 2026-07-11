import React from 'react';
import { useUserContext } from '../context/UserContext';
import { HostDashboard } from '../components/dashboard/HostDashboard';
import { UserDashboard } from '../components/dashboard/UserDashboard';
import { Navigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { role } = useUserContext();

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
