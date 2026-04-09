export type UserRole = 'admin' | 'caissier' | 'serveur';
export type OrderStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentMethod = 'especes' | 'mobile_money' | 'carte';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  email?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string | null;
  image_url?: string;
  available: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  notes: string;
  created_at: string;
}

export interface Order {
  id: string;
  _id?: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  payment_method: PaymentMethod | null;
  amount_paid: number;
  change_amount: number;
  notes: string;
  table_number: string;
  created_by: string | null;
  created_at?: string;
  createdAt?: string;
  completed_at?: string | null;
  completedAt?: string | null;
  order_items?: OrderItem[];
  profile?: Profile;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

export interface DashboardStats {
  today_revenue: number;
  today_orders: number;
  month_revenue: number;
  month_orders: number;
}
