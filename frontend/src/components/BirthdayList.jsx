import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Plus } from 'lucide-react';
import { formatBirthdayDisplay, calculateDaysRemaining } from '../data/mockBirthdays';

export default function BirthdayList({
  birthdays = [],
  isLoading = false,
  searchQuery = '',
  setSearchQuery,
  onOpenAddModal,
}) {
  const [slowLoadMessage, setSlowLoadMessage] = useState(false);

  // If server takes longer than 4s to respond (Render cold start)
  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setSlowLoadMessage(true);
      }, 3500);
    } else {
      setSlowLoadMessage(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const filtered = birthdays.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return b.name.toLowerCase().includes(q);
  });

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-wall-border">
          <div>
            <h2 className="text-xs font-mono font-bold tracking-widest text-wall-dark uppercase">
              UPCOMING BIRTHDAYS
            </h2>
            <p className="text-sm text-wall-muted mt-1">
              Chronologically ordered celebrants for the coming months
            </p>
          </div>

          {/* Search Input */}
          {!isLoading && birthdays.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-wall-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full bg-white text-sm text-wall-dark placeholder:text-wall-subtle pl-9 pr-8 py-2 border border-wall-border focus:outline-none focus:border-wall-dark transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-wall-subtle hover:text-wall-dark"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 1. LOADING SKELETON STATE */}
        {isLoading ? (
          <div className="divide-y divide-wall-border border-b border-wall-border">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="py-6 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse"
              >
                <div className="flex items-start gap-6">
                  <span className="font-mono text-xs text-wall-subtle pt-0.5 w-6">
                    0{n}
                  </span>
                  <div className="space-y-2">
                    <div className="h-5 bg-neutral-200/80 w-44 sm:w-56 rounded-none" />
                    <div className="h-3 bg-neutral-200/50 w-24 rounded-none" />
                  </div>
                </div>
                <div className="pl-10 sm:pl-0 flex flex-col sm:items-end gap-1.5">
                  <div className="h-4 bg-neutral-200/80 w-16 rounded-none" />
                  <div className="h-3 bg-neutral-200/50 w-20 rounded-none hidden sm:block" />
                </div>
              </div>
            ))}

            {/* Server Wakeup Notification */}
            <div className="py-6 flex items-center justify-center gap-2.5 text-xs font-mono text-wall-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {slowLoadMessage
                  ? 'Waking up cloud server... Please wait a moment.'
                  : 'Connecting to live Birthday Wall...'}
              </span>
            </div>
          </div>
        ) : birthdays.length === 0 ? (
          /* 2. EMPTY WALL STATE (No birthdays registered yet) */
          <div className="py-20 text-center border-b border-wall-border space-y-4">
            <span className="text-3xl select-none">🎈</span>
            <h3 className="text-lg font-bold text-wall-dark tracking-tight font-sans">
              No birthdays on the wall yet
            </h3>
            <p className="text-sm text-wall-muted max-w-sm mx-auto font-normal">
              Be the very first person to add your birthday to the public wall!
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-wall-dark text-white hover:bg-black font-medium text-xs font-mono transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your Birthday</span>
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* 3. NO SEARCH RESULTS */
          <div className="py-20 text-center border-b border-wall-border">
            <p className="text-base text-wall-muted font-normal">
              No birthdays found matching "<span className="text-wall-dark font-medium">{searchQuery}</span>"
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-xs font-mono text-wall-dark underline underline-offset-4 hover:opacity-75"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : (
          /* 4. LIVE BIRTHDAYS LIST */
          <div className="divide-y divide-wall-border border-b border-wall-border">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, index) => {
                const { formatted, fullFormatted } = formatBirthdayDisplay(item.dob || item.date);
                const { days, label } = calculateDaysRemaining(item.dob || item.date);
                const indexFormatted = String(index + 1).padStart(2, '0');

                return (
                  <motion.div
                    key={item._id || item.id || item.name + index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                    className="group py-5 sm:py-6 px-2 sm:px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-wall-highlight/50 transition-colors"
                  >
                    {/* Left: Index & Person Details */}
                    <div className="flex items-start gap-4 sm:gap-6">
                      <span className="font-mono text-xs sm:text-sm font-normal text-wall-subtle pt-0.5 w-6 flex-shrink-0 select-none">
                        {indexFormatted}
                      </span>

                      <div>
                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-wall-dark font-sans group-hover:underline underline-offset-4 decoration-1">
                          {item.name}
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-mono text-wall-muted">
                            {label || `${days} days to go`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Date representation (e.g. OCT 05) */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between pl-10 sm:pl-0">
                      <span className="font-mono text-sm sm:text-base font-semibold text-wall-dark tracking-wide uppercase">
                        {formatted}
                      </span>
                      <span className="text-[11px] text-wall-subtle font-mono hidden sm:inline">
                        {fullFormatted}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
