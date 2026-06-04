import { motion } from 'framer-motion';
import { Sun, Moon, CloudSun, Sunset } from 'lucide-react';

interface WeatherIndicatorProps {
  timezone: string;
  city: string;
}

function getTimeOfDay(timezone: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    const hour = parseInt(formatter.format(new Date()), 10);
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  } catch {
    return 'morning';
  }
}

const config = {
  morning: {
    icon: Sun,
    label: 'Morning',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    animation: { rotate: [0, 15, -15, 0] },
  },
  afternoon: {
    icon: CloudSun,
    label: 'Afternoon',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    animation: { y: [0, -2, 0] },
  },
  evening: {
    icon: Sunset,
    label: 'Evening',
    color: 'text-accent-rose',
    bg: 'bg-accent-rose/10',
    animation: { opacity: [1, 0.7, 1] },
  },
  night: {
    icon: Moon,
    label: 'Night',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    animation: { rotate: [0, -8, 8, 0] },
  },
};

export function WeatherIndicator({ timezone, city }: WeatherIndicatorProps) {
  const tod = getTimeOfDay(timezone);
  const { icon: Icon, label, color, bg, animation } = config[tod];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bg} border border-border-subtle`}
      title={`It's ${label.toLowerCase()} in ${city}`}
    >
      <motion.div
        animate={animation}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon size={12} className={color} />
      </motion.div>
      <span className={`text-[10px] font-mono ${color}`}>{label}</span>
    </div>
  );
}
