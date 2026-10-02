import React from 'react';
import { Plus, Shield } from 'lucide-react';

export default function FooterCta({ onOpenAddModal, onOpenAdminModal }) {
  return (
    <footer className="py-24 border-t border-wall-border bg-wall-highlight/40">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-5">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-wall-dark font-sans">
          Don’t see your birthday?
        </h2>
        <p className="text-base text-wall-muted font-normal max-w-md mx-auto">
          Add yourself to the wall and let everyone remember your special day.
        </p>
        <div className="pt-3">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-wall-dark text-white hover:bg-black font-medium text-sm transition-all duration-150 active:scale-[0.99] shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add My Birthday</span>
          </button>
        </div>

        <div className="pt-12 border-t border-wall-border/60 mt-16 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-wall-subtle gap-4">
          <span>Birthday Wall © {new Date().getFullYear()}</span>
          <span>Made with ❤️ by Aaryan Yadav</span>
          <button
            onClick={onOpenAdminModal}
            className="hover:text-wall-dark flex items-center gap-1 transition-colors underline underline-offset-2"
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
