import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface DistanceDisplayProps {
  km: number;
  miles: number;
  unit: 'km' | 'miles';
  onToggleUnit: (unit: 'km' | 'miles') => void;
  city1: string;
  city2: string;
}

export function DistanceDisplay({ km, miles, unit, onToggleUnit, city1, city2 }: DistanceDisplayProps) {
  const displayValue = unit === 'km' ? km : miles;

  return (
    <div className="text-center">
      {/* Two-location signal animation */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative">
            <MapPin size={20} className="text-accent-gold" />
            <motion.div
              className="absolute -inset-2.5 rounded-full border border-accent-gold/30"
              animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs text-text-tertiary max-w-[80px] text-center leading-tight">{city1}</span>
        </div>

        {/* Animated pulse line */}
        <div className="flex-1 relative h-0.5 bg-border-subtle rounded-full max-w-32 mx-1">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent-gold shadow-gold"
            animate={{ left: ['0%', '100%', '0%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="h-full bg-gradient-to-r from-accent-gold/20 via-accent-gold/50 to-accent-gold/20 rounded-full" />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="relative">
            <MapPin size={20} className="text-accent-rose" />
            <motion.div
              className="absolute -inset-2.5 rounded-full border border-accent-rose/30"
              animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
            />
          </div>
          <span className="text-xs text-text-tertiary max-w-[80px] text-center leading-tight">{city2}</span>
        </div>
      </div>

      {/* Large distance number */}
      <motion.div
        key={unit}
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-3"
      >
        <p className="font-mono text-7xl md:text-8xl text-text-primary tracking-tight animate-pulse-gold">
          {displayValue.toLocaleString()}
        </p>
      </motion.div>

      {/* Unit toggle */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {(['km', 'miles'] as const).map((u) => (
          <button
            key={u}
            onClick={() => onToggleUnit(u)}
            className={`text-sm font-mono px-3 py-1 rounded-lg border transition-all duration-200 ${
              unit === u
                ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/30'
                : 'text-text-tertiary border-transparent hover:text-text-secondary'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <p className="text-text-tertiary text-sm">between us, right now</p>
    </div>
  );
}
