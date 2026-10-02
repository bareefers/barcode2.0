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

/** Matches `GET /equipment` / `GET /equipment/queue/:id` item rows (SQLite `items.*` + queue join). */
export interface EquipmentItem {
  itemId: number;
  name: string;
  shortName: string;
  picture: string;
  /** URL to borrowing rules. */
  rules: string;
  /** URL to usage instructions. */
  instructions: string;
  quantity: number;
  maxDays: number;
  supportingMemberDays: number;
  alertStartDay: number;
  threadId?: number;
  /** User is on the wait list for this item (joined for current user). */
  inList: number | boolean;
  /** User currently holds a unit. */
  hasIt: number | boolean;
  /** User marked their held unit as returned (`dateDone`). */
  isAvailable: number | boolean;
}

/** `GET /equipment/queue/:itemId` → `queue.haves[]` entry (holder or returned unit). */
export interface EquipmentHaveEntry {
  user: User;
  userId?: number;
  isAvailable: boolean;
  overdue?: boolean;
  age?: string;
  ageAvailable?: string;
  days?: number;
  daysAvailable?: number;
  location?: string;
}

/** `GET /equipment/queue/:itemId` → `queue.waiters[]` entry. */
export interface EquipmentWaiterEntry {
  user: User;
  userId?: number;
  daysWaiting: number;
  ageWaiting: string;
  eta: string;
  location?: string;
}

export interface EquipmentQueuePayload {
  haves: EquipmentHaveEntry[];
  waiters: EquipmentWaiterEntry[];
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
  id: number;
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
