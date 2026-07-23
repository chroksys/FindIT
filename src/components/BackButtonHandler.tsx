import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

// Root / main section routes
const MAIN_TAB_PATHS = ['/', '/calendar', '/map', '/dashboard', '/live', '/host', '/account', '/login', '/search'];

export const HardwareBackButtonHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Capacitor Native Hardware Back Button Handler (for Android / iOS native container)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isMounted = true;
    let removeListener: (() => void) | undefined;

    CapacitorApp.addListener('backButton', () => {
      const isHome = location.pathname === '/';
      const isMainTab = MAIN_TAB_PATHS.includes(location.pathname);

      if (isHome) {
        // Pressing return on Home exits/minimizes the native app immediately
        CapacitorApp.minimizeApp();
      } else if (isMainTab) {
        // Pressing return on any other main section jumps straight to Home
        navigate('/', { replace: true });
      } else {
        // Pressing return from a deep/detail page goes directly back to Home, skipping past intermediate pages
        navigate('/', { replace: true });
      }
    }).then(handle => {
      if (isMounted) {
        removeListener = () => handle.remove();
      } else {
        handle.remove();
      }
    }).catch(err => {
      console.warn('Capacitor backButton listener error:', err);
    });

    return () => {
      isMounted = false;
      if (removeListener) {
        removeListener();
      }
    };
  }, [location.pathname, navigate]);

  // 2. Web Browser / Mobile Browser (PWA) Back Stack Management
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    // Reset browser history state on Home page to prevent endless reverse cycling
    if (location.pathname === '/') {
      window.history.replaceState(null, '', '/');
    }
  }, [location.pathname]);

  return null;
};
