
export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  unit: string;
}

export interface ProductOrder {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  address: string;
  contact: string;
}

export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderDetails {
  firestoreId?: string; // Internal Firestore Document ID
  userId?: string; // Link order to a registered user
  customer: CustomerDetails;
  products: ProductOrder[];
  totalAmount: number;
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
  paymentId?: string; // Added for payment tracking
  createdAt?: any;
}

export interface UpiDetails {
  vpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  transactionRef: string; // Added: Mandatory for Intent Flow tracking
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: 'admin' | 'customer';
  avatar?: string;
}

export interface StoreSettings {
  merchantVpa: string;
  merchantName: string;
}

export type View = 'landing' | 'customer' | 'admin';
