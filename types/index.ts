// Type definitions for BARcode application

export interface User {
  id: number;
  name: string;
  location?: string;
  canImpersonate?: boolean;
}

export interface Frag {
  fragId: number;
  name: string;
  scientificName?: string;
  type: string;
  rules: 'dbtc' | 'pif' | 'private';
  status: 'alive' | 'dead' | 'transferred';
  isAlive: boolean;
  isStatic?: boolean;
  picture?: string;
  notes?: string;
  dateAcquired: string;
  source?: string;
  
  // Conditions
  light: string;
  flow: string;
  hardiness: string;
  growthRate: string;
  
  // Ownership
  owner: User;
  ownsIt: boolean;
  hasOne?: boolean;
  
  // Lineage
  motherId: number;
  fragOf?: number;
  
  // Availability
  fragsAvailable: number;
  otherFragsAvailable?: number;
  
  // Community
  fanCount?: number;
  isFan?: boolean;
  
  // Threading
  threadUrl?: string;
  
  // Collection context
  inCollection?: boolean;
}

export interface Tank {
  tankId: number;
  name: string;
  description?: string;
  volume?: number;
  startDate?: string;
  picture?: string;
  owner: User;
}

export interface EquipmentItem {
  itemId: number;
  name: string;
  description?: string;
  picture?: string;
  owner: User;
  status: 'available' | 'in_use' | 'maintenance';
  currentHolder?: User;
  queueLength?: number;
  inLine?: boolean;
}

export interface MarketListing {
  listingId: number;
  frag: Frag;
  price: number;
  description?: string;
  seller: User;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
}

export interface Settings {
  yourCollectionView?: 'cards' | 'gallery';
  [key: string]: any;
}

// API Response Types
export interface CollectionResponse {
  user: User;
  frags: Frag[];
}

export interface ImpersonateResponse {
  name: string;
  canImpersonate: boolean;
  impersonating: boolean;
}

export interface FragLineageNode {
  fragId: number;
  text: string;
  owner: User;
  isAlive: boolean;
  isSource?: boolean;
  original?: boolean;
  dateAcquired: string;
  children: FragLineageNode[];
}

export interface FragTreeResponse {
  root: FragLineageNode;
}

export interface FragKidsResponse {
  frags: Array<Frag & { fragsAvailable: number }>;
}

export interface FanResponse {
  isFan: boolean;
  likes: number;
  users: User[];
}

export interface ShareResponse {
  url: string;
}

export interface EnumsResponse {
  types: Array<{ type: string }>;
  market: boolean;
}

// Filter types
export interface FragFilter {
  name?: string;
  type?: string;
  collection?: 'DBTC' | 'PIF' | 'PRIVATE';
  alive?: boolean;
}
