import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Plus, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { WatchlistItem } from '@us-always/shared';
import api from '../../lib/api';
import { PageTransition, itemVariants } from '../../components/layout/PageTransition';
import { PageSpinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { MediaQueue } from './MediaQueue';
import { ReviewModal } from './ReviewModal';

type MediaFilter = 'ALL' | 'MOVIE' | 'SHOW' | 'ANIME' | 'DOCUMENTARY';
type TabType = 'queue' | 'watched' | 'datenight';

const REACTIONS = ['🥰', '😂', '😮', '😭', '🔥'] as const;

export function WatchTogetherPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<TabType>('queue');
  const [filter, setFilter] = useState<MediaFilter>('ALL');
  const [addOpen, setAddOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<WatchlistItem | null>(null);
  const [newItem, setNewItem] = useState({ title: '', type: 'MOVIE' as WatchlistItem['type'], posterUrl: '' });

  // Socket state
  const socketRef = useRef<Socket | null>(null);
  const [currentWatching, setCurrentWatching] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: string; emoji: string; x: number }>>([]);
  const [watchNotes, setWatchNotes] = useState('');

  useEffect(() => {
    const socket = io(
      (import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001') + '/watch-together',
      { withCredentials: true, auth: { token: '' } },
    );
    socketRef.current = socket;

    socket.emit('join-room', { displayName: user?.displayName || 'Guest' });
    socket.on('room-state', ({ currentTitle, notes }: { currentTitle: string | null; notes: string }) => {
      setCurrentWatching(currentTitle);
      setWatchNotes(notes);
    });
    socket.on('sync-status', ({ title }: { title: string }) => setCurrentWatching(title));
    socket.on('reaction', ({ emoji }: { emoji: string }) => spawnReaction(emoji));
    socket.on('notes-updated', ({ notes }: { notes: string }) => setWatchNotes(notes));

    return () => { socket.disconnect(); };
  }, [user]);

  const spawnReaction = (emoji: string) => {
    const id = Math.random().toString(36).slice(2);
    const x = Math.random() * 70 + 5;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => setFloatingReactions((prev) => prev.filter((r) => r.id !== id)), 2200);
  };

  const sendReaction = (emoji: string) => {
    socketRef.current?.emit('send-reaction', { emoji });
    spawnReaction(emoji);
  };

  const { data: items, isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const { data } = await api.get<WatchlistItem[]>('/watchlist');
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      await api.post('/watchlist', {
        title: newItem.title,
        type: newItem.type,
        posterUrl: newItem.posterUrl || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
      setAddOpen(false);
      setNewItem({ title: '', type: 'MOVIE', posterUrl: '' });
      toast.success('Added to queue!');
    },
    onError: () => toast.error('Failed to add'),
  });

  const deleteWatched = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/watchlist/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
    onError: () => toast.error('Failed to delete'),
  });

  if (isLoading || !items) return <PageSpinner />;

  const queue = items.filter((i) => !i.watched);
  const watched = items.filter((i) => i.watched);

  return (
    <PageTransition className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl italic text-text-primary">Watch Together 🎬</h1>
          <p className="text-text-tertiary text-sm mt-1">Our shared queue</p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus size={14} /> Add
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 border-b border-border-subtle mb-4 pb-2">
        {(['queue', 'watched', 'datenight'] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-3 py-1.5 rounded-lg capitalize transition-colors ${
              tab === t ? 'text-accent-gold bg-accent-gold/10' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {t === 'datenight' ? 'Date Night' : t}
            {t === 'queue' && queue.length > 0 && (
              <span className="ml-1.5 font-mono text-xs text-text-tertiary">({queue.length})</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Media type filter */}
      {tab !== 'datenight' && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {(['ALL', 'MOVIE', 'SHOW', 'ANIME', 'DOCUMENTARY'] as MediaFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-colors border ${
                filter === f
                  ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/30'
                  : 'text-text-tertiary border-transparent hover:text-text-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'queue' && (
          <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MediaQueue items={queue} filter={filter} onReview={setReviewItem} />
          </motion.div>
        )}

        {tab === 'watched' && (
          <motion.div key="watched" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {watched.length === 0 ? (
              <p className="text-text-tertiary text-sm text-center py-10">Nothing watched yet!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {watched
                  .filter((i) => filter === 'ALL' || i.type === filter)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-bg-surface border border-border-subtle rounded-xl p-4 cursor-pointer hover:border-border-default transition-all group"
                      onClick={() => setReviewItem(item)}
                    >
                      <div className="flex gap-3">
                        {item.posterUrl ? (
                          <img src={item.posterUrl} alt={item.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-16 bg-bg-elevated rounded-lg flex items-center justify-center flex-shrink-0">
                            <Film size={18} className="text-text-tertiary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary text-sm font-medium truncate">{item.title}</p>
                          <Badge variant="sage" className="mt-1 text-[10px]">Watched ✓</Badge>
                          {item.reviews.length > 0 && (
                            <div className="mt-1.5 space-y-0.5">
                              {item.reviews.map((r) => (
                                <div key={r.id} className="flex items-center gap-1">
                                  <span className="text-[10px]">{'❤️'.repeat(r.heartRating)}</span>
                                  <span className="text-[10px] text-text-tertiary">{r.user.displayName}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteWatched.mutate(item.id); }}
                          className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent-rose transition-all self-start"
                          aria-label={`Delete ${item.title}`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'datenight' && (
          <motion.div key="datenight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Currently watching */}
            <div className="bg-bg-surface border border-accent-gold/20 rounded-2xl p-4 shadow-gold">
              <p className="text-xs text-text-tertiary font-mono mb-1">Currently watching together</p>
              <p className="text-text-primary font-medium">
                {currentWatching || 'Nothing selected — pick something from the queue!'}
              </p>
            </div>

            {/* Reaction buttons + floating emojis */}
            <div className="relative overflow-hidden">
              <div className="flex gap-3 flex-wrap">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="text-3xl hover:scale-125 transition-transform active:scale-95 select-none"
                    aria-label={`Send ${emoji} reaction`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {/* Floating reactions */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden h-20">
                <AnimatePresence>
                  {floatingReactions.map((r) => (
                    <motion.span
                      key={r.id}
                      className="absolute text-3xl select-none"
                      style={{ left: `${r.x}%`, bottom: 0 }}
                      initial={{ y: 0, opacity: 1, scale: 0.8 }}
                      animate={{ y: -80, opacity: 0, scale: 1.1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.8, ease: 'easeOut' }}
                    >
                      {r.emoji}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Shared watch notes */}
            <div>
              <p className="text-xs text-text-tertiary font-mono mb-1.5">Shared watch notes</p>
              <textarea
                value={watchNotes}
                onChange={(e) => {
                  setWatchNotes(e.target.value);
                  socketRef.current?.emit('update-notes', { notes: e.target.value });
                }}
                rows={4}
                placeholder="Live reactions, timestamps, favourite quotes..."
                className="w-full bg-bg-surface border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-gold resize-none"
              />
              <p className="text-xs text-text-tertiary mt-1">Synced in real-time ✨</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add item modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add to Queue" size="sm">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1 font-mono">Title *</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
              placeholder="Movie / show name"
              className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1 font-mono">Type</label>
            <select
              value={newItem.type}
              onChange={(e) => setNewItem((p) => ({ ...p, type: e.target.value as WatchlistItem['type'] }))}
              className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
            >
              {(['MOVIE', 'SHOW', 'ANIME', 'DOCUMENTARY'] as const).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1 font-mono">Poster URL (optional)</label>
            <input
              type="url"
              value={newItem.posterUrl}
              onChange={(e) => setNewItem((p) => ({ ...p, posterUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
            />
          </div>
          <Button
            onClick={() => addMutation.mutate()}
            loading={addMutation.isPending}
            disabled={!newItem.title.trim()}
            className="w-full justify-center"
          >
            Add to Queue
          </Button>
        </div>
      </Modal>

      {/* Review modal */}
      <ReviewModal item={reviewItem} onClose={() => setReviewItem(null)} />
    </PageTransition>
  );
}
