import React from 'react';
import { OrderDetails } from '../types';

interface OrderHistoryProps {
  orders: OrderDetails[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  const getStatusColor = (status: string) => {
    switch(status) {
        case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'paid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
        case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'delivered': return 'bg-slate-100 text-slate-800 border-slate-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (order: OrderDetails) => {
      switch(order.status) {
          case 'pending': return 'Awaiting Payment';
          case 'paid': return 'Payment Verified';
          case 'confirmed': return 'Preparing';
          case 'shipped': return 'Out for Delivery';
          case 'delivered': return 'Delivered';
          case 'cancelled': return 'Cancelled';
          default: return order.status;
      }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="mx-auto h-12 w-12 text-slate-300 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900">No orders yet</h3>
        <p className="text-slate-500">Orders you place will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.orderId} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500">#{order.orderId}</span>
                    <span className="text-xs text-slate-400">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order)}
                </span>
            </div>

            {/* Body */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                     <div className="space-y-1">
                        {order.products.map((item, idx) => (
                            <div key={idx} className="text-sm text-slate-700">
                                <span className="font-medium">{item.quantity}x</span> {item.product.name}
                            </div>
                        ))}
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-slate-500">Total Amount</p>
                        <p className="text-lg font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                     </div>
                </div>

                {/* Tracking Info if available */}
                {order.status === 'shipped' && order.trackingNumber && (
                    <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                        <div>
                            <p className="text-xs text-blue-800 font-semibold uppercase">Tracking Number</p>
                            <p className="font-mono text-sm text-blue-900">{order.trackingNumber}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;