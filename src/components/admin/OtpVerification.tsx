
import React, { useState, useRef, useEffect } from 'react';

interface OtpVerificationProps {
    phoneNumber: string;
    onVerify: (otp: string) => void;
    onBack: () => void;
    onResend: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ phoneNumber, onVerify, onBack, onResend }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }
        setError('');
        onVerify(otp);
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify OTP</h2>
            <p className="text-slate-500 mb-6">
                An OTP has been sent to your number: <strong className="font-semibold text-slate-700">+91 {phoneNumber}</strong>.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-slate-600 mb-1">Enter 6-Digit OTP</label>
                    <input
                        ref={inputRef}
                        type="tel"
                        name="otp"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400 text-center tracking-[1em]"
                        required
                    />
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                
                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Verify & Login
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-slate-500">
                    Didn't receive the OTP?{' '}
                    <button onClick={onResend} className="font-medium text-primary hover:underline">
                        Resend
                    </button>
                </p>
                <button onClick={onBack} className="mt-2 text-sm text-slate-500 hover:text-slate-700">
                    &larr; Change phone number
                </button>
            </div>
             <div className="mt-6 text-center text-xs text-slate-400">
                <p>For demonstration: Please use OTP <strong className="font-mono">123456</strong> to log in.</p>
            </div>
        </div>
    );
};

export default OtpVerification;
