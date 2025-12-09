
import React, { useState, useEffect } from 'react';
import { OrderDetails, StoreSettings } from '../types';
import { db } from '../services/firebaseConfig';
import { generatePhonePeUrl, generateGPayUrl, generatePaytmUrl, detectUpiApp } from '../services/upiService';
import QrCodeWrapper from './QrCodeWrapper';

interface OrderSummaryProps {
  orderDetails: OrderDetails;
  paymentUrl: string; // Generic UPI Link
  storeSettings: StoreSettings;
  onNewOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderDetails, paymentUrl, storeSettings, onNewOrder }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmationPrompt, setShowConfirmationPrompt] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  // VPA Input State
  const [payerVpa, setPayerVpa] = useState('');
  const [vpaError, setVpaError] = useState('');
  const [detectedApp, setDetectedApp] = useState<'PHONEPE' | 'GPAY' | 'PAYTM' | 'OTHER' | null>(null);

  // --- CONFIRMATION LOGIC FOR PWA INTENT FLOW ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If user returns to app and request was sent, ask for confirmation
      if (document.visibilityState === 'visible' && orderDetails.status === 'pending' && requestStatus === 'sent') {
         setTimeout(() => setShowConfirmationPrompt(true), 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [orderDetails.status, requestStatus]);

  const handleVpaSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Basic Validation
      if (!payerVpa || !payerVpa.includes('@')) {
          setVpaError('Please enter a valid UPI ID (e.g., user@oksbi)');
          return;
      }
      setVpaError('');

      // 1. Detect App
      const app = detectUpiApp(payerVpa);
      setDetectedApp(app);
      setRequestStatus('sending');

      // 2. Simulate "Sending Request" delay
      setTimeout(() => {
          setRequestStatus('sent');
          
          // 3. Generate Link based on Merchant Details & Detected App
          const { totalAmount, orderId } = orderDetails;
          const { merchantVpa, merchantName } = storeSettings;
          
          let link = paymentUrl; // Default generic

          if (app === 'PHONEPE') {
              link = generatePhonePeUrl(totalAmount, orderId, merchantVpa, merchantName);
          } else if (app === 'GPAY') {
              link = generateGPayUrl(totalAmount, orderId, merchantVpa, merchantName);
          } else if (app === 'PAYTM') {
              link = generatePaytmUrl(totalAmount, orderId, merchantVpa, merchantName);
          }

          // 4. Trigger Intent
          window.location.href = link;

      }, 2000);
  };

  const handlePaymentConfirmation = async () => {
    if (!orderDetails.firestoreId) return;
    
    setIsUpdating(true);
    try {
        await db.collection('orders').doc(orderDetails.firestoreId).update({
            status: 'paid',
            paymentId: `UPI-${Date.now()}`
        });
        setShowConfirmationPrompt(false);
    } catch (e) {
        console.error("Error updating order:", e);
        alert("Failed to update order status. Please try again.");
    } finally {
        setIsUpdating(false);
    }
  };

  const renderStatusUI = () => {
    if (orderDetails.status === 'paid') {
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
    }

    if (orderDetails.status === 'confirmed') {
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
    }
    
    if (['shipped', 'delivered', 'cancelled'].includes(orderDetails.status)) {
         return (
             <div className="animate-fade-in">
                 <h2 className="text-2xl font-bold text-slate-900 capitalize">{orderDetails.status}!</h2>
                 <p className="text-slate-500 mt-2">Check your order history for details.</p>
             </div>
         )
    }

    // --- DEFAULT: PENDING (COLLECT FLOW) ---
    return (
        <div className="animate-fade-in flex flex-col items-center max-w-md mx-auto">
            
            {requestStatus === 'idle' ? (
                <>
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-slate-900">Total: ₹{orderDetails.totalAmount.toFixed(2)}</h2>
                        <p className="text-slate-500 text-sm mt-1">Enter your UPI ID to receive a payment request.</p>
                    </div>

                    <form onSubmit={handleVpaSubmit} className="w-full space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                        <div className="text-left">
                            <label htmlFor="vpa" className="block text-sm font-semibold text-slate-700 mb-1">Your UPI ID / VPA</label>
                            <input 
                                type="text" 
                                id="vpa"
                                placeholder="e.g. 9876543210@oksbi" 
                                value={payerVpa}
                                onChange={(e) => setPayerVpa(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            />
                            {vpaError && <p className="text-red-500 text-xs mt-1">{vpaError}</p>}
                            <p className="text-xs text-slate-400 mt-2">We will initiate a request to this ID.</p>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all transform hover:scale-105 flex justify-center items-center gap-2"
                        >
                            <span>Proceed to Pay</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </form>
                </>
            ) : requestStatus === 'sending' ? (
                <div className="py-12 text-center animate-fade-in">
                    <div className="mx-auto h-16 w-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-bold text-slate-800">Initiating Request...</h3>
                    <p className="text-slate-500 mt-2">
                        Connecting to <span className="font-bold text-slate-700">{detectedApp === 'OTHER' ? 'UPI Network' : detectedApp === 'GPAY' ? 'Google Pay' : detectedApp === 'PHONEPE' ? 'PhonePe' : 'Paytm'}</span>
                    </p>
                </div>
            ) : (
                <div className="w-full animate-fade-in">
                    {/* REQUEST SENT NOTIFICATION */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center shadow-sm">
                        <div className="flex justify-center mb-2">
                             <div className="bg-green-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                             </div>
                        </div>
                        <p className="text-green-800 font-bold text-lg">
                            Request Sent to {payerVpa}
                        </p>
                        <p className="text-green-700 text-sm mt-1">
                            Please check your <strong>{detectedApp === 'OTHER' ? 'UPI App' : detectedApp === 'GPAY' ? 'Google Pay' : detectedApp === 'PHONEPE' ? 'PhonePe' : 'Paytm'}</strong> to authorize the payment of ₹{orderDetails.totalAmount.toFixed(2)}.
                        </p>
                    </div>

                    {/* CONFIRMATION PROMPT */}
                    {showConfirmationPrompt ? (
                        <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center animate-bounce-short shadow-md">
                            <p className="font-bold text-blue-900 text-lg mb-4">Did you complete the payment?</p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handlePaymentConfirmation}
                                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-700 font-bold"
                                >
                                    Yes, I have Paid
                                </button>
                                <button 
                                    onClick={() => setShowConfirmationPrompt(false)}
                                    className="w-full bg-white text-slate-600 border border-slate-300 px-4 py-3 rounded-lg hover:bg-slate-50 font-semibold"
                                >
                                    No, I'm still paying
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                             <p className="text-slate-500 text-sm mb-4">Waiting for payment confirmation...</p>
                             <button 
                                onClick={() => setShowConfirmationPrompt(true)}
                                className="text-primary font-semibold hover:underline"
                            >
                                Click here if you have already paid
                            </button>
                        </div>
                    )}

                    {/* Fallback QR */}
                    <div className="mt-8 border-t pt-6 text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-4">Scan QR if notification not received</p>
                        <div className="bg-white p-3 rounded-xl shadow-inner border border-slate-200 inline-block">
                             <QrCodeWrapper value={paymentUrl} size={150} />
                        </div>
                    </div>

                    {/* Retry Button */}
                    <button 
                        onClick={() => setRequestStatus('idle')}
                        className="mt-6 text-sm text-slate-500 hover:text-slate-800 underline block mx-auto"
                    >
                        Change UPI ID
                    </button>
                </div>
            )}
            
            {requestStatus === 'idle' && (
                <div className="mt-6 inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold animate-pulse text-sm">
                    Status: Awaiting Payment
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center">
      {renderStatusUI()}

      {/* Basic Order Info Footer (always visible unless updating) */}
      {!isUpdating && orderDetails.status === 'pending' && (
          <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
              <p>Order ID: {orderDetails.orderId}</p>
              <p>Merchant: {storeSettings.merchantName}</p>
          </div>
      )}
      
      {['paid', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(orderDetails.status) && (
           <div className="bg-slate-50 p-4 rounded-lg text-left space-y-4 mt-8">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Order Summary</h3>
            <div className="flex justify-between items-center">
                <span className="font-medium text-slate-600">Total Amount:</span>
                <span className="text-xl font-bold text-primary">₹{orderDetails.totalAmount.toFixed(2)}</span>
            </div>
            <div>
                <ul className="space-y-1">
                {orderDetails.products.map(item => (
                    <li key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </li>
                ))}
                </ul>
            </div>
             <button 
                onClick={onNewOrder} 
                className="mt-4 w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
                Place a New Order
            </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
