
import React from 'react';

interface LandingPageProps {
    onNavigateToCustomer: () => void;
    onNavigateToAdmin: () => void;
}

// FIX: Changed JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md text-center">
        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-primary text-white mx-auto">
            {icon}
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-800">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToCustomer, onNavigateToAdmin }) => {
    return (
        <div className="w-full h-full animate-fade-in">
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div 
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#38bdf8] to-[#0284c7] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
                        style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl py-24 sm:py-32">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                            Welcome to QuickOrder UPI
                        </h1>
                        <p className="mt-4 text-lg leading-8 text-slate-600">
                            The simplest way for your business to take orders and receive instant UPI payments. Get started in seconds.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <button
                                onClick={onNavigateToCustomer}
                                className="rounded-md bg-primary px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-transform transform hover:scale-105"
                            >
                                Place an Order
                            </button>
                            <button
                                onClick={onNavigateToAdmin}
                                className="text-base font-semibold leading-6 text-slate-900 group"
                            >
                                Go to Admin Panel <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-16 bg-slate-50/50">
                 <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Why Choose QuickOrder?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <FeatureCard 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            title="Fast & Simple"
                            description="A clean, intuitive interface for customers to place orders in just a few clicks."
                        />
                        <FeatureCard 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                            title="Instant UPI Payments"
                            description="Generate dynamic QR codes for every order, enabling secure and immediate payments."
                        />
                         <FeatureCard 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            title="Easy Management"
                            description="A simple admin dashboard to manage your products and track all incoming orders."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
