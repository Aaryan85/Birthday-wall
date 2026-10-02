import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function Hero({ totalCount = 127, onOpenAddModal }) {
  return (
    <section className="pt-16 pb-16 border-b border-wall-border">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Main Editorial Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-wall-dark leading-[1.08] font-sans">
            Never miss a <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-wall-dark select-none">
              birthday.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-wall-muted max-w-xl font-normal leading-relaxed">
            A public birthday wall for the people you don't want to forget.
          </p>

          {/* Prominent Counter & CTA Action */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            {/* Visually prominent counter */}
            <div className="flex items-center gap-3 py-2 px-3.5 bg-wall-highlight border border-wall-border self-start sm:self-auto">
              <span className="text-xl select-none" role="img" aria-label="Birthday cake">
                🎂
              </span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-bold text-wall-dark tracking-tight">
                  {totalCount}
                </span>
                <span className="text-xs uppercase tracking-wider text-wall-muted font-medium font-sans">
                  birthdays registered
                </span>
              </div>
            </div>

            {/* Primary Add Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-wall-dark text-white hover:bg-black font-medium text-sm transition-all duration-150 active:scale-[0.99] self-start sm:self-auto shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Your Birthday</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
