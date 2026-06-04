import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TimelineEvent } from '@us-always/shared';
import { formatDate } from '../../lib/utils';

interface TimelineNodeProps {
  event: TimelineEvent;
  index: number;
  onClick: () => void;
}

export function TimelineNode({ event, index, onClick }: TimelineNodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = index % 2 === 0;

  return (
    <div ref={ref} className="relative flex items-center mb-12">
      {/* Desktop spine dot */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-bg-elevated border-2 border-accent-gold z-10 hidden md:flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: index * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-accent-gold"
          animate={isInView ? { scale: [1, 1.4, 1] } : {}}
          transition={{ delay: index * 0.08 + 0.3, duration: 0.6 }}
        />
      </motion.div>

      {/* Mobile spine dot */}
      <motion.div
        className="absolute left-[18px] -translate-x-1/2 w-4 h-4 rounded-full bg-bg-elevated border-2 border-accent-gold z-10 md:hidden"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.08, type: 'spring' }}
      />

      {/* Desktop card — alternating sides */}
      <motion.div
        className={`w-5/12 hidden md:block ${isLeft ? 'mr-auto pr-8 text-right' : 'ml-auto pl-8 text-left'}`}
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -2 }}
        style={{ cursor: 'pointer' }}
      >
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 hover:border-accent-gold/30 hover:shadow-gold transition-all duration-200">
          <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'justify-end' : 'justify-start'}`}>
            <span className="text-2xl">{event.emoji}</span>
            <span className="text-xs text-text-tertiary font-mono">{formatDate(event.date)}</span>
          </div>
          <h3 className="font-display text-lg italic text-text-primary mb-1">{event.title}</h3>
          <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed">{event.description}</p>
          {event.photos.length > 0 && (
            <div className={`flex gap-1 mt-3 ${isLeft ? 'justify-end' : 'justify-start'}`}>
              {event.photos.slice(0, 3).map((p) => (
                <img key={p.id} src={p.url} alt="" className="w-8 h-8 rounded-lg object-cover ring-1 ring-border-default" />
              ))}
              {event.photos.length > 3 && (
                <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-default flex items-center justify-center text-[10px] text-text-tertiary font-mono">
                  +{event.photos.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile card */}
      <motion.div
        className="w-full pl-10 md:hidden cursor-pointer"
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, delay: index * 0.07 }}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
      >
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 hover:border-accent-gold/30 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{event.emoji}</span>
            <span className="text-xs text-text-tertiary font-mono">{formatDate(event.date)}</span>
          </div>
          <h3 className="font-display text-base italic text-text-primary">{event.title}</h3>
          <p className="text-text-secondary text-xs mt-1 line-clamp-2">{event.description}</p>
          {event.photos.length > 0 && (
            <div className="flex gap-1 mt-2">
              {event.photos.slice(0, 3).map((p) => (
                <img key={p.id} src={p.url} alt="" className="w-7 h-7 rounded object-cover" />
              ))}
              {event.photos.length > 3 && (
                <div className="w-7 h-7 rounded bg-bg-elevated flex items-center justify-center text-[10px] text-text-tertiary">
                  +{event.photos.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
