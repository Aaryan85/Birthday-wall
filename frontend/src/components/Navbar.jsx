import React from 'react';
import { Plus } from 'lucide-react';

export default function Navbar({ onOpenAddModal, totalCount }) {
  return (
    <header className="sticky top-0 z-30 bg-[#FBFBFA]/90 backdrop-blur-sm border-b border-wall-border transition-colors">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <a 
          href="#" 
          className="flex items-center gap-2 group text-wall-dark hover:opacity-80 transition-opacity"
        >
          <span className="font-bold text-base tracking-tight text-wall-dark font-sans">
            Birthday Wall
          </span>
        </a>

        {/* Action button */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-wall-dark bg-transparent hover:bg-wall-dark hover:text-white border border-wall-dark transition-all duration-150 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Your Birthday</span>
        </button>
      </div>
    </header>
  );
}
