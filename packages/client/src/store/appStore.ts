import { create } from 'zustand';

interface AppState {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  distanceUnit: 'km' | 'miles';
  setDistanceUnit: (unit: 'km' | 'miles') => void;
}

export const useAppStore = create<AppState>((set) => ({
  navOpen: false,
  setNavOpen: (open) => set({ navOpen: open }),
  distanceUnit: 'km',
  setDistanceUnit: (unit) => set({ distanceUnit: unit }),
}));
