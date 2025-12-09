
import React, { useState, useEffect } from 'react';
import { Product, OrderDetails, OrderStatus, User, StoreSettings } from '../../types';
import AddProductForm from './AddProductForm';
import { getAdmins, addAdmin, removeAdmin } from '../../services/adminService';

interface AdminDashboardProps {
    products: Product[];
    orders: OrderDetails[];
    currentUser: User | null;
    storeSettings: StoreSettings;
    onUpdateStoreSettings: (settings: StoreSettings) => void;
    onAddProduct: (newProductData: Omit<Product, 'id'>) => void;
    onUpdateProduct: (updatedProduct: Product) => void;
    onDeleteProduct: (productId: number | string) => void;
    onUpdateOrderStatus: (firestoreId: string, status: OrderStatus, additionalData?: any) => void;
    onDeleteOrder: (firestoreId: string) => void;
}

// Order Card Component with Logic for each Stage
const OrderCard: React.FC<{ 
    order: OrderDetails, 
    onUpdateStatus: (id: string, status: OrderStatus, data?: any) => void,
    onDeleteOrder: (id: string) => void
}> = ({ order, onUpdateStatus, onDeleteOrder }) => {
    const [trackingInput, setTrackingInput] = useState('');
    const [showTrackingForm, setShowTrackingForm] = useState(false);

    if (!order.firestoreId) return null;

    const handleShip = () => {
        if (!trackingInput.trim()) return alert("Please enter tracking number");
        onUpdateStatus(order.firestoreId!, 'shipped', { trackingNumber: trackingInput });
        setShowTrackingForm(false);
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to permanently delete this order? This cannot be undone.")) {
            onDeleteOrder(order.firestoreId!);
        }
    };

    const renderBadge = () => {
        switch(order.status) {
            case 'pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">New Order</span>;
            case 'paid': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Paid</span>;
            case 'confirmed': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>;
            case 'shipped': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Shipped</span>;
            case 'delivered': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Delivered</span>;
            case 'cancelled': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
        }
    };

    const renderStatusText = () => {
        switch(order.status) {
            case 'pending': return <span className="text-orange-600 font-semibold">Awaiting Payment</span>;
            case 'paid': return <span className="text-yellow-600 font-semibold">Payment Received – Confirm Order</span>;
            case 'confirmed': return <span className="text-green-600 font-semibold">Ready to Pack</span>;
            case 'shipped': return <span className="text-blue-600 font-semibold">Tracking: {order.trackingNumber}</span>;
            case 'delivered': return <span className="text-slate-600 font-semibold">Completed</span>;
            case 'cancelled': return <span className="text-red-600 font-semibold">Order Cancelled</span>;
        }
    };

    const renderActions = () => {
        switch(order.status) {
            case 'pending':
                return (
                    <div className="flex gap-2 justify-end mt-2">
                         <button onClick={() => onUpdateStatus(order.firestoreId!, 'paid')} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">Mark Payment Received</button>
                         <button onClick={() => onUpdateStatus(order.firestoreId!, 'cancelled')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300">Cancel</button>
                    </div>
                );
            case 'paid':
                return (
                    <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => onUpdateStatus(order.firestoreId!, 'confirmed')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Confirm Order</button>
                    </div>
                );
            case 'confirmed':
                return (
                    <div className="mt-2">
                        {showTrackingForm ? (
                            <div className="flex gap-2 items-center justify-end">
                                <input 
                                    type="text" 
                                    placeholder="Enter Tracking No." 
                                    value={trackingInput} 
                                    onChange={(e) => setTrackingInput(e.target.value)}
                                    className="border rounded px-2 py-1 text-sm w-40"
                                />
                                <button onClick={handleShip} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Save</button>
                                <button onClick={() => setShowTrackingForm(false)} className="px-2 py-1 text-slate-500 text-xs hover:underline">Cancel</button>
                            </div>
                        ) : (
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowTrackingForm(true)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Mark Shipped</button>
                            </div>
                        )}
                    </div>
                );
            case 'shipped':
                return (
                     <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => setShowTrackingForm(!showTrackingForm)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">Edit Tracking</button>
                         {showTrackingForm && (
                             <div className="flex gap-2 items-center">
                                 <input value={trackingInput} onChange={e=>setTrackingInput(e.target.value)} placeholder="New Tracking" className="border px-1 w-24 text-sm"/>
                                 <button onClick={handleShip} className="text-xs bg-blue-600 text-white px-2 rounded">Save</button>
                             </div>
                         )}
                        <button onClick={() => onUpdateStatus(order.firestoreId!, 'delivered')} className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700">Mark Delivered</button>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => onUpdateStatus(order.firestoreId!, 'pending')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300">Re-open Order</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-slate-50 relative overflow-hidden group">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                     {renderBadge()}
                     <span className="text-xs text-slate-400 font-mono">#{order.orderId}</span>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                    <button 
                        onClick={handleDelete} 
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete Order"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mt-2">
                <p className="font-semibold text-slate-800">{order.customer.name}</p>
                <div className="text-sm mt-1">{renderStatusText()}</div>
            </div>

            <div className="mt-3 pt-3 border-t">
                <h5 className="text-sm font-semibold text-slate-600 mb-1">Order Details</h5>
                <p className="text-xs text-slate-500 mb-1">{order.customer.address}, {order.customer.contact}</p>
                <ul className="text-xs text-slate-600 space-y-1">
                    {order.products.map(item => (
                        <li key={item.product.id} className="flex justify-between">
                            <span>{item.product.name} x{item.quantity}</span>
                            <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {renderActions()}
        </div>
    );
};

const StoreSettingsForm: React.FC<{ settings: StoreSettings, onSave: (s: StoreSettings) => void }> = ({ settings, onSave }) => {
    const [formData, setFormData] = useState(settings);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => { setFormData(settings); }, [settings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setIsExpanded(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-primary/20">
             <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h.01M9 20h.01M3 20h.01M3 17h.01M9 17h.01M9 14h.01M3 14h.01M9 11h.01M3 11h.01M15 20h6M15 17h6M15 14h6M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" />
                    </svg>
                    Payment Configuration
                </h2>
                <button className="text-slate-500">
                    {isExpanded ? '▲' : '▼'}
                </button>
             </div>

             {isExpanded && (
                 <form onSubmit={handleSubmit} className="mt-4 space-y-4 animate-fade-in">
                     <p className="text-sm text-slate-500">
                         Configure your UPI details. This VPA will be used to generate dynamic QR codes and payment links for customers.
                     </p>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Merchant UPI ID (VPA)</label>
                        <input 
                            type="text" 
                            placeholder="e.g., yourname@oksbi" 
                            value={formData.merchantVpa}
                            onChange={(e) => setFormData({...formData, merchantVpa: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary border-slate-300" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Merchant Name (Display Name)</label>
                        <input 
                            type="text" 
                            placeholder="e.g., My Grocery Store" 
                            value={formData.merchantName}
                            onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary border-slate-300" 
                            required 
                        />
                    </div>
                    <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded hover:bg-primary-600 transition-colors">
                        Save Settings
                    </button>
                 </form>
             )}
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    products, 
    orders, 
    currentUser, 
    storeSettings, 
    onUpdateStoreSettings,
    onAddProduct, 
    onUpdateProduct, 
    onDeleteProduct, 
    onUpdateOrderStatus, 
    onDeleteOrder 
}) => {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [admins, setAdmins] = useState<any[]>([]);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    
    // Tab State: 'active' (Pending, Paid, Confirmed, Shipped) or 'completed' (Delivered, Cancelled)
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    // Admin management (Same as before)
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPhone, setNewAdminPhone] = useState('');
    const [newAdminName, setNewAdminName] = useState('');

    // Check if the current user is a "Super Admin" (Root Admin)
    // STRICT CHECK: Only enable for the specific owner email
    const isSuperAdmin = currentUser?.email === 't.raviteja2025@gmail.com';

    useEffect(() => { 
        if (showAdminPanel && isSuperAdmin) loadAdmins(); 
    }, [showAdminPanel, isSuperAdmin]);

    const loadAdmins = async () => { setAdmins(await getAdmins()); };
    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault(); await addAdmin(newAdminEmail, newAdminPhone, newAdminName);
        setNewAdminEmail(''); setNewAdminPhone(''); setNewAdminName(''); loadAdmins();
    };
    const handleRemoveAdmin = async (id: string) => { if(window.confirm("Remove?")) { await removeAdmin(id); loadAdmins(); }};

    const handleUpdate = (updatedProduct: Product) => { onUpdateProduct(updatedProduct); setEditingProduct(null); };

    // Handlers for managing Product state
    const handleInitiateEdit = (product: Product) => {
        setEditingProduct(product);
        setProductToDelete(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleInitiateDelete = (product: Product) => {
        setProductToDelete(product);
        setEditingProduct(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConfirmDelete = (productId: number | string) => {
        onDeleteProduct(productId);
        setProductToDelete(null);
    };

    const handleCancelDelete = () => {
        setProductToDelete(null);
    };

    // Grouping Orders
    const activeOrders = orders.filter(o => ['pending', 'paid', 'confirmed', 'shipped'].includes(o.status))
        .sort((a, b) => b.orderId.localeCompare(a.orderId));
    
    const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status))
        .sort((a, b) => b.orderId.localeCompare(a.orderId));

    return (
        <div className="space-y-12">
            
            {/* ONLY Show this button if user is Super Admin */}
            {isSuperAdmin && (
                <div className="flex justify-end">
                    <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="text-sm text-slate-500 hover:text-primary underline">
                        {showAdminPanel ? 'Hide Admin Access' : 'Manage Admin Access'}
                    </button>
                </div>
            )}

            {/* Admin Management Panel (Hidden by default, Only visible to Super Admin) */}
            {showAdminPanel && isSuperAdmin && (
                <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 className="text-xl font-bold mb-4">Manage Access (Owner Only)</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                         <div>
                            <h4 className="font-semibold mb-2 text-slate-300">Add New Admin</h4>
                            <form onSubmit={handleAddAdmin} className="space-y-3">
                                <input type="text" placeholder="Name" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-white" required />
                                <input type="email" placeholder="Google Email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-white" />
                                <div className="text-center text-xs text-slate-400">- OR -</div>
                                <input type="tel" placeholder="Phone Number" value={newAdminPhone} onChange={e => setNewAdminPhone(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-white" />
                                <button type="submit" className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-2 rounded">Grant Access</button>
                            </form>
                        </div>
                        <div>
                             <h4 className="font-semibold mb-2 text-slate-300">Existing Admins</h4>
                            <ul className="space-y-2">
                                {admins.map(admin => (
                                    <li key={admin.id} className="flex justify-between items-center bg-slate-700 p-2 rounded">
                                        <div><p className="font-bold text-sm">{admin.name}</p><p className="text-xs text-slate-400">{admin.email || admin.phone}</p></div>
                                        <button onClick={() => handleRemoveAdmin(admin.id)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Store Settings Config (Dynamic Payment Details) */}
            <StoreSettingsForm settings={storeSettings} onSave={onUpdateStoreSettings} />

            <AddProductForm
                key={editingProduct ? `edit-${editingProduct.id}` : productToDelete ? `delete-${productToDelete.id}` : 'add-new'}
                onAddProduct={onAddProduct}
                productToEdit={editingProduct}
                productToDelete={productToDelete}
                onUpdateProduct={handleUpdate}
                onCancelEdit={() => setEditingProduct(null)}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={handleCancelDelete}
            />

            {/* Order Management Section */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">Order Management</h2>
                
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-slate-100">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`pb-2 px-4 font-semibold ${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Active Orders ({activeOrders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('completed')}
                        className={`pb-2 px-4 font-semibold ${activeTab === 'completed' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Completed / History ({completedOrders.length})
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTab === 'active' ? (
                        activeOrders.length > 0 ? (
                            activeOrders.map(order => (
                                <OrderCard key={order.orderId} order={order} onUpdateStatus={onUpdateOrderStatus} onDeleteOrder={onDeleteOrder} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8 text-slate-500">No active orders right now.</div>
                        )
                    ) : (
                        completedOrders.length > 0 ? (
                            completedOrders.map(order => (
                                <OrderCard key={order.orderId} order={order} onUpdateStatus={onUpdateOrderStatus} onDeleteOrder={onDeleteOrder} />
                            ))
                        ) : (
                             <div className="col-span-full text-center py-8 text-slate-500">No completed orders history.</div>
                        )
                    )}
                </div>
            </div>

            {/* Product List Section */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">Manage Products</h2>
                {products.length > 0 ? (
                    <div className="space-y-4">
                        {products.map(product => (
                            <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-slate-50">
                                <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-slate-800">{product.name}</h4>
                                    <p className="text-sm text-slate-500">{product.description}</p>
                                    <p className="text-md font-bold text-primary">₹{product.price.toFixed(2)} / {product.unit}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                    <button 
                                        onClick={() => handleInitiateEdit(product)} 
                                        className="px-3 py-1 text-sm font-semibold rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleInitiateDelete(product)} 
                                        className="px-3 py-1 text-sm font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">You haven't added any products yet.</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
