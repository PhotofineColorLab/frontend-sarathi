// User Types
export type UserRole = 'admin' | 'staff' | 'executive';

export interface User {
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  password?: string; // Add password field for staff login
  createdAt?: string;
  attendance?: {
    date: string;
    isPresent: boolean;
    remarks?: string;
  }[];
}

export interface Staff extends User {
  password?: string;
  attendance?: AttendanceRecord[];
}

export interface AttendanceRecord {
  date: string;
  isPresent: boolean;
  remarks?: string;
}

export type ProductDimension = 'Bag' | 'Bundle' | 'Box' | 'Coils' | 'Dozen' | 'Ft' | 'Gross' | 'Kg' | 'Mtr' | 'Pc' | 'Pkt' | 'Set' | 'Not Applicable';

export interface Product {
  id?: string;
  _id?: string; // MongoDB ID
  name: string;
  price: number;
  stock: number;
  dimension?: ProductDimension;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export type OrderStatus = 'pending' | 'dc' | 'invoice' | 'dispatched';
export type PaymentCondition = 'immediate' | 'days15' | 'days30';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type OrderPriority = 'high' | 'medium' | 'low';

export interface OrderItem {
  id?: string;
  _id?: string; // MongoDB ID
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  dimension?: ProductDimension;
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
  priority?: OrderPriority;
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
