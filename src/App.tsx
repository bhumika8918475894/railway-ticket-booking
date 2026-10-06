import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { HomePage } from './pages/HomePage.js';
import { SearchResultsPage } from './pages/SearchResultsPage.js';
import { PnrStatusPage } from './pages/PnrStatusPage.js';
import { MyBookingsPage } from './pages/MyBookingsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { HelpPage } from './pages/HelpPage.js';

export function RailEaseApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [searchParams, setSearchParams] = useState<any>({
    from: 'HWH',
    to: 'NDLS',
    date: new Date().toISOString().split('T')[0],
    travelClass: 'ALL',
    passengersCount: 1,
  });
  const [pnrParam, setPnrParam] = useState<string>('2456891024');

  const handleNavigate = (tab: string, meta?: any) => {
    if (tab === 'pnr' && meta?.pnr) {
      setPnrParam(meta.pnr);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchFromHome = (params: any) => {
    setSearchParams(params);
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage onSearch={handleSearchFromHome} onNavigate={handleNavigate} />
        )}

        {currentTab === 'search' && (
          <SearchResultsPage
            initialSearchParams={searchParams}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'pnr' && (
          <PnrStatusPage initialPnr={pnrParam} onNavigate={handleNavigate} />
        )}

        {currentTab === 'bookings' && (
          <MyBookingsPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'profile' && (
          <ProfilePage onNavigate={handleNavigate} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage />
        )}

        {currentTab === 'help' && (
          <HelpPage />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RailEaseApp />
      </AuthProvider>
    </ToastProvider>
  );
}
