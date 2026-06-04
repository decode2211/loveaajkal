import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useCountdown } from '../../hooks/useCountdown';
import { Card } from '../../components/ui/Card';

interface CountdownWidgetProps {
  targetDate: string;
  label: string;
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  const formatted = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={formatted}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-3xl md:text-4xl text-text-primary bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 min-w-[60px] text-center"
      >
        {formatted}
      </motion.div>
      <span className="text-[10px] text-text-tertiary font-mono mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function CountdownWidget({ targetDate, label }: CountdownWidgetProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);
  const confettiRef = useRef(false);

  useEffect(() => {
    if (isExpired && !confettiRef.current) {
      confettiRef.current = true;
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#c9a96e', '#c47b7b', '#f5f0e8', '#7a9e7e'],
      });
    }
  }, [isExpired]);

  if (isExpired) {
    return (
      <Card glow="gold" className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          <p className="font-display text-4xl italic text-accent-gold mb-2">
            It's time! 🎉
          </p>
          <p className="text-text-secondary text-sm">{label}</p>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card glow="gold" className="p-6">
      <div className="text-center mb-4">
        <p className="text-xs text-text-tertiary font-mono uppercase tracking-wider">Counting down to</p>
        <p className="font-display text-lg italic text-text-secondary mt-0.5">{label}</p>
      </div>

      <div className="flex items-center justify-center gap-2 md:gap-3">
        <CountdownDigit value={days} label="days" />
        <span className="font-mono text-2xl text-text-tertiary mb-4">:</span>
        <CountdownDigit value={hours} label="hrs" />
        <span className="font-mono text-2xl text-text-tertiary mb-4">:</span>
        <CountdownDigit value={minutes} label="min" />
        <span className="font-mono text-2xl text-text-tertiary mb-4">:</span>
        <CountdownDigit value={seconds} label="sec" />
      </div>

      <motion.div
        className="mt-4 h-1 bg-border-subtle rounded-full overflow-hidden"
        aria-hidden
      >
        <motion.div
          className="h-full bg-accent-gold rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '40%' }}
        />
      </motion.div>
    </Card>
  );
}
