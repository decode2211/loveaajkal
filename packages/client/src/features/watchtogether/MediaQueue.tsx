import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { WatchlistItem } from '@us-always/shared';
import { WatchlistItemRow } from './WatchlistItem';
import api from '../../lib/api';

type MediaFilter = 'ALL' | 'MOVIE' | 'SHOW' | 'ANIME' | 'DOCUMENTARY';

interface MediaQueueProps {
  items: WatchlistItem[];
  filter: MediaFilter;
  onReview: (item: WatchlistItem) => void;
}

export function MediaQueue({ items, filter, onReview }: MediaQueueProps) {
  const qc = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const markWatched = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/watchlist/${id}`, { watched: true });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
    onError: () => toast.error('Failed to update'),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/watchlist/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
    onError: () => toast.error('Failed to delete'),
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    // Optimistic update
    qc.setQueryData<WatchlistItem[]>(['watchlist'], (old) => {
      if (!old) return old;
      const watched = old.filter((i) => i.watched);
      return [...reordered, ...watched];
    });

    // Persist new order
    await Promise.all(
      reordered.map((item, idx) =>
        api.put(`/watchlist/${item.id}`, { order: idx }),
      ),
    );
    qc.invalidateQueries({ queryKey: ['watchlist'] });
  };

  const filtered = filter === 'ALL' ? items : items.filter((i) => i.type === filter);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-text-tertiary text-sm">
        {filter === 'ALL'
          ? 'Queue is empty — add something to watch! 🎬'
          : `No ${filter.toLowerCase()}s in queue yet`}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={filtered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {filtered.map((item) => (
            <WatchlistItemRow
              key={item.id}
              item={item}
              onMarkWatched={() => markWatched.mutate(item.id)}
              onReview={() => onReview(item)}
              onDelete={() => deleteItem.mutate(item.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
