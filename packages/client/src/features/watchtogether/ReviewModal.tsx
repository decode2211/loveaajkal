import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { WatchlistItem } from '@us-always/shared';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';

interface ReviewModalProps {
  item: WatchlistItem | null;
  onClose: () => void;
}

function HeartRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="group" aria-label="Heart rating">
      {[1, 2, 3, 4, 5].map((r) => (
        <button
          key={r}
          onClick={() => onRate(r)}
          onMouseEnter={() => setHovered(r)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Rate ${r} heart${r !== 1 ? 's' : ''}`}
          className="transition-transform hover:scale-125 active:scale-110"
        >
          <motion.span
            className="text-2xl block"
            animate={{ scale: r <= (hovered || rating) ? 1 : 0.85 }}
            transition={{ duration: 0.15 }}
            style={{
              filter: r <= (hovered || rating) ? 'none' : 'grayscale(1) opacity(0.25)',
            }}
          >
            ❤️
          </motion.span>
        </button>
      ))}
    </div>
  );
}

export function ReviewModal({ item, onClose }: ReviewModalProps) {
  const qc = useQueryClient();
  const [heartRating, setHeartRating] = useState(3);
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/watchlist/${item!.id}/review`, {
        heartRating,
        comment: comment.trim() || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Review saved 💛');
      onClose();
    },
    onError: () => toast.error('Failed to save review'),
  });

  if (!item) return null;

  return (
    <Modal open={!!item} onClose={onClose} title={`Review: ${item.title}`} size="sm">
      <div className="space-y-5">
        {/* Your rating */}
        <div>
          <p className="text-xs text-text-secondary font-mono mb-2">Your rating</p>
          <HeartRating rating={heartRating} onRate={setHeartRating} />
        </div>

        {/* Comment */}
        <div>
          <p className="text-xs text-text-secondary font-mono mb-1">What did you think?</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Write a short reaction..."
            className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-gold resize-none"
          />
        </div>

        {/* Existing reviews */}
        {item.reviews.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-text-tertiary font-mono">Previous reviews</p>
            {item.reviews.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-3 bg-bg-base rounded-xl border border-border-subtle">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-text-secondary">{r.user.displayName}</p>
                    <span className="text-xs">{'❤️'.repeat(r.heartRating)}</span>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-text-tertiary italic">"{r.comment}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={() => submitMutation.mutate()}
          loading={submitMutation.isPending}
          className="w-full justify-center"
        >
          Save Review
        </Button>
      </div>
    </Modal>
  );
}
