import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'account_settings': 'Account Settings',
    'language': 'Language',
    'english': 'English',
    'french': 'French',
    'dark_mode': 'Dark Mode',
    'light_mode': 'Light Mode',
    'push_notifications': 'Push Notifications',
    'email_alerts': 'Email Alerts',
    'sign_out': 'Sign Out',
    'my_tickets': 'My Tickets',
    'saved_events': 'Saved Events',
    'following': 'Following',
    'edit_profile': 'Edit Profile',
    'payment_methods': 'Payment Methods',
    'discover': 'Discover',
    'live_snippets': 'Live Snippets',
    'host_event': 'Host Event',
    'profile': 'Profile',
    'log_in': 'Log In',
    'account': 'Account',
    'notifications': 'Notifications',
    'mark_all_read': 'Mark all read',
    'view_all': 'View All',
    'hero_title': 'Experience the City Like Never Before',
    'hero_subtitle': 'Discover exclusive events, secret parties, and live moments happening right now around you.',
    'explore_events': 'Explore Events',
    'trending_now': 'Trending Now',
    'upcoming_near_you': 'Upcoming Near You',
    'explore_categories': 'Explore Categories',
    'search_events': 'Search Events...',
    'what_are_you_looking_for': 'What are you looking for?',
    'filters': 'Filters',
    'category': 'Category',
    'distance': 'Distance',
    'price': 'Price',
    'clear_all': 'Clear all filters',
    'no_events_found': 'No events found',
    'back_to_discover': 'Back to Discover',
    'add_to_calendar': 'Add to Calendar',
    'interested': 'Interested',
    'going': 'Going',
    'about_this_event': 'About this event',
    'gallery': 'Gallery',
    'reviews': 'Reviews',
    'leave_a_review': 'Leave a Review',
    'submit_review': 'Submit Review',
    'tickets': 'Tickets',
    'general_admission': 'General Admission',
    'buy_tickets': 'Buy Tickets',
    'promo_code': 'Promo Code',
    'apply': 'Apply',
    'official_partners': 'Official Partners',
    'early_bird_offer': 'Early Bird Offer',
    'ends_in': 'Ends in:',
    'search': 'Search',
    'hottest_events': 'Hottest Events',
    'from_hosts_you_follow': 'Following',
    'discover_more': 'Discover More',
    'date': 'Date',
    'all_filters': 'All Filters',
    'all_cities': 'All Cities'
  },
  fr: {
    'account_settings': 'Paramètres du compte',
    'language': 'Langue',
    'english': 'Anglais',
    'french': 'Français',
    'dark_mode': 'Mode sombre',
    'light_mode': 'Mode clair',
    'push_notifications': 'Notifications Push',
    'email_alerts': 'Alertes Email',
    'sign_out': 'Se déconnecter',
    'my_tickets': 'Mes billets',
    'saved_events': 'Événements enregistrés',
    'following': 'Abonnements',
    'edit_profile': 'Modifier le profil',
    'payment_methods': 'Moyens de paiement',
    'discover': 'Découvrir',
    'live_snippets': 'Extraits en direct',
    'host_event': 'Organiser un événement',
    'profile': 'Profil',
    'log_in': 'Se connecter',
    'account': 'Compte',
    'notifications': 'Notifications',
    'mark_all_read': 'Tout marquer comme lu',
    'view_all': 'Voir tout',
    'hero_title': 'Vivez la ville comme jamais auparavant',
    'hero_subtitle': 'Découvrez des événements exclusifs, des soirées secrètes et des moments en direct près de chez vous.',
    'explore_events': 'Explorer les événements',
    'trending_now': 'Tendances actuelles',
    'upcoming_near_you': 'À venir près de chez vous',
    'explore_categories': 'Explorer les catégories',
    'search_events': 'Rechercher des événements...',
    'what_are_you_looking_for': 'Que recherchez-vous ?',
    'filters': 'Filtres',
    'category': 'Catégorie',
    'distance': 'Distance',
    'price': 'Prix',
    'clear_all': 'Effacer tous les filtres',
    'no_events_found': 'Aucun événement trouvé',
    'back_to_discover': 'Retour à la découverte',
    'add_to_calendar': 'Ajouter au calendrier',
    'interested': 'Intéressé(e)',
    'going': 'J\'y vais',
    'about_this_event': 'À propos de cet événement',
    'gallery': 'Galerie',
    'reviews': 'Avis',
    'leave_a_review': 'Laisser un avis',
    'submit_review': 'Soumettre l\'avis',
    'tickets': 'Billets',
    'general_admission': 'Entrée générale',
    'buy_tickets': 'Acheter des billets',
    'promo_code': 'Code promo',
    'apply': 'Appliquer',
    'official_partners': 'Partenaires officiels',
    'early_bird_offer': 'Offre de lancement',
    'ends_in': 'Se termine dans :',
    'search': 'Rechercher',
    'hottest_events': 'Événements les plus chauds',
    'from_hosts_you_follow': 'Abonnements',
    'discover_more': 'Découvrir plus',
    'date': 'Date',
    'all_filters': 'Tous les filtres',
    'all_cities': 'Toutes les villes'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('findit_language');
    return (saved === 'fr' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('findit_language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
