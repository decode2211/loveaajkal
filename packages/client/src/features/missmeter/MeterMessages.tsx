import { motion } from 'framer-motion';

interface MeterMessagesProps {
  level: number;
}

interface Tier {
  min: number;
  max: number;
  emoji: string;
  text: string;
  heartAnimation: object;
  bgClass: string;
}

const tiers: Tier[] = [
  {
    min: 1, max: 20,
    emoji: '😌',
    text: 'Just a little... (but I still checked)',
    heartAnimation: { scale: [1, 1.03, 1] },
    bgClass: 'bg-accent-sky/10 border-accent-sky/20',
  },
  {
    min: 21, max: 40,
    emoji: '🙈',
    text: 'More than I want to admit honestly',
    heartAnimation: { scale: [1, 1.06, 1], rotate: [0, -3, 3, 0] },
    bgClass: 'bg-accent-sky/10 border-accent-sky/20',
  },
  {
    min: 41, max: 60,
    emoji: '💭',
    text: 'Like, a lot. Genuinely.',
    heartAnimation: { scale: [1, 1.1, 1] },
    bgClass: 'bg-accent-gold/10 border-accent-gold/20',
  },
  {
    min: 61, max: 80,
    emoji: '😭',
    text: 'Send help. Immediately.',
    heartAnimation: { scale: [1, 1.15, 1], y: [0, -3, 0] },
    bgClass: 'bg-accent-rose/10 border-accent-rose/20',
  },
  {
    min: 81, max: 99,
    emoji: '💔',
    text: "I'm not okay and that's your fault",
    heartAnimation: { scale: [1, 1.2, 0.95, 1.2, 1], rotate: [0, -5, 5, -5, 0] },
    bgClass: 'bg-accent-rose/15 border-accent-rose/30',
  },
  {
    min: 100, max: 100,
    emoji: '🚨',
    text: 'MAXIMUM MISSING CAPACITY REACHED',
    heartAnimation: { scale: [1, 1.3, 0.9, 1.3, 1], rotate: [0, 10, -10, 10, 0] },
    bgClass: 'bg-red-500/10 border-red-500/30',
  },
];

function getTier(level: number): Tier {
  return tiers.find((t) => level >= t.min && level <= t.max) ?? tiers[0];
}

function getHeartSpeed(level: number): number {
  if (level <= 20) return 2.5;
  if (level <= 40) return 2;
  if (level <= 60) return 1.5;
  if (level <= 80) return 1;
  return 0.5;
}

export function MeterMessages({ level }: MeterMessagesProps) {
  const tier = getTier(level);
  const speed = getHeartSpeed(level);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Animated heart */}
      <motion.div
        animate={tier.heartAnimation}
        transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl select-none"
        style={{ filter: `hue-rotate(${Math.round((level / 100) * 30)}deg)` }}
        aria-hidden
      >
        ❤️
      </motion.div>

      {/* Message card */}
      <motion.div
        key={tier.min}
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full rounded-xl border p-4 text-center ${tier.bgClass}`}
      >
        <span className="text-2xl block mb-1">{tier.emoji}</span>
        <p className={`text-sm italic font-display ${level >= 100 ? 'text-base font-semibold' : ''} text-text-secondary`}>
          {tier.text}
        </p>
      </motion.div>
    </div>
  );
}
