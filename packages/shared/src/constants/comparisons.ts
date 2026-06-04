export interface Comparison {
  id: string;
  label: string;
  emoji: string;
  calculate: (km: number) => string;
  unit: string;
  wittyLine: string;
}

export const distanceComparisons: Comparison[] = [
  {
    id: 'steps',
    label: 'Footsteps',
    emoji: '👣',
    calculate: (km) => Math.round(km * 1000 / 0.762).toLocaleString(),
    unit: 'steps',
    wittyLine: 'Still worth every single one 🥺',
  },
  {
    id: 'pizza',
    label: 'Pizza Boxes Stacked',
    emoji: '🍕',
    calculate: (km) => Math.round(km * 1000 / 0.30).toLocaleString(),
    unit: 'boxes tall',
    wittyLine: "That's a lot of pizza we could've shared 😭",
  },
  {
    id: 'flight',
    label: 'Commercial Flight Hours',
    emoji: '✈️',
    calculate: (km) => (km / 900).toFixed(1),
    unit: 'hours of flying',
    wittyLine: 'Worth every turbulent second ✨',
  },
  {
    id: 'drive',
    label: 'Hours of Driving',
    emoji: '🚗',
    calculate: (km) => Math.round(km / 100).toLocaleString(),
    unit: 'hours at 100 km/h',
    wittyLine: "That's one very long road trip playlist 🎵",
  },
  {
    id: 'eiffel',
    label: 'Eiffel Tower Heights',
    emoji: '🗼',
    calculate: (km) => Math.round(km * 1000 / 330).toLocaleString(),
    unit: 'Eiffel Towers tall',
    wittyLine: 'Still not as beautiful as you though 🌹',
  },
  {
    id: 'greatwall',
    label: 'Great Wall of China',
    emoji: '🧱',
    calculate: (km) => (km / 21196).toFixed(2),
    unit: 'lengths of the Great Wall',
    wittyLine: 'Our love spans further than ancient wonders 💫',
  },
  {
    id: 'track',
    label: 'Running Tracks',
    emoji: '🏃',
    calculate: (km) => Math.round(km * 1000 / 400).toLocaleString(),
    unit: 'laps around a track',
    wittyLine: "I'd run every single lap for you 🫀",
  },
  {
    id: 'heartbeats',
    label: 'Heartbeats Apart',
    emoji: '💓',
    calculate: (km) => {
      const seconds = (km * 1000) / 1.0; // 1 m/s walking
      const beats = Math.round(seconds * 75 / 60);
      return beats.toLocaleString();
    },
    unit: 'heartbeats to walk to you',
    wittyLine: 'Every single beat belongs to you 💖',
  },
  {
    id: 'earth',
    label: 'Times Around Earth',
    emoji: '🌍',
    calculate: (km) => (km / 40075).toFixed(3),
    unit: 'times around the Earth',
    wittyLine: "Still can't circle away from my thoughts of you 🌎",
  },
  {
    id: 'moon',
    label: 'Distance to the Moon',
    emoji: '🌙',
    calculate: (km) => (km / 384400 * 100).toFixed(4),
    unit: '% of Earth-Moon distance',
    wittyLine: 'Love you to the moon and back (several times) 🌕',
  },
  {
    id: 'marathons',
    label: 'Marathons',
    emoji: '🏅',
    calculate: (km) => Math.round(km / 42.195).toLocaleString(),
    unit: 'marathons end-to-end',
    wittyLine: "I'd train for every single one 🏋️",
  },
  {
    id: 'buses',
    label: 'Double-Decker Buses',
    emoji: '🚌',
    calculate: (km) => Math.round(km * 1000 / 8.38).toLocaleString(),
    unit: 'buses bumper to bumper',
    wittyLine: 'That\'s a lot of red buses missing you too 🇬🇧',
  },
  {
    id: 'swimming',
    label: 'Olympic Pools',
    emoji: '🏊',
    calculate: (km) => Math.round(km * 1000 / 50).toLocaleString(),
    unit: 'Olympic pool lengths',
    wittyLine: "I'd swim every lap just to reach you 🌊",
  },
  {
    id: 'skyscraper',
    label: 'Empire State Buildings',
    emoji: '🏙️',
    calculate: (km) => Math.round(km * 1000 / 443).toLocaleString(),
    unit: 'Empire State Buildings stacked',
    wittyLine: 'Our love is taller than all of them 🌆',
  },
  {
    id: 'songs',
    label: 'Song Replays',
    emoji: '🎵',
    calculate: (km) => {
      // Assuming "our song" is ~3.5 minutes = 210 seconds
      // 1 km ~= 1 minute at 60 km/h train
      const minutes = km;
      return Math.round(minutes / 3.5).toLocaleString();
    },
    unit: 'plays of our song',
    wittyLine: "That's a lot of feelings on repeat 🎶",
  },
];
