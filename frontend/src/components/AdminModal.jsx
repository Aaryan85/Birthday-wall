import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { verifyAdminPassword, fetchAllAdminBirthdays, deleteBirthdayByAdmin } from '../services/api';
import { formatBirthdayDisplay } from '../data/mockBirthdays';

export default function AdminModal({ isOpen, onClose, onRefreshPublicWall }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    setError('');
    setIsLoading(true);

    try {
      await verifyAdminPassword(password);
      setIsAuthenticated(true);
      const data = await fetchAllAdminBirthdays(password);
      setBirthdays(data || []);
    } catch (err) {
      setError(err.message || 'Incorrect admin password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the database?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteBirthdayByAdmin(id, password);
      setBirthdays((prev) => prev.filter((b) => b._id !== id));
      if (onRefreshPublicWall) onRefreshPublicWall();
    } catch (err) {
      alert(err.message || 'Failed to delete birthday');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClose = () => {
    setPassword('');
    setIsAuthenticated(false);
    setError('');
    setBirthdays([]);
    onClose();
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
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white border border-wall-border shadow-2xl p-6 sm:p-8 z-10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-5 border-b border-wall-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-wall-dark text-white flex items-center justify-center font-mono">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-wall-dark font-sans">
                  Admin Portal
                </h3>
                <p className="text-xs text-wall-muted font-mono">
                  Manage and delete spam or fake birthdays
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-wall-subtle hover:text-wall-dark hover:bg-wall-highlight border border-wall-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isAuthenticated ? (
            /* Password Verification Prompt */
            <form onSubmit={handleLogin} className="mt-6 space-y-4 py-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-medium text-wall-dark uppercase tracking-wider mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-wall-highlight/40 text-sm text-wall-dark px-3.5 py-2.5 border border-wall-border focus:outline-none focus:border-wall-dark transition-colors font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-wall-dark text-white hover:bg-black font-medium text-xs font-mono transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Unlock Portal →'}
                </button>
              </div>
            </form>
          ) : (
            /* Authenticated Admin Management Table */
            <div className="mt-4 flex-grow flex flex-col overflow-hidden">
              <div className="flex items-center justify-between py-2 text-xs font-mono text-wall-muted border-b border-wall-border">
                <span>Total entries in database: <strong>{birthdays.length}</strong></span>
                <span className="text-[11px] text-emerald-600 font-medium">● Authenticated</span>
              </div>

              {birthdays.length === 0 ? (
                <div className="py-12 text-center text-sm text-wall-muted font-mono">
                  No birthdays in database.
                </div>
              ) : (
                <div className="overflow-y-auto divide-y divide-wall-border my-2 pr-1">
                  {birthdays.map((item) => {
                    const { formatted } = formatBirthdayDisplay(item.dob);
                    return (
                      <div
                        key={item._id}
                        className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-wall-highlight/60 transition-colors"
                      >
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-wall-dark truncate font-sans">
                              {item.name}
                            </span>
                            <span className="text-xs font-mono text-wall-muted font-semibold">
                              ({formatted})
                            </span>
                            {item.emailVerified ? (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Verified
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-wall-subtle font-mono truncate">
                            {item.email}
                          </p>
                        </div>

                        {/* Delete Action */}
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          disabled={deletingId === item._id}
                          className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 transition-all flex-shrink-0 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-wall-border flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-mono text-wall-muted hover:text-wall-dark"
                >
                  Close Portal
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
