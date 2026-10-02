import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AddBirthdayModal({ isOpen, onClose, onAddBirthday }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setDob('');
    setEmail('');
    setError('');
    setIsSubmitted(false);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!dob) {
      setError('Please select your birthday.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (onAddBirthday) {
        await onAddBirthday({
          name: name.trim(),
          dob,
          email: email.trim().toLowerCase(),
        });
      }
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white border border-wall-border shadow-xl p-6 sm:p-8 z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-5 border-b border-wall-border">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-wall-muted">
                Registration
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-wall-dark font-sans mt-0.5">
                Add to Birthday Wall
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-wall-subtle hover:text-wall-dark hover:bg-wall-highlight border border-wall-border transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSubmitted ? (
            /* Verification Sent State */
            <div className="mt-8 space-y-4 py-4">
              <div className="text-2xl font-bold tracking-tight text-wall-dark font-sans flex items-center gap-2">
                <span>✉️</span>
                <span>CHECK YOUR INBOX</span>
              </div>
              <p className="text-sm text-wall-muted leading-relaxed font-normal">
                We've sent a verification link to <strong className="text-wall-dark font-medium">{email}</strong>. Your birthday will appear on the Birthday Wall once you confirm it.
              </p>
              <div className="pt-6 border-t border-wall-border flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-wall-dark text-white hover:bg-black font-medium text-xs font-mono transition-all duration-150 active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Form with ONLY Name, Birthday Date, Email Address */
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                  {error}
                </div>
              )}

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-mono font-medium text-wall-dark uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-wall-highlight/40 text-sm text-wall-dark px-3.5 py-2.5 border border-wall-border focus:outline-none focus:border-wall-dark transition-colors"
                />
              </div>

              {/* 2. Birthday Date */}
              <div>
                <label className="block text-xs font-mono font-medium text-wall-dark uppercase tracking-wider mb-2">
                  Birthday Date *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full bg-wall-highlight/40 text-sm text-wall-dark px-3.5 py-2.5 border border-wall-border focus:outline-none focus:border-wall-dark transition-colors font-mono"
                />
              </div>

              {/* 3. Email Address */}
              <div>
                <label className="block text-xs font-mono font-medium text-wall-dark uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. rahul@example.com"
                  className="w-full bg-wall-highlight/40 text-sm text-wall-dark px-3.5 py-2.5 border border-wall-border focus:outline-none focus:border-wall-dark transition-colors font-mono"
                />
                <p className="mt-2 text-xs text-wall-muted font-mono">
                  We'll send a verification email to confirm your birthday.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-wall-border">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-mono text-wall-muted hover:text-wall-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-wall-dark text-white hover:bg-black font-medium text-xs font-mono transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Add My Birthday →'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
