
import React, { useState, useEffect, useRef } from 'react';
import { getAllStores } from '../services/adminService';
import { Store } from '../types';

interface LandingPageProps {
    onNavigateToStore: (storeId: string) => void;
    onNavigateToAdmin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToStore, onNavigateToAdmin }) => {
    const [storeInput, setStoreInput] = useState('');
    const [stores, setStores] = useState<Store[]>([]);
    const [suggestions, setSuggestions] = useState<Store[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(true);
    const suggestionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadStores = async () => {
            const data = await getAllStores();
            setStores(data);
            setLoading(false);
        };
        loadStores();
    }, []);

    // Handle Suggestions logic
    useEffect(() => {
        if (storeInput.trim().length > 0) {
            const filtered = stores.filter(s => 
                s.name.toLowerCase().includes(storeInput.toLowerCase()) || 
                s.storeId.toLowerCase().includes(storeInput.toLowerCase())
            ).slice(0, 5); // Limit to top 5 suggestions
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [storeInput, stores]);

    // Handle outside clicks to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = storeInput.trim().toLowerCase();
        if (query) {
            // Priority 1: Exact Match
            const exactMatch = stores.find(s => s.storeId.toLowerCase() === query);
            if (exactMatch) {
                onNavigateToStore(exactMatch.storeId);
                return;
            }
            // Priority 2: Closest Suggesion
            if (suggestions.length > 0) {
                onNavigateToStore(suggestions[0].storeId);
            } else {
                // Priority 3: Try current input anyway
                onNavigateToStore(query);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative overflow-x-hidden text-slate-900 selection:bg-primary selection:text-white">
            
            {/* Background Blobs (Subtle Light Theme) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-5%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-sky-200/40 rounded-full blur-[80px] sm:blur-[100px]"></div>
                <div className="absolute bottom-[-5%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-200/40 rounded-full blur-[80px] sm:blur-[100px]"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary rounded-lg sm:rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                        Q
                    </div>
                    <span className="font-bold text-xl sm:text-2xl tracking-tight text-slate-800">QuickOrder</span>
                </div>
                <button 
                    onClick={onNavigateToAdmin}
                    className="rounded-md bg-primary px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-transform transform hover:scale-105"
                >
                    Merchant Login
                </button>
            </nav>

            <main className="relative z-10 container mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-12 flex-1 flex flex-col justify-center">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    
                    {/* LEFT: Hero Text */}
                    <div className="text-center lg:text-left">
                        {/* BADGE */}
                        <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6 sm:mb-10 hover:shadow-md transition-shadow cursor-default">
                            <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-primary"></span>
                            </span>
                            <span className="text-[10px] sm:text-sm font-bold text-slate-600 tracking-wide uppercase">The Future of Local Shopping</span>
                        </div>

                        <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4 sm:mb-6 text-slate-900">
                            Local. <br className="hidden xs:block"/>
                            <span className="text-primary">Digital.</span> <br className="hidden xs:block"/>
                            Direct.
                        </h1>
                        
                        <p className="text-lg sm:text-xl text-slate-500 mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium px-2 sm:px-0">
                            The fastest way to order from neighborhood stores. 
                            Select items. Pay UPI. Done.
                        </p>

                        {/* Search Input with Suggestions */}
                        <div className="max-w-lg mx-auto lg:mx-0 relative group px-1 sm:px-0" ref={suggestionRef}>
                            <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-sky-300 to-indigo-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <form onSubmit={handleSubmit} className="relative flex bg-white border border-slate-200 rounded-xl p-1.5 sm:p-2 shadow-xl z-20">
                                <input 
                                    type="text"
                                    value={storeInput}
                                    onChange={(e) => setStoreInput(e.target.value.replace(/\s/g, ''))}
                                    onFocus={() => storeInput.trim().length > 0 && setShowSuggestions(true)}
                                    placeholder="Enter Shop Name (e.g. TejaShop)" 
                                    className="flex-1 bg-transparent px-3 sm:px-6 py-3 sm:py-4 text-slate-800 placeholder-slate-400 focus:outline-none text-base sm:text-lg font-bold min-w-0"
                                />
                                <button type="submit" className="bg-primary text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-sky-600 transition-colors shadow-md transform active:scale-95 shrink-0">
                                    Go
                                </button>
                            </form>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && (
                                <div className="absolute left-0 right-0 top-[100%] mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-30 animate-slide-down">
                                    <div className="p-2">
                                        {suggestions.map((store) => (
                                            <div 
                                                key={store.storeId}
                                                onClick={() => onNavigateToStore(store.storeId)}
                                                className={`flex items-center gap-3 p-3 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors group ${store.isActive === false ? 'opacity-70' : ''}`}
                                            >
                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold ${store.isActive !== false ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-400'}`}>
                                                    {store.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-bold text-slate-800 group-hover:text-primary transition-colors truncate">{store.name}</p>
                                                    {store.isActive === false && <p className="text-[10px] text-red-500 font-bold uppercase">Closed Temporarily</p>}
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Trending Shops Dashboard (Light Mode) */}
                    <div className="relative h-[450px] xs:h-[500px] sm:h-[600px] flex items-center mt-4 sm:mt-8 lg:mt-0 px-2 sm:px-0">
                        {/* Decorative background shape */}
                        <div className="absolute inset-2 sm:inset-0 bg-white/50 rounded-[2rem] sm:rounded-[3rem] transform rotate-1 sm:rotate-2 sm:scale-105 border border-slate-200 shadow-sm"></div>
                        
                        {/* Main Card */}
                        <div className="w-full h-full max-h-[600px] bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col z-10">
                             <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
                                <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
                                    Trending Shops <span className="text-xl sm:text-2xl">🔥</span>
                                </h3>
                                <p className="text-sm sm:text-slate-500 mt-0.5 sm:mt-1">Live stores accepting orders</p>
                             </div>

                             <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar pb-6">
                                {loading ? (
                                    [1,2,3].map(i => <div key={i} className="h-20 sm:h-24 bg-slate-100 rounded-xl sm:rounded-2xl animate-pulse"></div>)
                                ) : stores.length > 0 ? (
                                    stores.map((store, idx) => (
                                        <div 
                                            key={store.storeId}
                                            onClick={() => onNavigateToStore(store.storeId)}
                                            className={`group flex items-center gap-3 sm:gap-4 bg-slate-50 hover:bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-primary/30 transition-all cursor-pointer hover:shadow-lg transform hover:-translate-y-1 ${store.isActive === false ? 'opacity-75' : ''}`}
                                        >
                                            <div className={`h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-md ${
                                                store.isActive === false ? 'bg-slate-300' :
                                                idx % 3 === 0 ? 'bg-gradient-to-br from-sky-400 to-blue-600' :
                                                idx % 3 === 1 ? 'bg-gradient-to-br from-indigo-400 to-purple-600' :
                                                'bg-gradient-to-br from-emerald-400 to-teal-600'
                                            }`}>
                                                {store.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-base sm:text-lg text-slate-800 truncate group-hover:text-primary transition-colors">{store.name}</h4>
                                                {store.isActive === false && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 mt-1 uppercase">
                                                        Closed
                                                    </span>
                                                )}
                                            </div>
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 sm:py-12 text-slate-400">
                                        <div className="text-3xl sm:text-4xl mb-2 opacity-30">🏪</div>
                                        <p className="text-sm">No active stores found.</p>
                                    </div>
                                )}
                             </div>
                             
                             {/* Bottom fade */}
                             <div className="absolute bottom-0 left-0 w-full h-12 sm:h-16 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-[2rem] sm:rounded-b-[2.5rem]"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LandingPage;
