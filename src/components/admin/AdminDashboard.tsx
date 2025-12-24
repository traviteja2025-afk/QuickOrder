
import React, { useState, useEffect } from 'react';
import { Product, OrderDetails, OrderStatus, User, Store } from '../../types';
import AddProductForm from './AddProductForm';
import { createStore, deleteStore, getAllStores } from '../../services/adminService';
import firebase from '../../services/firebaseConfig';

interface AdminDashboardProps {
    currentStore: Store | null;
    products: Product[];
    orders: OrderDetails[];
    currentUser: User | null;
    onUpdateStoreSettings: (settings: Store) => void;
    onAddProduct: (newProductData: Omit<Product, 'id' | 'storeId'>) => void;
    onUpdateProduct: (updatedProduct: Product) => void;
    onDeleteProduct: (productId: number | string) => void;
    onUpdateOrderStatus: (firestoreId: string, status: OrderStatus, additionalData?: any) => void;
    onDeleteOrder: (firestoreId: string) => void;
    onNavigateToStore: (storeId: string) => void;
    onClearStoreSelection?: () => void;
}

const SellerStoreSelector: React.FC<{ storeIds: string[], onSelect: (id: string) => void }> = ({ storeIds, onSelect }) => {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchManagedStores = async () => {
            const all = await getAllStores();
            const filtered = all.filter(s => storeIds.includes(s.storeId));
            setStores(filtered);
            setLoading(false);
        };
        fetchManagedStores();
    }, [storeIds]);

    if (loading) return <div className="py-12 text-center animate-pulse">Loading your stores...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-slate-900 mb-2">Merchant Dashboard</h2>
                <p className="text-slate-500">Select a store to manage your products and orders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {stores.map(store => (
                    <div 
                        key={store.storeId} 
                        onClick={() => onSelect(store.storeId)}
                        className="group bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 cursor-pointer hover:shadow-2xl hover:border-primary/50 transition-all transform hover:-translate-y-2 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m-5 10v.01M9 17v.01M9 14v.01M12 17v.01M12 14v.01M15 17v.01M15 14v.01M12 11v.01M12 7v.01M15 7v.01" />
                             </svg>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-lg">
                                {store.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{store.name}</h3>
                                <p className="text-sm text-slate-500 font-mono">@{store.storeId}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${store.isActive !== false ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {store.isActive !== false ? 'Active' : 'Paused'}
                                </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

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
        if (window.confirm("Are you sure you want to permanently delete this order?")) {
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

    const renderActions = () => {
        switch(order.status) {
            case 'pending':
                return (
                    <div className="flex gap-2 justify-end mt-2">
                         <button onClick={() => onUpdateStatus(order.firestoreId!, 'paid')} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">Mark Paid</button>
                         <button onClick={() => onUpdateStatus(order.firestoreId!, 'cancelled')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300">Cancel</button>
                    </div>
                );
            case 'paid':
                return (
                    <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => onUpdateStatus(order.firestoreId!, 'confirmed')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Confirm</button>
                    </div>
                );
            case 'confirmed':
                return (
                    <div className="mt-2 text-right">
                        {showTrackingForm ? (
                            <div className="flex gap-2 items-center justify-end">
                                <input 
                                    type="text" 
                                    placeholder="Tracking No." 
                                    value={trackingInput} 
                                    onChange={(e) => setTrackingInput(e.target.value)}
                                    className="border rounded px-2 py-1 text-sm w-32"
                                />
                                <button onClick={handleShip} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
                                <button onClick={() => setShowTrackingForm(false)} className="px-2 py-1 text-slate-500 text-xs hover:underline">X</button>
                            </div>
                        ) : (
                            <button onClick={() => setShowTrackingForm(true)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Mark Shipped</button>
                        )}
                    </div>
                );
            case 'shipped':
                return (
                     <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => onUpdateStatus(order.firestoreId!, 'delivered')} className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700">Mark Delivered</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-slate-50 relative group">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                     {renderBadge()}
                     <span className="text-xs text-slate-400 font-mono">#{order.orderId}</span>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                    <button onClick={handleDelete} className="text-slate-300 hover:text-red-500 transition-colors" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
            <div className="mt-2">
                <p className="font-semibold text-slate-800">{order.customer.name}</p>
                <div className="text-sm mt-1">{order.status === 'shipped' && `Tracking: ${order.trackingNumber}`}</div>
            </div>
            <div className="mt-3 pt-3 border-t">
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

const RootAdminView: React.FC<{ onNavigateToStore: (id: string) => void }> = ({ onNavigateToStore }) => {
    const [stores, setStores] = useState<Store[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newStore, setNewStore] = useState({ shopName: '', ownerEmail: '', ownerPhone: '', vpa: '', merchantName: '' });

    useEffect(() => { loadStores(); }, []);
    const loadStores = async () => { setStores(await getAllStores()); };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const shopId = newStore.shopName.trim();
        if (!/^[a-zA-Z0-9]+$/.test(shopId)) {
            return alert("Shop Name/ID must be alphanumeric and contain no spaces.");
        }
        try {
            const existing = stores.find(s => s.storeId.toLowerCase() === shopId.toLowerCase());
            if (existing) return alert("A shop with this name already exists. Please choose a unique name.");

            await createStore({
                storeId: shopId,
                name: shopId,
                ownerEmail: newStore.ownerEmail,
                ownerPhone: newStore.ownerPhone,
                vpa: newStore.vpa,
                merchantName: newStore.merchantName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true
            });
            setIsCreating(false);
            setNewStore({ shopName: '', ownerEmail: '', ownerPhone: '', vpa: '', merchantName: '' });
            loadStores();
        } catch (err) {
            console.error(err);
            alert("Error creating store.");
        }
    };

    const handleDelete = async (id: string) => {
        if(window.confirm(`Delete store ${id} AND ALL its data?`)) {
            await deleteStore(id);
            loadStores();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-900">Root Admin: Manage Stores</h2>
                <button onClick={() => setIsCreating(!isCreating)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-slate-800 transition-all">
                    {isCreating ? 'Cancel' : 'Create New Store'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-lg space-y-4 border border-slate-200 animate-slide-down">
                    <h3 className="font-bold text-lg text-slate-800">New Store Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Shop Name / ID (No Spaces)</label>
                            <input 
                                type="text" 
                                placeholder="e.g. TejaShop2024" 
                                value={newStore.shopName} 
                                onChange={e => setNewStore({...newStore, shopName: e.target.value.replace(/\s/g, '')})} 
                                className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                                required 
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner Email</label>
                             <input type="email" placeholder="owner@gmail.com" value={newStore.ownerEmail} onChange={e=>setNewStore({...newStore, ownerEmail: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner Phone</label>
                             <input type="tel" placeholder="9876543210" value={newStore.ownerPhone} onChange={e=>setNewStore({...newStore, ownerPhone: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">UPI VPA</label>
                             <input type="text" placeholder="shop@upi" value={newStore.vpa} onChange={e=>setNewStore({...newStore, vpa: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg" required />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Merchant UPI Name (Legal)</label>
                             <input type="text" placeholder="Teja Enterprises" value={newStore.merchantName} onChange={e=>setNewStore({...newStore, merchantName: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg" required />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-lg shadow-lg hover:bg-primary-600 transition-all transform active:scale-95">
                        Create Store
                    </button>
                </form>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(store => (
                    <div key={store.storeId} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
                        <div>
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-xl text-slate-800 break-all">{store.name}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${store.isActive !== false ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'}`}>
                                    {store.isActive !== false ? 'Active' : 'Paused'}
                                </span>
                            </div>
                            <div className="mt-4 text-sm text-slate-600 space-y-1">
                                <p><span className="font-semibold text-slate-400">Owner:</span> {store.ownerEmail || store.ownerPhone || 'N/A'}</p>
                                <p><span className="font-semibold text-slate-400">VPA:</span> {store.vpa}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-2">
                            <button onClick={() => onNavigateToStore(store.storeId)} className="flex-1 bg-slate-100 text-slate-800 font-bold py-2 rounded-lg text-sm hover:bg-slate-200 transition-colors">Open Dashboard</button>
                            <button onClick={() => handleDelete(store.storeId)} className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-100 transition-colors" title="Delete Store">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
                {stores.length === 0 && !isCreating && (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400">No stores found. Click "Create New Store" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StoreSettingsForm: React.FC<{ 
    settings: Store, 
    onSave: (s: Store) => void, 
    onBackToSelection?: () => void,
    backLabel?: string
}> = ({ settings, onSave, onBackToSelection, backLabel }) => {
    const [formData, setFormData] = useState(settings);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => { setFormData(settings); }, [settings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setIsExpanded(false);
    };

    return (
        <div className={`bg-white p-6 rounded-xl shadow-lg border-2 transition-colors ${formData.isActive !== false ? 'border-primary/20' : 'border-red-200 bg-red-50/10'}`}>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className={`p-2 rounded-lg ${formData.isActive !== false ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h.01M9 20h.01M3 20h.01M3 17h.01M9 17h.01M9 14h.01M3 14h.01M9 11h.01M3 11h.01M15 20h6M15 17h6M15 14h6M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Store Configuration ({formData.name})</h2>
                        <p className={`text-xs font-bold ${formData.isActive !== false ? 'text-primary' : 'text-red-600'}`}>
                            Status: {formData.isActive !== false ? 'Accepting Orders' : 'Paused'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onBackToSelection && (
                        <button 
                            onClick={onBackToSelection}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {backLabel || 'Switch Store'}
                        </button>
                    )}
                    <button className="text-slate-400 p-1" type="button" onClick={() => setIsExpanded(!isExpanded)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
             </div>

             {isExpanded && (
                 <form onSubmit={handleSubmit} className="mt-6 space-y-6 animate-fade-in border-t pt-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                            <h4 className="font-bold text-slate-800">Order Acceptance</h4>
                            <p className="text-xs text-slate-500">Temporarily stop customers from placing new orders.</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, isActive: formData.isActive === false})}
                            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isActive !== false ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive !== false ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Display Name (Matches Shop ID)</label>
                            <input type="text" value={formData.name} readOnly className="w-full px-3 py-2 border rounded bg-slate-50 text-slate-400 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Merchant UPI ID (VPA)</label>
                            <input type="text" value={formData.vpa} onChange={e => setFormData({...formData, vpa: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Merchant UPI Legal Name</label>
                            <input type="text" value={formData.merchantName} onChange={e => setFormData({...formData, merchantName: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                        </div>
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-600 shadow-md transition-all">
                        Update Store Settings
                    </button>
                 </form>
             )}
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { 
        currentStore, 
        products, 
        orders, 
        currentUser,
        onNavigateToStore,
        onUpdateStoreSettings,
        onAddProduct, 
        onUpdateProduct, 
        onDeleteProduct, 
        onUpdateOrderStatus, 
        onDeleteOrder,
        onClearStoreSelection
    } = props;

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    // Root Admin View (Management of all stores)
    if (currentUser?.role === 'root' && !currentStore) {
        return <RootAdminView onNavigateToStore={onNavigateToStore} />;
    }

    // Seller View: Multiple stores owned by merchant?
    if (currentUser?.role === 'seller' && !currentStore) {
        if (currentUser.managedStoreIds && currentUser.managedStoreIds.length > 0) {
            return (
                <SellerStoreSelector 
                    storeIds={currentUser.managedStoreIds} 
                    onSelect={onNavigateToStore} 
                />
            );
        }
        return <div className="text-center py-20 text-slate-400">No stores linked to your account.</div>;
    }

    if (!currentStore) {
        return <div className="text-center py-10 text-slate-400 font-medium">Please select or manage a store.</div>;
    }

    const handleUpdate = (updatedProduct: Product) => { onUpdateProduct(updatedProduct); setEditingProduct(null); };

    const activeOrders = orders.filter(o => ['pending', 'paid', 'confirmed', 'shipped'].includes(o.status));
    const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

    // Logic to show the back button:
    // 1. Root admin in a specific shop always sees it.
    // 2. Seller with multiple stores sees it.
    const showBackButton = currentUser?.role === 'root' || (currentUser?.role === 'seller' && currentUser.managedStoreIds && currentUser.managedStoreIds.length > 1);
    const backButtonLabel = currentUser?.role === 'root' ? 'Back to Store Management' : 'Switch Store';

    return (
        <div className="space-y-12">
            <StoreSettingsForm 
                settings={currentStore} 
                onSave={onUpdateStoreSettings} 
                onBackToSelection={showBackButton ? () => {
                    if (onClearStoreSelection) onClearStoreSelection();
                } : undefined}
                backLabel={backButtonLabel}
            />

            <AddProductForm
                key={editingProduct ? `edit-${editingProduct.id}` : productToDelete ? `delete-${productToDelete.id}` : 'add-new'}
                onAddProduct={onAddProduct}
                productToEdit={editingProduct}
                productToDelete={productToDelete}
                onUpdateProduct={handleUpdate}
                onCancelEdit={() => setEditingProduct(null)}
                onConfirmDelete={(id) => { onDeleteProduct(id); setProductToDelete(null); }}
                onCancelDelete={() => setProductToDelete(null)}
            />

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">Order Management</h2>
                <div className="flex gap-4 mb-6 border-b border-slate-100">
                    <button onClick={() => setActiveTab('active')} className={`pb-2 px-4 font-semibold ${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700 transition-colors'}`}>Active ({activeOrders.length})</button>
                    <button onClick={() => setActiveTab('completed')} className={`pb-2 px-4 font-semibold ${activeTab === 'completed' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700 transition-colors'}`}>History ({completedOrders.length})</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === 'active' ? activeOrders : completedOrders).map(order => (
                        <OrderCard key={order.orderId} order={order} onUpdateStatus={onUpdateOrderStatus} onDeleteOrder={onDeleteOrder} />
                    ))}
                    {(activeTab === 'active' ? activeOrders : completedOrders).length === 0 && <p className="col-span-full text-center text-slate-500 py-8 italic">No orders in this section.</p>}
                </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">Manage Inventory</h2>
                {products.length > 0 ? (
                    <div className="space-y-4">
                        {products.map(product => (
                            <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-slate-50 hover:bg-slate-100/50 transition-colors">
                                <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0 shadow-sm" />
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-slate-800">{product.name}</h4>
                                    <p className="text-md font-bold text-primary">₹{product.price.toFixed(2)}</p>
                                    <p className="text-xs text-slate-400">Unit: {product.unit}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 gap-2">
                                    <button onClick={() => { setEditingProduct(product); setProductToDelete(null); window.scrollTo({top:0, behavior:'smooth'}); }} className="px-4 py-2 text-sm font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                                    <button onClick={() => { setProductToDelete(product); setEditingProduct(null); window.scrollTo({top:0, behavior:'smooth'}); }} className="px-4 py-2 text-sm font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">No products yet.</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
