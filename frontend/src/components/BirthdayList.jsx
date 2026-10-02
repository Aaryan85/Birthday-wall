import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { formatBirthdayDisplay, calculateDaysRemaining } from '../data/mockBirthdays';

export default function BirthdayList({
  birthdays = [],
  searchQuery = '',
  setSearchQuery,
}) {
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
        </div>

        {/* Editorial Birthday List */}
        {filtered.length === 0 ? (
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
