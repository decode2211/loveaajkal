import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lightbulb, ScrollText, Globe, Shuffle, Heart, Tv2, Plane, Edit3 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { PageTransition, containerVariants, itemVariants } from '../../components/layout/PageTransition';
import { DualClockWidget } from './DualClockWidget';
import { CountdownWidget } from './CountdownWidget';
import { PageSpinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { HomeConfig } from '@us-always/shared';

const quickLinks = [
  { path: '/quiz', label: 'Daily Spark', icon: Lightbulb, desc: "Today's question" },
  { path: '/timeline', label: 'Our Codex', icon: ScrollText, desc: 'Our memories' },
  { path: '/distance', label: 'Distance', icon: Globe, desc: 'How far apart' },
  { path: '/this-or-that', label: 'This or That', icon: Shuffle, desc: 'Our choices' },
  { path: '/miss-meter', label: 'Miss Meter', icon: Heart, desc: 'How much today' },
  { path: '/watch', label: 'Watch Together', icon: Tv2, desc: 'What to watch' },
];

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [editCountdown, setEditCountdown] = useState(false);

  const { data: config, isLoading } = useQuery<HomeConfig>({
    queryKey: ['home', 'config'],
    queryFn: async () => {
      const { data } = await api.get<HomeConfig>('/home/config');
      return data;
    },
  });

  const { register, handleSubmit } = useForm<{ targetDate: string; label: string }>();

  const updateCountdown = useMutation({
    mutationFn: async (data: { targetDate: string; label: string }) => {
      await api.put('/home/countdown', { targetDate: new Date(data.targetDate).toISOString(), label: data.label });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home', 'config'] });
      setEditCountdown(false);
      toast.success('Countdown updated 💛');
    },
    onError: () => toast.error('Failed to update countdown'),
  });

  if (isLoading || !config) return <PageSpinner />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <PageTransition className="p-6 max-w-4xl mx-auto">
      {/* Greeting */}
      <motion.div variants={itemVariants} className="mb-8">
        <p className="text-text-tertiary text-sm font-mono">{greeting()},</p>
        <h1 className="font-display text-4xl md:text-5xl italic text-text-primary mt-1">
          {user?.displayName} <span className="text-accent-gold">💛</span>
        </h1>
      </motion.div>

      <motion.div variants={containerVariants} animate="animate" className="space-y-6">
        {/* Clocks */}
        <motion.div variants={itemVariants}>
          {config.person1 && config.person2 && (
            <DualClockWidget
              person1={{ displayName: config.person1.name, city: config.person1.city, timezone: config.person1.timezone }}
              person2={{ displayName: config.person2.name, city: config.person2.city, timezone: config.person2.timezone }}
            />
          )}
        </motion.div>

        {/* Countdown */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl italic text-text-secondary">Counting down</h2>
            <button
              onClick={() => setEditCountdown(true)}
              className="text-text-tertiary hover:text-accent-gold transition-colors"
              aria-label="Edit countdown"
            >
              <Edit3 size={15} />
            </button>
          </div>
          {config.countdown?.targetDate && (
            <CountdownWidget
              targetDate={config.countdown.targetDate}
              label={config.countdown.label}
            />
          )}
        </motion.div>

        {/* Quick links */}
        <motion.div variants={itemVariants}>
          <h2 className="font-display text-xl italic text-text-secondary mb-3">Explore</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickLinks.map(({ path, label, icon: Icon, desc }) => (
              <Link key={path} to={path}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-bg-surface border border-border-subtle rounded-2xl p-4 hover:border-accent-gold/30 hover:bg-bg-hover transition-all duration-200 cursor-pointer group"
                >
                  <Icon size={20} className="text-accent-gold mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-text-primary text-sm font-medium">{label}</p>
                  <p className="text-text-tertiary text-xs mt-0.5">{desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Trip shortcut */}
        <motion.div variants={itemVariants}>
          <Link to="/trip">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-bg-surface border border-border-subtle rounded-2xl p-5 hover:border-accent-gold/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Plane size={22} className="text-accent-sky group-hover:translate-x-1 transition-transform" />
                <div>
                  <p className="text-text-primary font-medium">Trip Planner</p>
                  <p className="text-text-tertiary text-xs">Flights, places, agenda & packing</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Edit countdown modal */}
      <Modal open={editCountdown} onClose={() => setEditCountdown(false)} title="Update Countdown">
        <form onSubmit={handleSubmit((d) => updateCountdown.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-mono">Target Date & Time</label>
            <input
              type="datetime-local"
              {...register('targetDate', { required: true })}
              defaultValue={config.countdown?.targetDate ? new Date(config.countdown.targetDate).toISOString().slice(0, 16) : ''}
              className="w-full bg-bg-base border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-mono">Label</label>
            <input
              type="text"
              {...register('label', { required: true })}
              defaultValue={config.countdown?.label || ''}
              placeholder="Next time I see you 🛫"
              className="w-full bg-bg-base border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
            />
          </div>
          <Button type="submit" loading={updateCountdown.isPending} className="w-full justify-center">
            Update Countdown
          </Button>
        </form>
      </Modal>
    </PageTransition>
  );
}
