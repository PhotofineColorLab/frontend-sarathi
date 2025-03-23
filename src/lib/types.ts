// User Types
export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  password?: string; // Add password field for staff login
  createdAt: Date;
}

// Product Types
export type ProductCategory = 
  | 'fans' 
  | 'lights' 
  | 'switches' 
  | 'sockets' 
  | 'wires' 
  | 'conduits'
  | 'mcbs'
  | 'panels'
  | 'tools'
  | 'accessories';

export interface Product {
  id?: string;
  _id?: string; // MongoDB ID
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export type OrderStatus = 'pending' | 'dc' | 'invoice' | 'dispatched';
export type PaymentCondition = 'immediate' | 'days15' | 'days30';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export interface OrderItem {
  id?: string;
  _id?: string; // MongoDB ID
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  id?: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderItems: OrderItem[];
  items?: OrderItem[]; // For backward compatibility
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentCondition?: PaymentCondition;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderImage?: string;
  dispatchDate?: string;
  scheduledDate?: string;
  assignedTo?: string;
  isPaid?: boolean;
  paidAt?: string | Date;
}

// Analytics Types
export interface SalesByCategory {
  category: ProductCategory;
  amount: number;
}

export interface SalesByPeriod {
  date: string;
  amount: number;
}

export interface AnalyticsSummary {
  totalOrders: number;
  totalSales: number;
  averageOrderValue: number;
  pendingOrders: number;
}
