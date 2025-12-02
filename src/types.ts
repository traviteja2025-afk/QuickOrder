
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
  createdAt?: any;
}

export interface UpiDetails {
  vpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: 'admin' | 'customer';
  avatar?: string;
}

export type View = 'landing' | 'customer' | 'admin';
