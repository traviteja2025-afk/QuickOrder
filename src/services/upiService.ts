
import { UpiDetails } from '../types';

export const generateUpiUrl = (details: UpiDetails): string => {
  const { vpa, payeeName, amount, transactionNote, transactionRef } = details;
  const params = new URLSearchParams();
  
  params.append('pa', vpa);                // Payee VPA
  params.append('pn', payeeName);          // Payee Name
  params.append('mc', '0000');             // Merchant Code
  params.append('tr', transactionRef);     // Transaction Ref ID
  params.append('tn', transactionNote);    // Transaction Note
  params.append('am', amount.toFixed(2));  // Amount
  params.append('cu', 'INR');              // Currency
  
  return `upi://pay?${params.toString()}`;
};

/**
 * Generates a deep link specifically for PhonePe using their redirect mechanism.
 * Uses the 'Method A' approach: base64 encoding the upi intent inside https://phon.pe/
 */
export const generatePhonePeUrl = (amount: number, orderId: string, vpa: string, name: string): string => {
  // Construct the raw PhonePe UPI intent string
  // 'mode=02' is often used for secure intent flows in PhonePe
  const rawLink = `phonepe://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&tr=${orderId}&tn=Order ${orderId}&cu=INR&mode=02`;

  // Base64 encode the link
  const encodedLink = btoa(rawLink);

  // Return the shortlink format
  return `https://phon.pe/${encodedLink}`;
};

/**
 * Generates a specific intent link for Google Pay (Tez).
 */
export const generateGPayUrl = (amount: number, orderId: string, vpa: string, name: string): string => {
  return `gpay://upi/request?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&tr=${orderId}&tn=Payment for Order ${orderId}&cu=INR`;
};

/**
 * Generates a specific intent link for Paytm.
 */
export const generatePaytmUrl = (amount: number, orderId: string, vpa: string, name: string): string => {
  return `paytmmp://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&tr=${orderId}&tn=Payment for Order ${orderId}&cu=INR`;
};

/**
 * Detects the likely UPI app based on the VPA handle (extension).
 */
export const detectUpiApp = (vpa: string): 'PHONEPE' | 'GPAY' | 'PAYTM' | 'OTHER' => {
  if (!vpa || !vpa.includes('@')) return 'OTHER';
  
  const handle = vpa.split('@')[1].toLowerCase();

  // Common PhonePe Handles
  if (['ybl', 'ibl', 'axl'].includes(handle)) return 'PHONEPE';

  // Common Google Pay Handles
  if (['oksbi', 'okaxis', 'okicici', 'okhdfcbank'].includes(handle)) return 'GPAY';

  // Paytm Handle
  if (handle === 'paytm') return 'PAYTM';

  return 'OTHER';
};
