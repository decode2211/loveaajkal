import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TripItem } from '@us-always/shared';

interface PackingChecklistProps {
  items: TripItem[];
  myId?: string;
  onComplete: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

const PACKING_CATEGORIES = ['Clothes', 'Electronics', 'Documents', 'Toiletries', 'Other'] as const;

function ChecklistColumn({
  label,
  items,
  onComplete,
  onDelete,
}: {
  label: string;
  items: TripItem[];
  onComplete: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div>
        <p className="text-xs text-text-tertiary font-mono mb-3">{label}</p>
        <p className="text-xs text-text-tertiary italic pl-1">Nothing added yet</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-text-tertiary font-mono mb-3">{label}</p>
      {PACKING_CATEGORIES.map((cat) => {
        const catItems = items.filter((i) => {
          const m = (i.metadata || {}) as Record<string, string>;
          return (m.packingCategory || 'Other') === cat;
        });
        if (!catItems.length) return null;

        return (
          <div key={cat} className="mb-4">
            <p className="text-[10px] text-text-tertiary italic mb-1.5 font-mono uppercase tracking-wider">
              {cat}
            </p>
            <div className="space-y-1">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 py-1.5 group hover:bg-bg-hover/40 rounded-lg px-1 transition-colors"
                >
                  <button
                    onClick={() => onComplete(item.id, item.completed)}
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-accent-sage border-accent-sage'
                        : 'border-border-default hover:border-accent-sage'
                    }`}
                    aria-label={item.completed ? 'Unpack' : 'Mark as packed'}
                  >
                    {item.completed && <Check size={8} className="text-bg-base" strokeWidth={3} />}
                  </button>
                  <span
                    className={`text-sm flex-1 transition-all ${
                      item.completed ? 'line-through text-text-tertiary' : 'text-text-secondary'
                    }`}
                  >
                    {item.title}
                  </span>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-0.5 opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent-rose transition-all"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PackingChecklist({ items, myId, onComplete, onDelete }: PackingChecklistProps) {
  const myItems = items.filter((i) => i.addedById === myId);
  const theirItems = items.filter((i) => i.addedById !== myId);
  const packed = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

  // Celebrate when all packed
  useEffect(() => {
    if (total > 0 && packed === total) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#c9a96e', '#7a9e7e', '#f5f0e8', '#c47b7b'],
      });
    }
  }, [packed, total]);

  if (total === 0) {
    return (
      <p className="text-text-tertiary text-sm text-center py-10">
        Nothing to pack yet — start adding items! 🎒
      </p>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-text-tertiary font-mono mb-1.5">
          <span>{packed}/{total} packed</span>
          <span className={pct === 100 ? 'text-accent-sage' : ''}>{pct}%</span>
        </div>
        <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: pct === 100
                ? 'var(--accent-sage)'
                : 'linear-gradient(to right, var(--accent-gold), var(--accent-sage))',
            }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        {pct === 100 && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-accent-sage text-center mt-1.5"
          >
            All packed! Ready to go 🎉
          </motion.p>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChecklistColumn
          label="I Pack"
          items={myItems}
          onComplete={onComplete}
          onDelete={onDelete}
        />
        <ChecklistColumn
          label="They Pack"
          items={theirItems}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
