
export interface Product {
  id: number | string; // Updated to accept Firestore String IDs
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

export interface OrderDetails {
  customer: CustomerDetails;
  products: ProductOrder[];
  totalAmount: number;
  orderId: string;
  status: 'pending' | 'confirmed';
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