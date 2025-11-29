
import { UpiDetails } from '../types';

export const generateUpiUrl = (details: UpiDetails): string => {
  const { vpa, payeeName, amount, transactionNote } = details;
  const params = new URLSearchParams();
  params.append('pa', vpa);
  params.append('pn', payeeName);
  params.append('am', amount.toFixed(2));
  params.append('tn', transactionNote);
  params.append('cu', 'INR');
  return `upi://pay?${params.toString()}`;
};
