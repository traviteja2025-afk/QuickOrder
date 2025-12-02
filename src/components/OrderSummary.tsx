import React from 'react';
import { OrderDetails } from '../types';
import QrCodeWrapper from './QrCodeWrapper';

interface OrderSummaryProps {
  orderDetails: OrderDetails;
  paymentUrl: string;
  onNewOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderDetails, paymentUrl, onNewOrder }) => {
  
  const renderStatusUI = () => {
    switch(orderDetails.status) {
        case 'pending':
            return (
                <div className="animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-3xl font-bold text-slate-900 mt-4">Order Placed!</h2>
                    <p className="text-slate-500 mt-2 mb-6">Scan the QR code with any UPI app to pay.</p>
                    
                    <div className="my-8 flex justify-center">
                        <QrCodeWrapper value={paymentUrl} />
                    </div>
                    
                    <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold animate-pulse">
                        Status: Awaiting Payment
                    </div>
                </div>
            );
        
        case 'paid':
            return (
                <div className="animate-fade-in">
                    <div className="mx-auto h-16 w-16 border-4 border-slate-200 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                    <h2 className="text-3xl font-bold text-slate-900 mt-4">Payment Received!</h2>
                    <p className="text-slate-500 mt-2 mb-6">We have received your payment and are verifying it.</p>
                     <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                        Status: Payment Verified
                    </div>
                </div>
            );

        case 'confirmed':
            return (
                <div className="animate-fade-in">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-slate-900 mt-4">Order Confirmed!</h2>
                    <p className="text-slate-500 mt-2 mb-6">Your order is being prepared and packed.</p>
                    <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                        Status: Confirmed – Preparing your order
                    </div>
                </div>
            );

        case 'shipped':
            return (
                <div className="animate-fade-in">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    <h2 className="text-3xl font-bold text-slate-900 mt-4">Shipped!</h2>
                    <p className="text-slate-500 mt-2 mb-6">Your order is on the way.</p>
                    
                    {orderDetails.trackingNumber && (
                        <div className="bg-slate-100 p-4 rounded-lg mb-6 max-w-sm mx-auto">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Tracking Number</p>
                            <p className="text-lg font-mono font-bold text-slate-800">{orderDetails.trackingNumber}</p>
                        </div>
                    )}

                    <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                        Status: Out for Delivery
                    </div>
                </div>
            );

        case 'delivered':
             return (
                <div className="animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-3xl font-bold text-slate-900 mt-4">Delivered!</h2>
                    <p className="text-slate-500 mt-2 mb-6">Enjoy your order. Thanks for shopping with us!</p>
                    <div className="inline-block bg-slate-200 text-slate-600 px-4 py-2 rounded-full font-semibold">
                        Status: Delivered
                    </div>
                </div>
            );
        
        case 'cancelled':
             return (
                <div className="animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <h2 className="text-3xl font-bold text-red-600 mt-4">Order Cancelled</h2>
                    <p className="text-slate-500 mt-2 mb-6">This order has been cancelled.</p>
                    <div className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
                        Status: Cancelled
                    </div>
                </div>
            );

        default:
            return null;
    }
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center">
      {renderStatusUI()}

      <div className="bg-slate-50 p-4 rounded-lg text-left space-y-4 mt-8">
          <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Order Summary</h3>
          <div className="flex justify-between items-center">
              <span className="font-medium text-slate-600">Order ID:</span>
              <span className="font-mono text-sm bg-slate-200 px-2 py-1 rounded">{orderDetails.orderId}</span>
          </div>
          <div className="flex justify-between items-center">
              <span className="font-medium text-slate-600">Total Amount:</span>
              <span className="text-xl font-bold text-primary">₹{orderDetails.totalAmount.toFixed(2)}</span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mt-4 mb-2">Items:</h4>
            <ul className="space-y-1">
              {orderDetails.products.map(item => (
                <li key={item.product.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
      </div>
      
      <button 
        onClick={onNewOrder} 
        className="mt-8 w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
      >
        Place a New Order
      </button>
    </div>
  );
};

export default OrderSummary;