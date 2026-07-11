import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUserContext } from './UserContext';

export type EventStatus = 'Upcoming' | 'Live' | 'Ended';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  displayDate: string;
  time: string;
  displayTime: string;
  venue: string;
  city: string;
  distance: string;
  coordinates?: { lat: number; lng: number };
  bannerUrl: string;
  ticketLink?: string;
  price?: string;
  isPaused: boolean;
  organizer: {
    name: string;
    avatarUrl: string;
    verified: boolean;
    followers: number;
    subscriptionTier?: 'Free' | 'Pro' | 'Starter' | 'Growth';
    isFollowed?: boolean;
  };
  gallery: string[];
  reviews: any[];
  isBoosted?: boolean;
  promoCodes?: { code: string; discount: string; uses: number }[];
  earlyBird?: { deadline: string; price: string };
  collaborations?: string[];
}

interface EventContextType {
  events: Event[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  addEvent: (event: Omit<Event, 'id' | 'isPaused' | 'organizer' | 'gallery' | 'reviews'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;
  togglePauseEvent: (id: string) => void;
  getEventStatus: (event: Event) => EventStatus;
  addReview: (eventId: string, rating: number, comment: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const { profile } = useUserContext();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*, profiles(id, name, avatar_url, subscription)')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      // Fetch all reviews in one query
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      const mappedEvents: Event[] = data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        category: d.category,
        date: d.date,
        displayDate: d.display_date,
        time: d.time,
        displayTime: d.display_time,
        venue: d.venue,
        city: d.city,
        distance: d.distance,
        bannerUrl: d.banner_url,
        price: d.price,
        isPaused: d.is_paused,
        isBoosted: d.is_boosted,
        hostId: d.host_id,
        organizer: {
          id: d.profiles?.id,
          name: d.profiles?.name || 'Unknown',
          avatarUrl: d.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
          verified: false,
          followers: 0,
          subscriptionTier: d.profiles?.subscription
        },
        gallery: [],
        reviews: (reviewsData || []).filter((r: any) => r.event_id === d.id),
        promoCodes: d.promo_codes || [],
        earlyBird: d.early_bird_deadline ? { deadline: d.early_bird_deadline, price: d.early_bird_price } : undefined,
        collaborations: d.collaborations || [],
        coordinates: d.coordinates_lat && d.coordinates_lng ? { lat: Number(d.coordinates_lat), lng: Number(d.coordinates_lng) } : undefined
      }));
      setEvents(mappedEvents);
    } else {
      setEvents([]);
    }
  };

  const addReview = async (eventId: string, rating: number, comment: string) => {
    if (!profile?.id) throw new Error('Must be logged in to leave a review');

    // Insert the review
    const { error: reviewError } = await supabase.from('reviews').insert({
      event_id: eventId,
      user_id: profile.id,
      user_name: profile.name || 'Anonymous',
      rating,
      comment
    });
    if (reviewError) throw reviewError;

    // Find the event to get the host_id
    const event = events.find(e => e.id === eventId);
    const hostId = (event as any)?.hostId;

    // Notify the organizer (only if reviewer is not the organizer)
    if (hostId && hostId !== profile.id) {
      await supabase.from('notifications').insert({
        user_id: hostId,
        type: 'review',
        message: `⭐ ${profile.name || 'Someone'} left a ${rating}-star review on "${event?.title}"`,
        link: `/event/${eventId}`,
        read: false
      });
    }

    // Refresh events to show the new review
    await fetchEvents();
  };

  const getEventStatus = (event: Event): EventStatus => {
    if (!event.date || !event.time) return 'Upcoming';
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const now = new Date();
    const diffHours = (now.getTime() - eventDateTime.getTime()) / (1000 * 60 * 60);
    
    if (diffHours > 24) return 'Ended';
    if (diffHours >= 0 && diffHours <= 24) return 'Live';
    return 'Upcoming';
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'isPaused' | 'organizer' | 'gallery' | 'reviews'>) => {
    console.log('[addEvent] called. profile:', profile);
    if (!profile?.id) {
      alert('You must be logged in as a Host to create live events.');
      return;
    }

    const payload: any = {
      host_id: profile.id,
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      date: eventData.date,
      display_date: eventData.displayDate,
      time: eventData.time,
      display_time: eventData.displayTime,
      venue: eventData.venue,
      city: eventData.city || '',
      distance: eventData.distance,
      banner_url: eventData.bannerUrl,
      price: eventData.price || null,
      ticket_link: (eventData as any).ticketLink || null,
    };

    if ((eventData as any).earlyBird?.deadline) {
      payload.early_bird_deadline = (eventData as any).earlyBird.deadline;
      payload.early_bird_price = (eventData as any).earlyBird.price || null;
    }

    if ((eventData as any).collaborations?.length) {
      payload.collaborations = (eventData as any).collaborations;
    }

    console.log('[addEvent] inserting payload:', payload);
    const { data: insertData, error } = await supabase.from('events').insert([payload]).select();
    console.log('[addEvent] insert result — data:', insertData, '| error:', error);

    if (error) {
      console.error('Supabase insert error:', error);
      alert(`Failed to publish event: ${error.message}`);
      return;
    }

    console.log('[addEvent] insert succeeded, refreshing events...');
    await fetchEvents();
    console.log('[addEvent] fetchEvents done');
  };

  const updateEvent = async (id: string, updatedData: Partial<Event>) => {
    if (!profile?.id) return;

    const payload: any = {};
    
    // Map camelCase fields to snake_case payload
    const mapField = (camel: keyof Event, snake: string) => {
      if (updatedData[camel] !== undefined) payload[snake] = updatedData[camel];
    };

    mapField('title', 'title');
    mapField('description', 'description');
    mapField('category', 'category');
    mapField('date', 'date');
    mapField('displayDate', 'display_date');
    mapField('time', 'time');
    mapField('displayTime', 'display_time');
    mapField('venue', 'venue');
    mapField('city', 'city');
    mapField('distance', 'distance');
    mapField('bannerUrl', 'banner_url');
    mapField('price', 'price');
    mapField('isPaused', 'is_paused');
    mapField('isBoosted', 'is_boosted');
    mapField('ticketLink', 'ticket_link');
    mapField('gallery', 'gallery');
    mapField('reviews', 'reviews');
    mapField('promoCodes', 'promo_codes');
    mapField('collaborations', 'collaborations');

    if (updatedData.earlyBird !== undefined) {
      payload.early_bird_deadline = updatedData.earlyBird?.deadline || null;
      payload.early_bird_price = updatedData.earlyBird?.price || null;
    }
    
    if (updatedData.coordinates !== undefined) {
      payload.coordinates_lat = updatedData.coordinates?.lat || null;
      payload.coordinates_lng = updatedData.coordinates?.lng || null;
    }

    await supabase.from('events').update(payload).eq('id', id);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  };

  const duplicateEvent = async (id: string) => {
    const eventToDuplicate = events.find(e => e.id === id);
    if (eventToDuplicate && profile?.id) {
       await supabase.from('events').insert([{
         host_id: profile.id,
         title: `${eventToDuplicate.title} (Copy)`,
         description: eventToDuplicate.description,
         category: eventToDuplicate.category,
         date: eventToDuplicate.date,
         display_date: eventToDuplicate.displayDate,
         time: eventToDuplicate.time,
         display_time: eventToDuplicate.displayTime,
         venue: eventToDuplicate.venue,
         city: eventToDuplicate.city,
         distance: eventToDuplicate.distance,
         banner_url: eventToDuplicate.bannerUrl,
         price: eventToDuplicate.price,
         is_paused: true
       }]);
       fetchEvents();
    }
  };

  const togglePauseEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      await updateEvent(id, { isPaused: !event.isPaused });
    }
  };

  return (
    <EventContext.Provider value={{
      events,
      selectedCity,
      setSelectedCity,
      addEvent,
      updateEvent,
      deleteEvent,
      duplicateEvent,
      togglePauseEvent,
      getEventStatus,
      addReview
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
