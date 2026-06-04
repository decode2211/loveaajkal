import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { TimelineEvent } from '@us-always/shared';
import { createTimelineEventSchema, CreateTimelineEventInput } from '@us-always/shared';
import { PageTransition, itemVariants } from '../../components/layout/PageTransition';
import { PageSpinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { TimelineNode } from './TimelineNode';
import { TimelineModal } from './TimelineModal';

export function TimelinePage() {
  const qc = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data: events, isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ['timeline'],
    queryFn: async () => {
      const { data } = await api.get<TimelineEvent[]>('/timeline');
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTimelineEventInput>({
    resolver: zodResolver(createTimelineEventSchema),
    defaultValues: { order: 0, emoji: '✨' },
  });

  const createEvent = useMutation({
    mutationFn: async (data: CreateTimelineEventInput) => {
      await api.post('/timeline', data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timeline'] });
      setAddOpen(false);
      reset();
      toast.success('Milestone added 💛');
    },
    onError: () => toast.error('Failed to add milestone'),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <PageTransition className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic text-text-primary">Our Codex 📜</h1>
          <p className="text-text-tertiary text-sm mt-1">Every moment that made us</p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus size={14} />
          Add Milestone
        </Button>
      </motion.div>

      {/* Timeline spine */}
      <div className="relative timeline-spine">
        {events?.map((event, i) => (
          <TimelineNode
            key={event.id}
            event={event}
            index={i}
            onClick={() => setSelectedEvent(event)}
          />
        ))}

        {events?.length === 0 && (
          <p className="text-text-tertiary text-center py-16 text-sm">
            No milestones yet — add your first memory ✨
          </p>
        )}
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <TimelineModal
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Add event modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Milestone">
        <form onSubmit={handleSubmit((d) => createEvent.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1 font-mono">Date *</label>
              <input
                type="datetime-local"
                {...register('date')}
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
              />
              {errors.date && <p className="text-accent-rose text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1 font-mono">Emoji *</label>
              <input
                type="text"
                {...register('emoji')}
                placeholder="✨"
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
              />
              {errors.emoji && <p className="text-accent-rose text-xs mt-1">{errors.emoji.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1 font-mono">Title *</label>
            <input
              type="text"
              {...register('title')}
              placeholder="The moment everything changed..."
              className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
            />
            {errors.title && <p className="text-accent-rose text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1 font-mono">Description *</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Tell the story of this moment..."
              className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold resize-none"
            />
            {errors.description && <p className="text-accent-rose text-xs mt-1">{errors.description.message}</p>}
          </div>

          <input type="hidden" {...register('order', { valueAsNumber: true })} />

          <Button type="submit" loading={createEvent.isPending} className="w-full justify-center">
            Add to Our Codex
          </Button>
        </form>
      </Modal>
    </PageTransition>
  );
}
