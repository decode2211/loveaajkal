import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, ChevronDown } from 'lucide-react';
import { TripItem } from '@us-always/shared';
import { formatDate } from '../../lib/utils';

interface DailyAgendaProps {
  items: TripItem[];
  onComplete: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

function AgendaDay({
  date,
  dayItems,
  onComplete,
  onDelete,
}: {
  date: string;
  dayItems: TripItem[];
  onComplete: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const doneCount = dayItems.filter((i) => i.completed).length;

  return (
    <div className="border border-border-subtle rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-surface hover:bg-bg-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-secondary">{formatDate(date)}</span>
          <span className="text-xs text-text-tertiary font-mono">
            {doneCount}/{dayItems.length} done
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-text-tertiary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {dayItems.map((item) => {
              const meta = (item.metadata || {}) as Record<string, string>;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-t border-border-subtle group hover:bg-bg-hover/50 transition-colors"
                >
                  <button
                    onClick={() => onComplete(item.id, item.completed)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-accent-sage border-accent-sage'
                        : 'border-border-default hover:border-accent-sage'
                    }`}
                    aria-label={item.completed ? 'Mark as not done' : 'Mark as done'}
                  >
                    {item.completed && <Check size={10} className="text-bg-base" strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm transition-all ${
                        item.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                      }`}
                    >
                      {item.title}
                    </p>
                    {meta.time && (
                      <p className="text-[10px] text-text-tertiary font-mono mt-0.5">{meta.time}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent-rose transition-all"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DailyAgenda({ items, onComplete, onDelete }: DailyAgendaProps) {
  if (items.length === 0) {
    return (
      <p className="text-text-tertiary text-sm text-center py-10">
        No agenda items yet — plan your days! 📅
      </p>
    );
  }

  // Group items by day
  const dayMap = new Map<string, TripItem[]>();
  items.forEach((item) => {
    const meta = (item.metadata || {}) as Record<string, string>;
    const day = meta.day || item.date?.split('T')[0] || 'Unscheduled';
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day)!.push(item);
  });

  const sortedDays = Array.from(dayMap.keys()).sort((a, b) => {
    if (a === 'Unscheduled') return 1;
    if (b === 'Unscheduled') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-3">
      {sortedDays.map((day) => (
        <AgendaDay
          key={day}
          date={day}
          dayItems={dayMap.get(day)!}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
