
import React, { useState } from 'react';
import { Product, ProductOrder, CustomerDetails, User, OrderDetails, Store } from '../types';
import OrderForm from './OrderForm';
import OrderHistory from './OrderHistory';

interface CustomerDashboardProps {
  products: Product[];
  onPlaceOrder: (customer: CustomerDetails, products: ProductOrder[]) => void;
  currentUser: User | null;
  orders: OrderDetails[];
  onLoginRequest: () => void;
  currentStore?: Store | null;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  products, 
  onPlaceOrder, 
  currentUser, 
  orders,
  onLoginRequest,
  currentStore
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');

  // Filter orders for the specific user
  const myOrders = currentUser 
    ? orders.filter(o => o.userId === currentUser.id).sort((a, b) => (b.orderId > a.orderId ? 1 : -1)) 
    : [];

  const isStoreActive = currentStore?.isActive !== false;

  return (
    <div className="w-full">
        {/* Navigation Tabs (Only visible if logged in) */}
        {currentUser && (
             <div className="flex justify-center mb-10">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 inline-flex">
                    <button 
                        onClick={() => setActiveTab('shop')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'shop' 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'text-slate-400 hover:text-slate-800'
                        }`}
                    >
                        Shopping
                    </button>
                    <button 
                         onClick={() => setActiveTab('history')}
                         className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'history' 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'text-slate-400 hover:text-slate-800'
                        }`}
                    >
                        My History
                        {myOrders.length > 0 && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'history' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {myOrders.length}
                            </span>
                        )}
                    </button>
                </div>
             </div>
        )}

        {/* Content Area */}
        <div className="min-h-[400px]">
            {activeTab === 'shop' ? (
                 <OrderForm 
                    products={products} 
                    onPlaceOrder={onPlaceOrder} 
                    currentUser={currentUser} 
                    onLoginRequest={onLoginRequest}
                    isStoreActive={isStoreActive}
                />
            ) : (
                <div className="max-w-2xl mx-auto">
                     <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-900">Order History</h2>
                        <p className="text-slate-500">View and track your previous purchases.</p>
                     </div>
                     <OrderHistory orders={myOrders} />
                </div>
            )}
        </div>
        
        {/* Helper message if not logged in and trying to see history (though tab is hidden) */}
        {activeTab === 'history' && !currentUser && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                 <div className="text-4xl mb-4">🔐</div>
                 <p className="text-slate-600 mb-6 font-medium">Please login to view your secure order history.</p>
                 <button 
                    onClick={onLoginRequest} 
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors"
                 >
                    Login Now
                 </button>
            </div>
        )}
    </div>
  );
};

export default CustomerDashboard;
