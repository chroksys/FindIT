import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { HostEvent } from './pages/HostEvent';
import { EventDetail } from './pages/EventDetail';
import { Dashboard } from './pages/Dashboard';
import { Account } from './pages/Account';
import { Pricing } from './pages/Pricing';
import { LiveEvents } from './pages/LiveEvents';
import { Search } from './pages/Search';
import { Calendar } from './pages/Calendar';
import { Auth } from './pages/Auth';
import { Analytics } from './pages/Analytics';
import { PromoterVerification } from './pages/PromoterVerification';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrganizerProfile } from './pages/OrganizerProfile';
import { AttendeeLiveMode } from './pages/AttendeeLiveMode';
import { HostControlCenter } from './pages/HostControlCenter';
import { Notifications } from './pages/Notifications';
import { MapView } from './pages/Map';
import { HottestEvents } from './pages/HottestEvents';
import { FollowingEvents } from './pages/FollowingEvents';
import { ScrollToTop } from './components/ScrollToTop';
import { HardwareBackButtonHandler } from './components/BackButtonHandler';
import { EventProvider } from './context/EventContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#050505' }).catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <EventProvider>
        <BrowserRouter>
          <ScrollToTop />
          <HardwareBackButtonHandler />
          <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main className="main-content" style={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/live" element={<LiveEvents />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/host" element={<HostEvent />} />
                <Route path="/host/live/:id" element={<HostControlCenter />} />
                <Route path="/host/:id" element={<HostEvent />} />
                <Route path="/verify" element={<PromoterVerification />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/account" element={<Account />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/live/:id" element={<AttendeeLiveMode />} />
                <Route path="/host/live/:id" element={<HostControlCenter />} />
                <Route path="/organizer/:id" element={<OrganizerProfile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/hottest" element={<HottestEvents />} />
                <Route path="/following" element={<FollowingEvents />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
        </EventProvider>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
