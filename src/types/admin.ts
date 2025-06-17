
export interface Cow {
  id: string;
  name: string;
  age: number; // We'll keep age for now, but dateOfBirth is more precise
  dateOfBirth?: string; // New field: YYYY-MM-DD format
  breed: string;
  gender: 'Male' | 'Female';
  lactation?: string; // e.g., "Lactating - 1st", "Dry", "Heifer", "Bull - Breeding"
  mother?: string; // Name or ID
  father?: string; // Name or ID
  description: string;
  imageUrl?: string;
  dateAdded?: string;
  lastUpdated?: string;
}

export type FoodCategory = "Suku charu" | "Lilu charu" | "Dhaan";

export interface FoodItem {
  name: string;
  category: FoodCategory;
}

export const ALL_FOOD_ITEMS: FoodItem[] = [
  // Suku charu
  { name: 'TUVER BHUSU', category: 'Suku charu' },
  { name: 'GHAU BHUSU', category: 'Suku charu' },
  { name: 'CHANA BHUSU', category: 'Suku charu' },
  { name: 'HUNDIYU-JUVAR', category: 'Suku charu' },
  { name: 'HUNDIYU-BAJARI', category: 'Suku charu' },
  { name: 'SHERADI KUCHA', category: 'Suku charu' },
  // Lilu charu
  { name: 'SAILEG', category: 'Lilu charu' },
  { name: 'NEPIER MAKAI', category: 'Lilu charu' },
  { name: 'NEPIER BAJARI - JUVAR', category: 'Lilu charu' },
  { name: 'NEPIER BAJARI - SHERADI', category: 'Lilu charu' },
  { name: 'BAJARI - MAKAI', category: 'Lilu charu' },
  { name: 'VEGETABLE WASTE', category: 'Lilu charu' },
  // Dhaan
  { name: 'KAPAS KHOD', category: 'Dhaan' },
  { name: 'MAKAI KHOD', category: 'Dhaan' },
  { name: 'READYMADE FEED', category: 'Dhaan' },
  { name: 'HOMEMADE MIX', category: 'Dhaan' },
];

export const PREDEFINED_FOOD_NAMES = ALL_FOOD_ITEMS.map(item => item.name) as [string, ...string[]]; // For Zod enum
export type FoodName = typeof PREDEFINED_FOOD_NAMES[number];


export interface FeedLog {
  id: string;
  cowId: string;
  date: string; // ISOString yyyy-MM-dd
  foodName: FoodName;
  quantityKg: number;
  notes?: string; // Daily notes, will be duplicated across logs for the same day/cow
  dateAdded?: string;
  lastUpdated?: string;
}

export interface MilkLog {
  id: string;
  cowId: string;
  date: string;
  timeOfDay: 'Morning' | 'Evening';
  quantityLiters: number;
  fatPercentage?: number;
  proteinPercentage?: number;
  notes?: string;
  dateAdded?: string;
  lastUpdated?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvince?: string;
  postalCode: string;
  googleMapsPinLink?: string; // New field
  joinDate: string; // ISOString yyyy-MM-dd
  dateAdded?: string;
  lastUpdated?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  pricePerUnit: number;
  unit: 'liter' | 'kg' | 'item';
  imageUrl?: string;
  dateAdded?: string;
  lastUpdated?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number; // This is per-day quantity
  unitPrice: number;
  itemTotal?: number; // Total for this item over the entire order period
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Delivery Attempted';
export const ALL_ORDER_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Delivery Attempted'];


export interface Order {
  id:string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddressLine1?: string;
  customerAddressLine2?: string;
  customerCity?: string;
  customerPostalCode?: string;
  customerGoogleMapsPinLink?: string; // Denormalized for delivery
  orderDate: string; // yyyy-MM-dd
  deliveryDateScheduledStart: string; // yyyy-MM-dd
  deliveryDateScheduledEnd: string; // yyyy-MM-dd
  deliveryDateActual?: string; // yyyy-MM-dd
  items: OrderItem[];
  subTotal: number; // Total for the entire order period
  deliveryCharge: number; // Per-order charge
  discount: number; // Per-order discount
  grandTotal: number; // Total for the entire order period
  status: OrderStatus;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  notes?: string;
  dateAdded?: string;
  lastUpdated?: string;
}
    
