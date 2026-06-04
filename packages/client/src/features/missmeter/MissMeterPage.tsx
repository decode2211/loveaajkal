import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../lib/api';
import { PageTransition, itemVariants } from '../../components/layout/PageTransition';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { MeterSlider } from './MeterSlider';
import { MeterMessages } from './MeterMessages';

interface MissUser {
  user: { id: string; displayName: string };
  latest: { level: number; note: string | null; loggedAt: string } | null;
}

function getMissText(level: number): string {
  if (level <= 20) return 'Just a little...';
  if (level <= 40) return 'More than admitted';
  if (level <= 60) return 'A lot. Genuinely.';
  if (level <= 80) return 'Send help 😭';
  if (level <= 99) return "I'm not okay 💔";
  return '🚨 MAXIMUM';
}

export function MissMeterPage() {
  const qc = useQueryClient();
  const [level, setLevel] = useState(50);
  const [note, setNote] = useState('');

  const latestQuery = useQuery<MissUser[]>({
    queryKey: ['miss-meter', 'latest'],
    queryFn: async () => {
      const { data } = await api.get<MissUser[]>('/preferences/miss-meter/latest');
      return data;
    },
  });

  const historyQuery = useQuery<Array<{
    user: { id: string; displayName: string };
    logs: Array<{ level: number; loggedAt: string }>;
  }>>({
    queryKey: ['miss-meter', 'history'],
    queryFn: async () => {
      const { data } = await api.get('/preferences/miss-meter/history');
      return data;
    },
  });

  const logMutation = useMutation({
    mutationFn: async () => {
      await api.post('/preferences/miss-meter', { level, note: note.trim() || undefined });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['miss-meter'] });
      setNote('');
      toast.success('Logged 💛');
    },
    onError: () => toast.error('Failed to log'),
  });

  if (latestQuery.isLoading) return <PageSpinner />;

  // Build 7-day chart data
  const chartData: Array<Record<string, unknown>> = [];
  if (historyQuery.data) {
    const allDates = new Set<string>();
    historyQuery.data.forEach(({ logs }) =>
      logs.forEach((l) => allDates.add(l.loggedAt.split('T')[0])),
    );
    Array.from(allDates).sort().slice(-7).forEach((date) => {
      const entry: Record<string, unknown> = { date };
      historyQuery.data!.forEach(({ user, logs }) => {
        const dayLogs = logs.filter((l) => l.loggedAt.startsWith(date));
        if (dayLogs.length) {
          entry[user.displayName] = Math.round(
            dayLogs.reduce((sum, l) => sum + l.level, 0) / dayLogs.length,
          );
        }
      });
      chartData.push(entry);
    });
  }

  const userNames = historyQuery.data?.map((u) => u.user.displayName) ?? [];
  const partnerEntry = latestQuery.data?.find((u) => u.latest !== null && u.latest !== undefined);

  return (
    <PageTransition className="p-6 max-w-2xl mx-auto">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="font-display text-3xl italic text-text-primary">Miss Meter ❤️</h1>
        <p className="text-text-tertiary text-sm mt-1">How much today?</p>
      </motion.div>

      {/* Max-out overlay */}
      <AnimatePresence>
        {level === 100 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-accent-rose/10"
              animate={{ backgroundColor: ['rgba(196,123,123,0.08)', 'rgba(196,123,123,0.22)', 'rgba(196,123,123,0.08)'] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-5">
        {/* ── Left: Meter ── */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-5">
            <MeterMessages level={level} />
            <MeterSlider value={level} onChange={setLevel} />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell them why right now..."
              rows={2}
              maxLength={500}
              className="w-full bg-bg-elevated border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-gold resize-none"
              aria-label="Optional note"
            />
            <Button
              onClick={() => logMutation.mutate()}
              loading={logMutation.isPending}
              className="w-full justify-center"
            >
              Log It
            </Button>
          </Card>
        </motion.div>

        {/* ── Right: Partner + chart ── */}
        <div className="space-y-4">
          {/* Partner's latest */}
          {partnerEntry?.latest && (
            <motion.div variants={itemVariants}>
              <Card className="p-5">
                <p className="text-xs text-text-tertiary font-mono mb-3">Their latest</p>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-accent-rose/10 border-2 border-accent-rose/30 flex flex-col items-center justify-center">
                    <span className="font-mono text-lg text-accent-rose leading-none">
                      {partnerEntry.latest.level}
                    </span>
                    <span className="text-[9px] text-text-tertiary font-mono">/100</span>
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">{getMissText(partnerEntry.latest.level)}</p>
                    {partnerEntry.latest.note && (
                      <p className="text-text-tertiary text-xs italic mt-0.5">
                        "{partnerEntry.latest.note}"
                      </p>
                    )}
                    <p className="text-text-tertiary text-[10px] font-mono mt-1">
                      {new Date(partnerEntry.latest.loggedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Sparkline */}
          {chartData.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-5">
                <p className="text-xs text-text-tertiary font-mono mb-3">7-day trend</p>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '11px',
                      }}
                    />
                    {userNames.map((name, i) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={i === 0 ? 'var(--accent-gold)' : 'var(--accent-rose)'}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  {userNames.map((name, i) => (
                    <div key={name} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: i === 0 ? 'var(--accent-gold)' : 'var(--accent-rose)' }}
                      />
                      <span className="text-xs text-text-tertiary">{name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
