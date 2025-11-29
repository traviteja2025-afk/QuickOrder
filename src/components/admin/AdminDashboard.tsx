
import React, { useState } from 'react';
import { Product, OrderDetails } from '../../types';
import AddProductForm from './AddProductForm';

interface AdminDashboardProps {
    products: Product[];
    orders: OrderDetails[];
    onAddProduct: (newProductData: Omit<Product, 'id'>) => void;
    onUpdateProduct: (updatedProduct: Product) => void;
    onDeleteProduct: (productId: number | string) => void;
    onConfirmPayment: (orderId: string) => void;
}

const OrderCard: React.FC<{ order: OrderDetails, onConfirm?: (id: string) => void }> = ({ order, onConfirm }) => (
    <div className="p-4 border rounded-lg bg-slate-50">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold text-slate-800">{order.customer.name}</p>
                <p className="text-sm text-slate-500">{order.customer.address}</p>
                <p className="text-sm text-slate-500">{order.customer.contact}</p>
                <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded mt-1 inline-block">{order.orderId}</span>
            </div>
            <div className="text-right">
                <p className="text-lg font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                {order.status === 'pending' && onConfirm && (
                    <button 
                        onClick={() => onConfirm(order.orderId)}
                        className="mt-2 px-3 py-1 text-sm font-semibold rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                        Confirm Payment
                    </button>
                )}
                 {order.status === 'confirmed' && (
                    <span className="mt-2 inline-flex items-center px-3 py-1 text-sm font-semibold rounded-md bg-blue-100 text-blue-700">
                        ✓ Confirmed
                    </span>
                )}
            </div>
        </div>
        <div className="mt-3 pt-3 border-t">
            <h5 className="text-sm font-semibold text-slate-600 mb-1">Items:</h5>
            <ul className="text-xs text-slate-600 space-y-1">
                {order.products.map(item => (
                    <li key={item.product.id} className="flex justify-between">
                        <span>{item.product.name} x{item.quantity}</span>
                        <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, orders, onAddProduct, onUpdateProduct, onDeleteProduct, onConfirmPayment }) => {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleUpdate = (updatedProduct: Product) => {
        onUpdateProduct(updatedProduct);
        setEditingProduct(null); // Exit edit mode
    };

    const pendingOrders = orders.filter(o => o.status === 'pending').sort((a, b) => b.orderId.localeCompare(a.orderId));
    const confirmedOrders = orders.filter(o => o.status === 'confirmed').sort((a, b) => b.orderId.localeCompare(a.orderId));
    
    return (
        <div className="space-y-12">
            <AddProductForm
                key={editingProduct ? editingProduct.id : 'add-new'} // Force re-render on edit change
                onAddProduct={onAddProduct}
                productToEdit={editingProduct}
                onUpdateProduct={handleUpdate}
                onCancelEdit={() => setEditingProduct(null)}
            />

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">Order Management</h2>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Pending Orders ({pendingOrders.length})</h3>
                        {pendingOrders.length > 0 ? (
                            <div className="space-y-4">
                                {pendingOrders.map(order => (
                                    <OrderCard key={order.orderId} order={order} onConfirm={onConfirmPayment} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">No pending orders.</p>
                        )}
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Confirmed Orders ({confirmedOrders.length})</h3>
                         {confirmedOrders.length > 0 ? (
                            <div className="space-y-4">
                                {confirmedOrders.map(order => (
                                    <OrderCard key={order.orderId} order={order} />
                                ))}
                            </div>
                        ) : (
                             <p className="text-slate-500 text-center py-4">No orders have been confirmed yet.</p>
                        )}
                    </div>
                </div>

            </div>

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
                                        onClick={() => setEditingProduct(product)}
                                        className="px-3 py-1 text-sm font-semibold rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                                onDeleteProduct(product.id);
                                            }
                                        }}
                                        className="px-3 py-1 text-sm font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
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