import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TodaySection from './components/TodaySection';
import BirthdayList from './components/BirthdayList';
import FooterCta from './components/FooterCta';
import AddBirthdayModal from './components/AddBirthdayModal';
import AdminModal from './components/AdminModal';
import { INITIAL_BIRTHDAYS, calculateDaysRemaining } from './data/mockBirthdays';
import { fetchBirthdays, fetchBirthdaysCount, registerBirthday } from './services/api';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [birthdays, setBirthdays] = useState(INITIAL_BIRTHDAYS);
  const [serverCount, setServerCount] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check URL parameters for email verification confirmation or admin mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      const verifiedName = params.get('name') || 'Your birthday';
      setToastMessage(`✓ ${verifiedName} has been verified and added to the Birthday Wall!`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('verificationError')) {
      const err = params.get('verificationError');
      setToastMessage(`Verification link is ${err === 'invalid_or_expired' ? 'invalid or expired' : 'unrecognized'}.`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('admin') === 'true') {
      setIsAdminOpen(true);
    }
  }, []);

  // Fetch verified data from backend API
  const loadBirthdays = async () => {
    const apiData = await fetchBirthdays();
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      setBirthdays(apiData);
    }
    const count = await fetchBirthdaysCount();
    if (count !== null) {
      setServerCount(count);
    }
  };

  useEffect(() => {
    loadBirthdays();
  }, []);

  // Calculate today's birthdays and upcoming birthdays sorted by days remaining
  const { todayList, upcomingList } = useMemo(() => {
    const today = [];
    const upcoming = [];

    birthdays.forEach((b) => {
      const dateStr = b.dob || b.date;
      const { isToday, days } = calculateDaysRemaining(dateStr);
      if (isToday) {
        today.push(b);
      } else {
        upcoming.push({ ...b, daysRemaining: days });
      }
    });

    upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return { todayList: today, upcomingList: upcoming };
  }, [birthdays]);

  // Display count (prioritizes verified server count, or initial baseline)
  const totalCount = serverCount !== null ? serverCount : (127 + (birthdays.length - INITIAL_BIRTHDAYS.length));

  const handleAddBirthday = async (formData) => {
    await registerBirthday(formData);
    loadBirthdays();
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-wall-dark relative flex flex-col selection:bg-wall-dark selection:text-white">
      {/* Crisp Architectural Grid Background */}
      <div className="fixed inset-0 bg-editorial-grid pointer-events-none z-0 opacity-80" />
      
      {/* Decorative Outer Grid Framing Borders */}
      <div className="fixed top-0 bottom-0 left-4 sm:left-12 w-[1px] bg-wall-border/70 pointer-events-none z-0 hidden md:block" />
      <div className="fixed top-0 bottom-0 right-4 sm:right-12 w-[1px] bg-wall-border/70 pointer-events-none z-0 hidden md:block" />

      {/* Main App Container */}
      <div className="relative z-10 flex-grow flex flex-col">
        {/* Navigation */}
        <Navbar 
          onOpenAddModal={() => setIsModalOpen(true)} 
          totalCount={totalCount} 
        />

        {/* Hero Section */}
        <main className="flex-grow">
          <Hero 
            totalCount={totalCount} 
            onOpenAddModal={() => setIsModalOpen(true)} 
          />

          {/* Today's Section (Subtly highlighted) */}
          <TodaySection todayBirthdays={todayList} />

          {/* Upcoming Editorial Birthday List */}
          <BirthdayList
            birthdays={upcomingList}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Footer Call to Action */}
          <FooterCta 
            onOpenAddModal={() => setIsModalOpen(true)} 
            onOpenAdminModal={() => setIsAdminOpen(true)}
          />
        </main>
      </div>

      {/* Add Birthday Modal */}
      <AddBirthdayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBirthday={handleAddBirthday}
      />

      {/* Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshPublicWall={loadBirthdays}
      />

      {/* Success Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-wall-dark text-white text-xs font-mono shadow-lg border border-neutral-700 max-w-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
