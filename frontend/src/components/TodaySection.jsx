import React from 'react';
import { motion } from 'framer-motion';
import { formatBirthdayDisplay } from '../data/mockBirthdays';

export default function TodaySection({ todayBirthdays = [] }) {
  if (!todayBirthdays || todayBirthdays.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-b border-wall-border bg-wall-todayBg/60">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-wall-dark animate-pulse" />
            <h2 className="text-xs font-mono font-bold tracking-widest text-wall-dark uppercase">
              TODAY
            </h2>
          </div>
          <span className="text-xs font-mono text-wall-muted">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
          </span>
        </div>

        {/* Highlighted Today Celebrants List */}
        <div className="divide-y divide-wall-border border-y border-wall-border bg-white">
          {todayBirthdays.map((person, idx) => {
            const { fullFormatted } = formatBirthdayDisplay(person.dob || person.date);
            return (
              <motion.div
                key={person._id || person.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="py-5 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-wall-highlight/60 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-wall-dark text-white flex items-center justify-center font-mono font-medium text-sm flex-shrink-0">
                    {person.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-wall-dark tracking-tight">
                        {person.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 bg-wall-dark text-white uppercase tracking-wider">
                        Celebrating today!
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center pl-14 sm:pl-0">
                  <span className="text-xs font-mono text-wall-muted">
                    {fullFormatted}
                  </span>
                  <span className="text-base select-none">🎉</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
