
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
  storeId: string; // Link order to a specific store
  userId?: string; // Link order to a registered user
  customer: CustomerDetails;
  products: ProductOrder[];
  totalAmount: number;
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
  paymentId?: string; // Added for Razorpay payment tracking
  createdAt?: any;
}

export interface UpiDetails {
  vpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  transactionRef: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: 'root' | 'seller' | 'customer';
  managedStoreIds?: string[];
  avatar?: string;
}

export interface Store {
  storeId: string; // Unique URL slug (e.g., 'teja-shop')
  name: string;
  ownerEmail?: string;
  ownerPhone?: string;
  vpa: string;
  merchantName: string; // For UPI context
  createdAt: any;
  isActive?: boolean; // New field for pausing orders
}

export interface StoreSettings {
    merchantVpa: string;
    merchantName: string;
}

export type View = 'landing' | 'customer' | 'admin';
