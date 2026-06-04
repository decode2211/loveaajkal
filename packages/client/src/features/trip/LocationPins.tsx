import { motion } from 'framer-motion';
import { MapPin, Trash2, ExternalLink } from 'lucide-react';
import { TripItem } from '@us-always/shared';
import { Badge } from '../../components/ui/Badge';

interface LocationPinsProps {
  items: TripItem[];
  onDelete: (id: string) => void;
}

const categoryColor: Record<string, 'gold' | 'rose' | 'sage' | 'sky'> = {
  Food: 'sage',
  Activity: 'sky',
  Attraction: 'gold',
  Shopping: 'rose',
};

export function LocationPins({ items, onDelete }: LocationPinsProps) {
  if (items.length === 0) {
    return (
      <p className="text-text-tertiary text-sm text-center py-10">
        No places pinned yet — add somewhere to explore! 📍
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const meta = (item.metadata || {}) as Record<string, string>;
        const cat = meta.category || 'Other';
        const variant = categoryColor[cat] ?? 'gold';

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3 p-4 bg-bg-surface border border-border-subtle rounded-xl group hover:border-accent-gold/20 transition-all"
          >
            <div className="w-9 h-9 bg-accent-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={16} className="text-accent-gold" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-text-primary text-sm font-medium">{item.title}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {meta.address && (
                    <a
                      href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(meta.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-text-tertiary hover:text-accent-sky transition-colors"
                      aria-label="View on map"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-text-tertiary hover:text-accent-rose transition-colors"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {meta.address && (
                <p className="text-xs text-text-tertiary mt-0.5 truncate">{meta.address}</p>
              )}

              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant={variant} className="text-[10px]">{cat}</Badge>
                {item.description && (
                  <p className="text-xs text-text-tertiary italic truncate">{item.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
