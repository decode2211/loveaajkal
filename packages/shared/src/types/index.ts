export interface User {
  id: string;
  username: string;
  displayName: string;
  timezone: string;
  city: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  category: 'about-me' | 'about-you' | 'us' | 'fun';
}

export interface QuizAnswer {
  id: string;
  userId: string;
  questionId: number;
  selectedOption: number;
  answeredAt: string;
  dateKey: string;
  user: User;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  emoji: string;
  order: number;
  photos: Photo[];
  createdAt: string;
}

export interface Photo {
  id: string;
  cloudinaryId: string;
  url: string;
  caption: string | null;
  uploadedAt: string;
}

export interface Preference {
  id: string;
  userId: string;
  questionId: number;
  choice: number;
  answeredAt: string;
  user: User;
}

export interface ThisOrThatQuestion {
  id: number;
  optionA: string;
  optionB: string;
  emojiA: string;
  emojiB: string;
  category: 'lifestyle' | 'food' | 'travel' | 'romance' | 'entertainment';
}

export interface MissMeterLog {
  id: string;
  userId: string;
  level: number;
  note: string | null;
  loggedAt: string;
  user: User;
}

export interface WatchlistItem {
  id: string;
  title: string;
  type: 'MOVIE' | 'SHOW' | 'ANIME' | 'DOCUMENTARY';
  posterUrl: string | null;
  addedById: string;
  watched: boolean;
  watchedAt: string | null;
  priority: number;
  createdAt: string;
  addedBy: User;
  reviews: Review[];
}

export interface Review {
  id: string;
  watchlistItemId: string;
  userId: string;
  heartRating: number;
  comment: string | null;
  createdAt: string;
  user: User;
}

export interface TripItem {
  id: string;
  category: 'FLIGHT' | 'LOCATION' | 'AGENDA' | 'PACKING';
  title: string;
  description: string | null;
  date: string | null;
  completed: boolean;
  order: number;
  metadata: Record<string, unknown> | null;
  addedById: string;
  createdAt: string;
  addedBy: User;
}

export interface CountdownConfig {
  id: string;
  targetDate: string;
  label: string;
  updatedAt: string;
}

export interface HomeConfig {
  person1: {
    name: string;
    city: string;
    timezone: string;
    avatarUrl: string | null;
  } | null;
  person2: {
    name: string;
    city: string;
    timezone: string;
    avatarUrl: string | null;
  } | null;
  countdown: {
    targetDate: string;
    label: string;
  };
}
