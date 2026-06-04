import { motion } from 'framer-motion';
import { useState } from 'react';
import { haversineDistance } from '@us-always/shared';
import { PageTransition, itemVariants } from '../../components/layout/PageTransition';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/appStore';
import { DistanceDisplay } from './DistanceDisplay';
import { ComparisonEngine } from './ComparisonEngine';

// Hardcoded coordinates — update these via .env or settings in production
const PERSON1 = { lat: 16.4307, lng: 80.5525, city: 'Mangalagiri, India' };
const PERSON2 = { lat: 40.7128, lng: -74.006, city: 'New York, USA' };

export function DistancePage() {
  const { distanceUnit, setDistanceUnit } = useAppStore();
  const [activeComparison, setActiveComparison] = useState<string | null>(null);

  const distance = haversineDistance(PERSON1.lat, PERSON1.lng, PERSON2.lat, PERSON2.lng);

  return (
    <PageTransition className="p-6 max-w-4xl mx-auto">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="font-display text-3xl italic text-text-primary">The Distance 🌏</h1>
        <p className="text-text-tertiary text-sm mt-1">Between us, and beyond</p>
      </motion.div>

      {/* Hero distance card */}
      <motion.div variants={itemVariants} className="mb-8">
        <Card glow="gold" className="p-8 overflow-hidden">
          <DistanceDisplay
            km={distance.km}
            miles={distance.miles}
            unit={distanceUnit}
            onToggleUnit={setDistanceUnit}
            city1={PERSON1.city}
            city2={PERSON2.city}
          />
        </Card>
      </motion.div>

      {/* Comparisons grid */}
      <motion.div variants={itemVariants}>
        <ComparisonEngine
          distanceKm={distance.km}
          activeId={activeComparison}
          onSelect={(id) => setActiveComparison((prev) => (prev === id ? null : id))}
        />
      </motion.div>
    </PageTransition>
  );
}
