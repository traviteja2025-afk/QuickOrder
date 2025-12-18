
import React, { useState, useEffect } from 'react';
import { Product, ProductOrder, CustomerDetails, User } from '../types';
import ProductCard from './ProductCard';

interface OrderFormProps {
  products: Product[];
  onPlaceOrder: (customer: CustomerDetails, products: ProductOrder[]) => void;
  currentUser?: User | null;
  onLoginRequest?: () => void;
  isStoreActive?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ products, onPlaceOrder, currentUser, onLoginRequest, isStoreActive = true }) => {
  const [step, setStep] = useState<'shopping' | 'checkout'>('shopping');
  const [customer, setCustomer] = useState<CustomerDetails>({ name: '', address: '', contact: '' });
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    // Only initialize/reset if we have products and no cart yet
    if (productOrders.length === 0) {
        setProductOrders(products.map(p => ({ product: p, quantity: 0 })));
    }
  }, [products]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (currentUser) {
        setCustomer(prev => ({
            ...prev,
            name: currentUser.name || '',
            contact: currentUser.phoneNumber || '',
        }));
    }
  }, [currentUser]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleQuantityChange = (productId: number | string, newQuantity: number) => {
    if (!isStoreActive) return;
    setProductOrders(prevOrders =>
      prevOrders.map(order =>
        order.product.id === productId ? { ...order, quantity: Math.max(0, newQuantity) } : order
      )
    );
  };
  
  const validateForm = () => {
    if (!customer.name.trim()) return "Please enter your full name.";
    if (!customer.address.trim()) return "Please enter your shipping address.";
    if (!/^\d{10}$/.test(customer.contact)) return "Please enter a valid 10-digit contact number.";
    return "";
  }

  const handleProceedToCheckout = () => {
    const orderedProducts = productOrders.filter(p => p.quantity > 0);
    if (orderedProducts.length === 0) {
        setError("Your cart is empty. Please add items first.");
        return;
    }
    setError('');
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStoreActive) {
        setError("This store is currently not accepting orders.");
        return;
    }

    if (!currentUser) {
        if (onLoginRequest) onLoginRequest();
        else setError("You must be logged in to place an order.");
        return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    const orderedProducts = productOrders.filter(p => p.quantity > 0);
    onPlaceOrder(customer, orderedProducts);
  };
  
  const totalAmount = productOrders.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = productOrders.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProductOrders = productOrders.filter(order => 
    order.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- STEP 1: SHOPPING GRID ---
  if (step === 'shopping') {
      return (
        <div className="animate-fade-in pb-24">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Our Menu</h2>
                <p className="text-slate-500">Add items to your cart and pay instantly with UPI.</p>
                
                {/* Search Bar */}
                <div className="mt-6 relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {!isStoreActive && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-red-800 font-bold">Orders Temporarily Paused</p>
                        <p className="text-red-600 text-xs">Browse our items, but checking out is currently disabled.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProductOrders.length > 0 ? (
                    filteredProductOrders.map(order => (
                        <ProductCard key={order.product.id} order={order} onQuantityChange={handleQuantityChange} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="text-4xl mb-4">🔍</div>
                        <p className="text-slate-500 font-medium">No matches found for "{searchTerm}"</p>
                    </div>
                )}
            </div>

            {/* Sticky Floating Cart Bar */}
            {totalItems > 0 && (
                <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto z-50 animate-slide-up">
                    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-lg bg-opacity-95">
                        <div className="flex items-center gap-4 pl-3">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                                    {totalItems}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-80">Total Amount</p>
                                <p className="text-lg font-black tracking-tight">₹{totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleProceedToCheckout}
                            disabled={!isStoreActive}
                            className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all transform active:scale-95 ${
                                !isStoreActive 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                : 'bg-primary hover:bg-white hover:text-primary text-white shadow-lg'
                            }`}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // --- STEP 2: CHECKOUT (DETAILS FORM) ---
  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
        <button 
            onClick={() => setStep('shopping')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shopping
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-8 text-white">
                <h2 className="text-3xl font-black mb-2">Checkout</h2>
                <p className="text-slate-400 text-sm">Review your items and provide delivery details.</p>
            </div>

            <div className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Order Review List */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-black text-slate-500">1</span>
                            Review Your Items
                        </h3>
                        <div className="bg-slate-50 rounded-2xl p-4 divide-y divide-slate-200">
                            {productOrders.filter(p => p.quantity > 0).map(item => (
                                <div key={item.product.id} className="py-3 flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-white p-1 overflow-hidden border">
                                            <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{item.product.name}</p>
                                            <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-slate-700">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                            <div className="pt-4 mt-2 flex justify-between items-center text-lg">
                                <span className="font-bold text-slate-500">Order Total</span>
                                <span className="font-black text-primary">₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Details Form */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                             <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-black text-slate-500">2</span>
                             Delivery Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                <input type="text" name="name" value={customer.name} onChange={handleCustomerChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-semibold" placeholder="Enter your full name" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shipping Address</label>
                                <textarea name="address" value={customer.address} onChange={handleCustomerChange} rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-semibold" placeholder="Building, Street, Area, City" required></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                                <input type="tel" name="contact" value={customer.contact} onChange={handleCustomerChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-semibold" placeholder="10-digit mobile number" required />
                            </div>
                        </div>
                    </div>

                    {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-shake">{error}</div>}

                    <div className="pt-6">
                        {currentUser ? (
                            <button type="submit" className="w-full bg-primary hover:bg-primary-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 text-lg uppercase tracking-wider flex items-center justify-center gap-3">
                                <span>Complete Order</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        ) : (
                            <button type="button" onClick={onLoginRequest} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 text-lg uppercase tracking-wider flex items-center justify-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                <span>Login to Complete Order</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default OrderForm;
