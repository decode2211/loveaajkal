import { motion } from 'framer-motion';

interface MeterSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function MeterSlider({ value, onChange }: MeterSliderProps) {
  // Color stops: cool blue → warm gold → rose → red
  const getTrackColor = (v: number) => {
    if (v <= 25) return 'from-accent-sky/40 to-accent-sky';
    if (v <= 50) return 'from-accent-sky to-accent-gold';
    if (v <= 75) return 'from-accent-gold to-accent-rose';
    return 'from-accent-rose to-red-500';
  };

  return (
    <div className="w-full">
      {/* Value display */}
      <div className="text-center mb-3">
        <motion.p
          key={value}
          className="font-mono text-5xl text-text-primary"
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {value}
        </motion.p>
        <p className="text-text-tertiary text-xs font-mono">/ 100</p>
      </div>

      {/* Track */}
      <div className="relative mb-2">
        <div className="h-3 bg-border-subtle rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${getTrackColor(value)}`}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.12 }}
          />
        </div>
        {/* Hidden native input for accessibility & dragging */}
        <input
          type="range"
          min={1}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
          aria-label="Miss meter level — drag to set how much you're missing them"
          aria-valuemin={1}
          aria-valuemax={100}
          aria-valuenow={value}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[10px] text-text-tertiary font-mono px-0.5">
        <span>A little</span>
        <span>A lot</span>
        <span>SOS 🚨</span>
      </div>
    </div>
  );
}
