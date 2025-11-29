
import React from 'react';
import { OrderDetails } from '../types';
import QrCodeWrapper from './QrCodeWrapper';

interface OrderSummaryProps {
  orderDetails: OrderDetails;
  paymentUrl: string;
  onNewOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderDetails, paymentUrl, onNewOrder }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center animate-fade-in">
      {orderDetails.status === 'confirmed' ? (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-3xl font-bold text-slate-900 mt-4">Payment Confirmed!</h2>
            <p className="text-slate-500 mt-2 mb-6">Thank you for your order. We are now processing it.</p>
        </>
      ) : (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-slate-900 mt-4">Order Placed Successfully!</h2>
            <p className="text-slate-500 mt-2 mb-6">Scan the QR code with any UPI app to pay, then wait for confirmation.</p>
            <div className="my-8 flex justify-center">
              <QrCodeWrapper value={paymentUrl} />
            </div>
            <div className="mt-4 animate-pulse text-yellow-600 font-semibold">
                <p>Waiting for payment confirmation from the seller...</p>
            </div>
        </>
      )}

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