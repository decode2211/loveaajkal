import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Plane, MapPin, Calendar, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { TripItem } from '@us-always/shared';
import { PageTransition, itemVariants } from '../../components/layout/PageTransition';
import { PageSpinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { FlightDetails } from './FlightDetails';
import { LocationPins } from './LocationPins';
import { DailyAgenda } from './DailyAgenda';
import { PackingChecklist } from './PackingChecklist';

type TripCategory = 'FLIGHT' | 'LOCATION' | 'AGENDA' | 'PACKING';
type TripData = Record<TripCategory, TripItem[]>;

const CATEGORY_CONFIG = {
  FLIGHT: { label: 'Flights', icon: Plane, color: 'text-accent-sky' },
  LOCATION: { label: 'Places', icon: MapPin, color: 'text-accent-gold' },
  AGENDA: { label: 'Agenda', icon: Calendar, color: 'text-accent-rose' },
  PACKING: { label: 'Packing', icon: Package, color: 'text-accent-sage' },
} as const;

const PACKING_CATEGORIES = ['Clothes', 'Electronics', 'Documents', 'Toiletries', 'Other'];

export function TripPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [activeSection, setActiveSection] = useState<TripCategory>('FLIGHT');
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    date: '',
    metadata: {} as Record<string, string>,
  });

  const { data: tripData, isLoading } = useQuery<TripData>({
    queryKey: ['trip'],
    queryFn: async () => {
      const { data } = await api.get<TripData>('/trip');
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      await api.post('/trip', {
        category: activeSection,
        title: newItem.title,
        description: newItem.description || undefined,
        date: newItem.date ? new Date(newItem.date).toISOString() : undefined,
        metadata: Object.keys(newItem.metadata).length ? newItem.metadata : undefined,
        order: 0,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trip'] });
      setAddOpen(false);
      setNewItem({ title: '', description: '', date: '', metadata: {} });
      toast.success('Added!');
    },
    onError: () => toast.error('Failed to add'),
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, current }: { id: string; current: boolean }) => {
      await api.put(`/trip/${id}`, { completed: !current });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip'] }),
    onError: () => toast.error('Failed to update'),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/trip/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip'] }),
    onError: () => toast.error('Failed to delete'),
  });

  const setMeta = (key: string, value: string) => {
    setNewItem((p) => ({ ...p, metadata: { ...p.metadata, [key]: value } }));
  };

  if (isLoading || !tripData) return <PageSpinner />;

  const sectionItems = tripData[activeSection] || [];

  return (
    <PageTransition className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl italic text-text-primary">Trip Planner ✈️</h1>
          <p className="text-text-tertiary text-sm mt-1">Our next adventure</p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus size={14} /> Add
        </Button>
      </motion.div>

      {/* Section tabs */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2 mb-6">
        {(Object.entries(CATEGORY_CONFIG) as [TripCategory, typeof CATEGORY_CONFIG[TripCategory]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = (tripData[key] || []).length;
          const isActive = activeSection === key;
          return (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center ${
                isActive
                  ? 'border-accent-gold/40 bg-accent-gold/5'
                  : 'border-border-subtle hover:border-border-default hover:bg-bg-hover'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-accent-gold' : cfg.color} />
              <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-accent-gold' : 'text-text-tertiary'}`}>
                {cfg.label}
              </span>
              {count > 0 && (
                <span className="text-[10px] font-mono text-text-tertiary">{count}</span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {activeSection === 'FLIGHT' && (
            <div className="space-y-3">
              {sectionItems.map((item) => (
                <FlightDetails
                  key={item.id}
                  item={item}
                  onComplete={() => toggleComplete.mutate({ id: item.id, current: item.completed })}
                  onDelete={() => deleteItem.mutate(item.id)}
                />
              ))}
              {sectionItems.length === 0 && (
                <p className="text-text-tertiary text-sm text-center py-10">No flights added yet ✈️</p>
              )}
            </div>
          )}

          {activeSection === 'LOCATION' && (
            <LocationPins items={sectionItems} onDelete={(id) => deleteItem.mutate(id)} />
          )}

          {activeSection === 'AGENDA' && (
            <DailyAgenda
              items={sectionItems}
              onComplete={(id, current) => toggleComplete.mutate({ id, current })}
              onDelete={(id) => deleteItem.mutate(id)}
            />
          )}

          {activeSection === 'PACKING' && (
            <PackingChecklist
              items={sectionItems}
              myId={user?.id}
              onComplete={(id, current) => toggleComplete.mutate({ id, current })}
              onDelete={(id) => deleteItem.mutate(id)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add item modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={`Add to ${CATEGORY_CONFIG[activeSection].label}`}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1 font-mono">
              {activeSection === 'FLIGHT' ? 'Flight name' :
               activeSection === 'LOCATION' ? 'Place name' :
               activeSection === 'AGENDA' ? 'Activity' : 'Item name'} *
            </label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
              placeholder={
                activeSection === 'FLIGHT' ? 'Delhi → New York' :
                activeSection === 'LOCATION' ? 'Central Park' :
                activeSection === 'AGENDA' ? 'Morning brunch' : 'Passport'
              }
              className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold"
              autoFocus
            />
          </div>

          {/* Flight fields */}
          {activeSection === 'FLIGHT' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-text-secondary mb-1 font-mono">Airline</label>
                  <input type="text" placeholder="IndiGo" onChange={(e) => setMeta('airline', e.target.value)}
                    className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold" />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1 font-mono">Flight No.</label>
                  <input type="text" placeholder="6E 2341" onChange={(e) => setMeta('flightNumber', e.target.value)}
                    className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-text-secondary mb-1 font-mono">From (IATA)</label>
                  <input type="text" placeholder="MAA" onChange={(e) => setMeta('departure', e.target.value)}
                    className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold" />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1 font-mono">To (IATA)</label>
                  <input type="text" placeholder="JFK" onChange={(e) => setMeta('arrival', e.target.value)}
                    className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-mono">Date & Time</label>
                <input type="datetime-local"
                  onChange={(e) => {
                    setNewItem((p) => ({ ...p, date: e.target.value }));
                    setMeta('departureTime', new Date(e.target.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                  }}
                  className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-mono">Booking Ref</label>
                <input type="text" placeholder="ABC123" onChange={(e) => setMeta('bookingRef', e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-gold" />
              </div>
            </>
          )}

          {/* Location fields */}
          {activeSection === 'LOCATION' && (
            <>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-mono">Address</label>
                <input type="text" placeholder="123 Street, City" value={newItem.description}
                  onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-mono">Category</label>
                <select onChange={(e) => setMeta('category', e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold">
                  <option>Food</option><option>Activity</option><option>Attraction</option><option>Shopping</option>
                </select>
              </div>
            </>
          )}

          {/* Agenda fields */}
          {activeSection === 'AGENDA' && (
            <>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-mono">Day</label>
                <input type="date" onChange={(e) => setMeta('day', e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-mono">Time (optional)</label>
                <input type="time" onChange={(e) => setMeta('time', e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold" />
              </div>
            </>
          )}

          {/* Packing fields */}
          {activeSection === 'PACKING' && (
            <div>
              <label className="block text-xs text-text-secondary mb-1 font-mono">Category</label>
              <select onChange={(e) => setMeta('packingCategory', e.target.value)}
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-gold">
                {PACKING_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          <Button
            onClick={() => addMutation.mutate()}
            loading={addMutation.isPending}
            disabled={!newItem.title.trim()}
            className="w-full justify-center"
          >
            Add Item
          </Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
