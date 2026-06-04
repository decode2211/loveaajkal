import { Film, Check, Trash2, Star } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WatchlistItem as WatchlistItemType } from '@us-always/shared';
import { Badge } from '../../components/ui/Badge';

interface WatchlistItemProps {
  item: WatchlistItemType;
  onMarkWatched: () => void;
  onReview: () => void;
  onDelete: () => void;
}

const badgeVariant = (t: string): 'gold' | 'rose' | 'sage' | 'sky' => {
  const m: Record<string, 'gold' | 'rose' | 'sage' | 'sky'> = {
    MOVIE: 'gold',
    SHOW: 'sky',
    ANIME: 'rose',
    DOCUMENTARY: 'sage',
  };
  return m[t] ?? 'gold';
};

export function WatchlistItemRow({ item, onMarkWatched, onReview, onDelete }: WatchlistItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-bg-surface border border-border-subtle rounded-xl hover:border-border-default transition-all group"
    >
      {/* Drag handle */}
      <div
        className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary touch-none flex-shrink-0"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
          <circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" />
        </svg>
      </div>

      {/* Poster */}
      {item.posterUrl ? (
        <img
          src={item.posterUrl}
          alt={item.title}
          className="w-10 h-14 object-cover rounded-lg flex-shrink-0 ring-1 ring-border-default"
        />
      ) : (
        <div className="w-10 h-14 bg-bg-elevated rounded-lg flex items-center justify-center flex-shrink-0 border border-border-subtle">
          <Film size={16} className="text-text-tertiary" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{item.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={badgeVariant(item.type)}>{item.type}</Badge>
          <span className="text-xs text-text-tertiary font-mono">
            Added by {item.addedBy.displayName}
          </span>
        </div>
        {/* Review hearts preview */}
        {item.reviews.length > 0 && (
          <div className="flex gap-2 mt-1">
            {item.reviews.map((r) => (
              <span key={r.id} className="text-xs text-text-tertiary">
                {'❤️'.repeat(r.heartRating)} {r.user.displayName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={onReview}
          className="p-1.5 text-text-tertiary hover:text-accent-gold rounded-lg transition-colors"
          aria-label={`Review ${item.title}`}
        >
          <Star size={14} />
        </button>
        <button
          onClick={onMarkWatched}
          className="p-1.5 text-text-tertiary hover:text-accent-sage rounded-lg transition-colors"
          aria-label={`Mark ${item.title} as watched`}
        >
          <Check size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-text-tertiary hover:text-accent-rose rounded-lg transition-colors"
          aria-label={`Delete ${item.title}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
