import React from 'react';
import { useUserContext } from '../context/UserContext';
import { HostAccount } from '../components/account/HostAccount';
import { UserAccount } from '../components/account/UserAccount';
import { Navigate } from 'react-router-dom';

export const Account: React.FC = () => {
  const { role } = useUserContext();

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
