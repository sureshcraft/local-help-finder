// Domain types for Local Help Finder.

export interface Service {
  id: string;
  name: string;
  category: string;
  area: string;
  lat: number;
  lng: number;
  cost: number; // representative INR cost (per session / month / one-time)
  notes: string;
}

export interface ServiceWithVector extends Service {
  embedding: number[];
}

export interface Needs {
  categories: string[];
  area?: string;
  lat?: number;
  lng?: number;
  budget?: number;
  constraints: string[];
}

export interface Match extends Service {
  distanceKm: number;
  score: number;
  why?: string;
}
