import { motion } from 'framer-motion';
import { Plane, Check, Trash2 } from 'lucide-react';
import { TripItem } from '@us-always/shared';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';

interface FlightDetailsProps {
  item: TripItem;
  onComplete: () => void;
  onDelete: () => void;
}

export function FlightDetails({ item, onComplete, onDelete }: FlightDetailsProps) {
  const meta = (item.metadata || {}) as Record<string, string>;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`relative rounded-2xl border overflow-hidden group transition-all ${
        item.completed ? 'border-accent-sage/30 opacity-70' : 'border-accent-sky/25 hover:border-accent-sky/40'
      }`}
    >
      {/* Top stripe */}
      <div className={`h-1 bg-gradient-to-r ${item.completed ? 'from-accent-sage/40 to-accent-sage' : 'from-accent-sky/40 via-accent-sky to-accent-sky/40'}`} />

      <div className="p-5 bg-gradient-to-br from-bg-elevated to-bg-surface">
        {/* Airline row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plane size={15} className={item.completed ? 'text-accent-sage' : 'text-accent-sky'} />
            <span className="text-xs font-medium text-text-secondary">{meta.airline || 'Airline TBD'}</span>
            {meta.flightNumber && <Badge variant="sky">{meta.flightNumber}</Badge>}
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onComplete}
              className={`p-1.5 rounded-lg transition-colors ${item.completed ? 'text-accent-sage' : 'text-text-tertiary hover:text-accent-sage'}`}
              aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              <Check size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-text-tertiary hover:text-accent-rose transition-colors"
              aria-label="Delete flight"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Flight route */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <p className="font-mono text-2xl text-text-primary">{meta.departure || '---'}</p>
            <p className="text-xs text-text-tertiary font-mono mt-0.5">{meta.departureTime || ''}</p>
          </div>

          <div className="flex-1 mx-4 flex flex-col items-center gap-1">
            <div className="w-full h-px bg-border-default relative">
              <Plane
                size={12}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                  item.completed ? 'text-accent-sage' : 'text-accent-sky'
                }`}
              />
            </div>
            <p className="text-[10px] text-text-tertiary font-mono">Non-stop</p>
          </div>

          <div className="text-center">
            <p className="font-mono text-2xl text-text-primary">{meta.arrival || '---'}</p>
            <p className="text-xs text-text-tertiary font-mono mt-0.5">{meta.arrivalTime || ''}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          {item.date ? (
            <p className="text-xs text-text-tertiary font-mono">{formatDate(item.date)}</p>
          ) : (
            <span />
          )}
          {meta.bookingRef && (
            <p className="text-xs text-text-tertiary">
              Ref: <span className="font-mono text-accent-gold">{meta.bookingRef}</span>
            </p>
          )}
        </div>

        {/* Completed overlay */}
        {item.completed && (
          <div className="absolute inset-0 bg-bg-surface/40 flex items-center justify-center rounded-2xl">
            <Badge variant="sage">✈️ Flight complete</Badge>
          </div>
        )}
      </div>
    </motion.div>
  );
}
