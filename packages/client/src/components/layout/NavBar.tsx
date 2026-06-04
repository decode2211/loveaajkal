import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Lightbulb, ScrollText, Globe, Shuffle, Heart, Tv2, Plane, MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/quiz', label: 'Daily Spark', icon: Lightbulb },
  { path: '/timeline', label: 'Our Codex', icon: ScrollText },
  { path: '/distance', label: 'Distance', icon: Globe },
  { path: '/this-or-that', label: 'This or That', icon: Shuffle },
  { path: '/miss-meter', label: 'Miss Meter', icon: Heart },
  { path: '/watch', label: 'Watch Together', icon: Tv2 },
  { path: '/trip', label: 'Trip', icon: Plane },
];

const primaryNav = navItems.slice(0, 4);
const secondaryNav = navItems.slice(4);

export function NavBar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-60 min-h-screen bg-bg-surface border-r border-border-subtle py-8 px-4 fixed left-0 top-0 z-40">
        <div className="mb-8 px-2">
          <h1 className="font-display text-2xl italic text-accent-gold">Us, Always</h1>
          {user && (
            <div className="flex items-center gap-2 mt-4">
              <Avatar name={user.displayName} src={user.avatarUrl} size="sm" />
              <span className="text-xs text-text-secondary">{user.displayName}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} />
                  <span className={isActive ? 'font-medium' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border-subtle">
        <div className="flex items-center justify-around px-2 py-2">
          {primaryNav.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl"
                aria-label={label}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-accent-gold' : 'text-text-tertiary'}
                />
                <span className={`text-[10px] font-mono ${isActive ? 'text-accent-gold' : 'text-text-tertiary'}`}>
                  {label.split(' ')[0]}
                </span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5"
            aria-label="More navigation options"
          >
            <MoreHorizontal size={20} className="text-text-tertiary" />
            <span className="text-[10px] font-mono text-text-tertiary">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile more drawer */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-bg-elevated border-t border-border-default rounded-t-2xl p-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-lg text-text-primary">More</span>
                <button onClick={() => setMoreOpen(false)} aria-label="Close more menu">
                  <X size={18} className="text-text-tertiary" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {secondaryNav.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary"
                  >
                    <Icon size={18} />
                    <span className="text-sm">{label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
