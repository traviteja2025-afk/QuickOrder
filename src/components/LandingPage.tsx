
import React, { useState, useEffect } from 'react';
import { getAllStores } from '../services/adminService';
import { Store } from '../types';

interface LandingPageProps {
    onNavigateToStore: (storeId: string) => void;
    onNavigateToAdmin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToStore, onNavigateToAdmin }) => {
    const [storeInput, setStoreInput] = useState('');
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStores = async () => {
            const data = await getAllStores();
            setStores(data);
            setLoading(false);
        };
        loadStores();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (storeInput.trim()) {
            onNavigateToStore(storeInput.trim().toLowerCase());
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden text-slate-900 selection:bg-primary selection:text-white">
            
            {/* Background Blobs (Subtle Light Theme) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px]"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center text-white font-bold text-xl">
                        Q
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-slate-800">QuickOrder</span>
                </div>
                <button 
                    onClick={onNavigateToAdmin}
                    className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-md border border-slate-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                    <span>Merchant Login</span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
            </nav>

            <main className="relative z-10 container mx-auto px-6 pt-12 pb-12 flex-1 flex flex-col justify-center">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* LEFT: Hero Text */}
                    <div className="text-center lg:text-left">
                        {/* BADGE */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm mb-10 hover:shadow-md transition-shadow cursor-default">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                            <span className="text-sm font-bold text-slate-600 tracking-wide uppercase">The Future of Local Shopping</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900">
                            Local. <br/>
                            <span className="text-primary">Digital.</span> <br/>
                            Direct.
                        </h1>
                        
                        <p className="text-xl text-slate-500 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                            The fastest way to order from neighborhood stores. 
                            Select items. Pay UPI. Done.
                        </p>

                        {/* Search Input */}
                        <div className="max-w-lg mx-auto lg:mx-0 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-sky-300 to-indigo-300 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                            <form onSubmit={handleSubmit} className="relative flex bg-white border border-slate-200 rounded-xl p-2 shadow-xl">
                                <input 
                                    type="text"
                                    value={storeInput}
                                    onChange={(e) => setStoreInput(e.target.value)}
                                    placeholder="Enter store name..." 
                                    className="flex-1 bg-transparent px-6 py-4 text-slate-800 placeholder-slate-400 focus:outline-none text-lg font-medium"
                                />
                                <button type="submit" className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-sky-600 transition-colors shadow-md transform active:scale-95">
                                    Go
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT: Trending Shops Dashboard (Light Mode) */}
                    <div className="relative h-[600px] flex items-center mt-8 lg:mt-0">
                        {/* Decorative background shape */}
                        <div className="absolute inset-0 bg-white/50 rounded-[3rem] transform rotate-3 scale-105 border border-slate-200 shadow-sm"></div>
                        
                        {/* Main Card */}
                        <div className="w-full h-full max-h-[600px] bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col z-10">
                             <div className="mb-6 pb-4 border-b border-slate-100">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                    Trending Shops <span className="text-2xl">🔥</span>
                                </h3>
                                <p className="text-slate-500 mt-1">Live stores accepting orders</p>
                             </div>

                             <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
                                {loading ? (
                                    [1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>)
                                ) : stores.length > 0 ? (
                                    stores.map((store, idx) => (
                                        <div 
                                            key={store.storeId}
                                            onClick={() => onNavigateToStore(store.storeId)}
                                            className="group flex items-center gap-4 bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                                        >
                                            <div className={`h-16 w-16 shrink-0 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-md ${
                                                idx % 3 === 0 ? 'bg-gradient-to-br from-sky-400 to-blue-600' :
                                                idx % 3 === 1 ? 'bg-gradient-to-br from-indigo-400 to-purple-600' :
                                                'bg-gradient-to-br from-emerald-400 to-teal-600'
                                            }`}>
                                                {store.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-lg text-slate-800 truncate group-hover:text-primary transition-colors">{store.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                                                        @{store.storeId}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <div className="text-4xl mb-2 opacity-30">🏪</div>
                                        <p>No active stores found.</p>
                                    </div>
                                )}
                             </div>
                             
                             {/* Bottom fade */}
                             <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-[2.5rem]"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LandingPage;
