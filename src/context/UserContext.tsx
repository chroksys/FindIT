import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export type SubscriptionTier = 'Free Trial' | 'Starter' | 'Growth' | 'Pro';
export type Role = 'guest' | 'user' | 'host' | 'admin';
export type VerificationStatus = 'unverified' | 'pending_review' | 'verified';

export interface BaseProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

export interface UserProfile extends BaseProfile {
  interests: string[];
}

export interface HostProfile extends BaseProfile {
  businessName: string;
  organizerType: string;
  website?: string;
  bio?: string;
  subscription: SubscriptionTier;
  verificationStatus: VerificationStatus;
  ursbNumber?: string;
  tin?: string;
  nin?: string;
  documentUrls?: string[];
}

export interface AppNotification {
  id: string;
  type: string;
  title?: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

type AnyProfile = UserProfile | HostProfile;

interface UserContextType {
  role: Role;
  profile: AnyProfile | null;
  isLoading: boolean;
  registerUser: (data: UserProfile, password: string) => Promise<void>;
  registerHost: (data: HostProfile, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AnyProfile>) => Promise<void>;
  updateSubscription: (tier: SubscriptionTier) => Promise<void>;
  getEventLimit: () => number;
  loginMock: (email: string, password?: string) => Promise<void>;
  submitKyb: (data: Partial<HostProfile>) => Promise<void>;
  pendingPromoters: HostProfile[];
  approvePromoter: (email: string) => void;
  rejectPromoter: (email: string) => void;
  savedEventIds: string[];
  toggleSaveEvent: (eventId: string) => Promise<void>;
  notifications: AppNotification[];
  unreadCount: number;
  markNotificationsAsRead: (id?: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('guest');
  const [profile, setProfile] = useState<AnyProfile | null>(null);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isRegisteringRef = useRef(false);

  const [pendingPromoters] = useState<HostProfile[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationsAsRead = async (id?: string) => {
    if (!profile?.id) return;
    if (id) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } else {
      await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  useEffect(() => {
    const checkPermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        const { display } = await LocalNotifications.checkPermissions();
        if (display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      }
    };
    checkPermissions();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email || '').finally(() => setIsLoading(false));
        fetchNotifications(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email || '');
        fetchNotifications(session.user.id);
      } else {
        setProfile(null);
        setRole('guest');
        setNotifications([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`
        },
        async (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications((prev) => [newNotif, ...prev]);
          
          if (Capacitor.isNativePlatform()) {
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: newNotif.title || 'New FindIt Notification',
                  body: newNotif.message,
                  id: new Date().getTime(),
                  schedule: { at: new Date(Date.now() + 1000) },
                  sound: undefined,
                  attachments: undefined,
                  actionTypeId: '',
                  extra: null
                }
              ]
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchProfile = async (userId: string, email: string) => {
    if (isRegisteringRef.current) return;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setRole(data.role as Role);
      setProfile({
        id: data.id,
        name: data.name || '',
        email: email,
        avatarUrl: data.avatar_url,
        bannerUrl: data.banner_url,
        phone: data.phone,
        city: data.city,
        interests: data.interests || [],
        businessName: data.business_name,
        organizerType: data.organizer_type,
        website: data.website,
        bio: data.bio,
        verificationStatus: data.verification_status,
        ursbNumber: data.ursb_number,
        tin: data.tin,
        nin: data.nin,
        documentUrls: data.document_urls || [],
        subscription: data.subscription as SubscriptionTier,
        role: data.role,
      } as AnyProfile);
      fetchSavedEvents(userId);
    } else {
      // Profile row not found — treat as a basic authenticated user
      // This can happen if the profile insert failed or email wasn't confirmed yet
      console.warn('fetchProfile: no profile row found for user', userId, error?.message);
      setRole('user');
      setProfile({ id: userId, name: email.split('@')[0], email } as AnyProfile);
    }
  };

  const fetchSavedEvents = async (userId: string) => {
    const { data } = await supabase.from('saved_events').select('event_id').eq('user_id', userId);
    if (data) {
      setSavedEventIds(data.map(d => d.event_id));
    }
  };

  const toggleSaveEvent = async (eventId: string) => {
    if (!profile?.id) return;
    const isSaved = savedEventIds.includes(eventId);
    if (isSaved) {
      setSavedEventIds(prev => prev.filter(id => id !== eventId));
      await supabase.from('saved_events').delete().eq('user_id', profile.id).eq('event_id', eventId);
    } else {
      setSavedEventIds(prev => [...prev, eventId]);
      await supabase.from('saved_events').insert({ user_id: profile.id, event_id: eventId });
    }
  };

  const registerUser = async (data: UserProfile, password: string) => {
    isRegisteringRef.current = true;
    try {
      const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password });
      if (error) throw error;
      if (authData.user) {
        await supabase.from('profiles').insert([
          { 
            id: authData.user.id, 
            name: data.name, 
            email: data.email, 
            role: 'user', 
            avatar_url: data.avatarUrl,
            phone: data.phone,
            city: data.city,
            interests: data.interests || []
          }
        ]);
        setRole('user');
        setProfile({ ...data, id: authData.user.id });
      }
    } finally {
      isRegisteringRef.current = false;
    }
  };

  const registerHost = async (data: HostProfile, password: string) => {
    isRegisteringRef.current = true;
    try {
      const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password });
      if (error) throw error;
      if (authData.user) {
        await supabase.from('profiles').insert([
          { 
            id: authData.user.id, 
            name: data.name, 
            email: data.email, 
            role: 'host', 
            subscription: data.subscription, 
            avatar_url: data.avatarUrl,
            phone: data.phone,
            city: data.city,
            business_name: data.businessName,
            organizer_type: data.organizerType,
            website: data.website,
            bio: data.bio,
            verification_status: 'unverified'
          }
        ]);
        setRole('host');
        setProfile({ ...data, id: authData.user.id, verificationStatus: 'unverified' });
      }
    } finally {
      isRegisteringRef.current = false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const loginMock = async (email: string, password?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
    if (error) {
      throw error;
    }

    // Explicitly fetch profile here before returning to ensure state is ready before navigation
    if (data.session) {
      await fetchProfile(data.session.user.id, data.session.user.email || email);
    }
  };

  const submitKyb = async (data: Partial<HostProfile>) => {
    if (profile && profile.id && role === 'host') {
      const dbUpdates: any = {};
      if (data.ursbNumber) dbUpdates.ursb_number = data.ursbNumber;
      if (data.tin) dbUpdates.tin = data.tin;
      if (data.nin) dbUpdates.nin = data.nin;
      if (data.documentUrls) dbUpdates.document_urls = data.documentUrls;
      dbUpdates.verification_status = 'pending_review';

      await supabase.from('profiles').update(dbUpdates).eq('id', profile.id);
      
      const updatedProfile = { ...profile, ...data, verificationStatus: 'pending_review' } as HostProfile;
      setProfile(updatedProfile);

      // Trigger the email notification to the admin via Vercel Serverless Function
      try {
        console.log('Sending notification email to admin...');
        const res = await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: data.businessName || profile.name || 'Unknown Business',
            hostEmail: profile.email,
            documentUrls: data.documentUrls || []
          })
        });
        
        const responseData = await res.json();
        
        if (!res.ok) {
          console.error('Vercel API returned an error:', responseData);
        } else {
          console.log('Successfully sent admin email:', responseData);
        }
      } catch (err) {
        console.error('Failed to send admin notification (Network error):', err);
      }
    }
  };

  const updateProfile = async (updates: Partial<AnyProfile>) => {
    if (profile && profile.id) {
      // Map frontend camelCase to database snake_case
      const dbUpdates: any = { ...updates };
      
      const mapField = (camel: string, snake: string) => {
        if (dbUpdates[camel] !== undefined) {
          dbUpdates[snake] = dbUpdates[camel];
          delete dbUpdates[camel];
        }
      };

      mapField('avatarUrl', 'avatar_url');
      mapField('bannerUrl', 'banner_url');
      mapField('businessName', 'business_name');
      mapField('organizerType', 'organizer_type');
      mapField('verificationStatus', 'verification_status');
      mapField('ursbNumber', 'ursb_number');
      mapField('documentUrls', 'document_urls');
      
      await supabase.from('profiles').update(dbUpdates).eq('id', profile.id);
      setProfile({ ...profile, ...updates } as AnyProfile);
    }
  };

  const updateSubscription = async (tier: SubscriptionTier) => {
    if (role === 'host' && profile && profile.id) {
      await supabase.from('profiles').update({ subscription: tier }).eq('id', profile.id);
      setProfile({ ...profile, subscription: tier } as HostProfile);
    }
  };

  const getEventLimit = (): number => {
    if (role !== 'host' || !profile) return 0;
    const p = profile as HostProfile;
    switch (p.subscription) {
      case 'Free Trial': return 2;
      case 'Starter': return 5;
      case 'Growth': return Infinity;
      case 'Pro': return Infinity;
      default: return 2;
    }
  };

  const approvePromoter = (_email: string) => {};
  const rejectPromoter = (_email: string) => {};

  return (
    <UserContext.Provider value={{ role, profile, isLoading, registerUser, registerHost, logout, updateProfile, updateSubscription, getEventLimit, loginMock, submitKyb, pendingPromoters, approvePromoter, rejectPromoter, savedEventIds, toggleSaveEvent, notifications, unreadCount, markNotificationsAsRead }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
