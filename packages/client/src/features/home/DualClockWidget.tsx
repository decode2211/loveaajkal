import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Card } from '../../components/ui/Card';
import { WeatherIndicator } from './WeatherIndicator';

interface ClockProps {
  name: string;
  city: string;
  timezone: string;
  isMe?: boolean;
}

function Clock({ name, city, timezone, isMe }: ClockProps) {
  const [time, setTime] = useState(() => toZonedTime(new Date(), timezone));
  const [prevTime, setPrevTime] = useState('');
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = toZonedTime(new Date(), timezone);
      const newTimeStr = format(now, 'HH:mm:ss');
      if (newTimeStr !== prevTime) {
        setFlipping(true);
        setTimeout(() => setFlipping(false), 300);
        setPrevTime(newTimeStr);
      }
      setTime(now);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timezone, prevTime]);

  const hour = time.getHours();
  const isDay = hour >= 6 && hour < 20;
  const timeStr = format(time, 'HH:mm');
  const secStr = format(time, 'ss');
  const dateStr = format(time, 'EEE, MMM d');

  return (
    <Card className="p-5 flex-1">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-text-tertiary font-mono mb-0.5">{isMe ? 'Me' : 'You'}</p>
          <p className="text-sm font-medium text-text-secondary">{name}</p>
          <p className="text-xs text-text-tertiary">{city}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${isDay ? 'bg-yellow-500/10' : 'bg-indigo-500/10'}`}>
          {isDay ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-indigo-400" />
          )}
        </div>
      </div>

      <div className="mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={flipping ? 'flip' : 'stable'}
            className={flipping ? 'digit-flip' : ''}
          >
            <p className="font-mono text-3xl text-text-primary tracking-tight">
              {timeStr}
              <span className="text-text-tertiary text-xl">:{secStr}</span>
            </p>
          </motion.div>
        </AnimatePresence>
        <p className="text-xs text-text-tertiary font-mono mt-1">{dateStr}</p>
        <div className="mt-2">
          <WeatherIndicator timezone={timezone} city={city} />
        </div>
      </div>
    </Card>
  );
}

interface DualClockWidgetProps {
  person1: { displayName: string; city: string; timezone: string };
  person2: { displayName: string; city: string; timezone: string };
  myId?: string;
  person1Id?: string;
}

export function DualClockWidget({ person1, person2 }: DualClockWidgetProps) {
  return (
    <div>
      <h2 className="font-display text-xl italic text-text-secondary mb-3">Right now</h2>
      <div className="flex gap-3 flex-col sm:flex-row">
        <Clock name={person1.displayName} city={person1.city} timezone={person1.timezone} isMe />
        <Clock name={person2.displayName} city={person2.city} timezone={person2.timezone} />
      </div>
    </div>
  );
}
