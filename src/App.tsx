
import React, { useState, useCallback, useEffect } from 'react';
import { OrderDetails, ProductOrder, CustomerDetails, Product, View, User, OrderStatus, Store } from './types';
import { generateUpiUrl } from './services/upiService';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomerDashboard from './components/CustomerDashboard';
import OrderSummary from './components/OrderSummary';
import AdminDashboard from './components/admin/AdminDashboard';
import Login from './components/admin/Login';
import LandingPage from './components/LandingPage';

// Firebase Imports
import firebase, { db, auth, isFirebaseConfigured } from './services/firebaseConfig';
import { isRootAdmin, getManagedStore } from './services/adminService';

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<View>('landing');
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>('');

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTargetRole, setLoginTargetRole] = useState<'admin' | 'customer'>('customer');
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation State
  const [pendingStoreNavigation, setPendingStoreNavigation] = useState<string | null>(null);

  // --- HELPER: Fetch Store ---
  // Added targetView parameter to allow overriding the default 'customer' view
  const fetchStoreDetails = useCallback(async (storeId: string, targetView: View = 'customer') => {
      setIsLoading(true);
      try {
          const doc = await db.collection('stores').doc(storeId).get();
          if (doc.exists) {
              const data = doc.data();
              // Robustly ensure storeId is present (use doc.id if missing in data)
              const storeData = { ...data, storeId: doc.id } as Store;
              setCurrentStore(storeData);
              setView(targetView); 
          } else {
              // Store not found
              setCurrentStore(null);
              setView('landing');
          }
      } catch (e) {
          console.error("Error fetching store:", e);
          setCurrentStore(null);
          setView('landing');
      } finally {
          setIsLoading(false);
      }
  }, []);

  // --- INITIALIZATION & NAVIGATION ---
  
  // 1. Initial Load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeIdFromUrl = params.get('store');

    if (storeIdFromUrl) {
        fetchStoreDetails(storeIdFromUrl);
    } else {
        setIsLoading(false);
    }
  }, [fetchStoreDetails]);

  // 2. Handle Browser Back/Forward Buttons (Popstate)
  useEffect(() => {
    const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        const storeId = params.get('store');

        if (storeId) {
            if (currentStore?.storeId !== storeId) {
                 fetchStoreDetails(storeId);
            }
        } else {
            // No store in URL -> Go to Landing
            if (view !== 'landing') {
                setCurrentStore(null);
                setView('landing');
            }
        }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentStore, view, fetchStoreDetails]);

  const handleNavigateToStore = (storeId: string) => {
      // 1. Root Admin Navigation from Admin Dashboard
      // If the user is a Root Admin AND they are currently in the Admin View,
      // we assume they want to manage the store they clicked on.
      if (currentUser?.role === 'root' && view === 'admin') {
           const newUrl = `${window.location.pathname}?store=${storeId}`;
           window.history.pushState({path: newUrl}, '', newUrl);
           fetchStoreDetails(storeId, 'admin'); // Pass 'admin' as targetView
           return;
      }

      // 2. Standard Navigation (Customer Intent)
      
      // INTERCEPTION: If user is not logged in, prompt login first.
      if (!currentUser) {
          setPendingStoreNavigation(storeId);
          initiateLogin('customer');
          return;
      }

      // Proceed if logged in
      navigateToStoreInternal(storeId);
  };

  const navigateToStoreInternal = (storeId: string) => {
      // Update URL
      const newUrl = `${window.location.pathname}?store=${storeId}`;
      window.history.pushState({path: newUrl}, '', newUrl);
      
      // STRICT MODE SWITCHING:
      // When entering a store (via Trending Shops or Search), enforce 'customer' mode.
      // If user is currently Admin, switch them to Customer context so they can shop.
      if (currentUser && currentUser.role !== 'customer') {
          const demotedUser = { ...currentUser, role: 'customer' as 'customer' };
          setCurrentUser(demotedUser);
          localStorage.setItem('temp_role_pref', 'customer');
      }
      
      // Ensure future logins from this path default to customer
      setLoginTargetRole('customer');
      
      fetchStoreDetails(storeId);
  };

  const handleLogoClick = () => {
      setCurrentStore(null);
      setView('landing');
      setShowLoginModal(false);
      setPendingStoreNavigation(null);
      // Clear URL params
      window.history.pushState({}, '', window.location.pathname);
  };

  // --- AUTH LISTENERS ---
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Determine Role based on User Preference (Login Intent) + Database Permissions
        const storedPref = localStorage.getItem('temp_role_pref') as 'root' | 'seller' | 'customer' || 'customer';
        let finalRole: 'root' | 'seller' | 'customer' = 'customer';
        let managedStoreId: string | undefined = undefined;

        // Only check for elevated roles if the preference is NOT customer
        if (storedPref !== 'customer') {
             // 1. Check Root Admin
            if (isRootAdmin(firebaseUser.email, firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace(/\D/g, '') : null)) {
                finalRole = 'root';
            } else {
                // 2. Check Seller Access
                const managedStore = await getManagedStore(firebaseUser.email, firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace(/\D/g, '') : null);
                if (managedStore) {
                    finalRole = 'seller';
                    managedStoreId = managedStore.storeId;
                }
            }
        }

        setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || undefined,
            phoneNumber: firebaseUser.phoneNumber || undefined,
            role: finalRole,
            managedStoreId,
            avatar: firebaseUser.photoURL || undefined,
        });

      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  // --- DATA LISTENERS (Filtered by Store ID) ---
  
  // 1. Listen for Products
  useEffect(() => {
    if (!isFirebaseConfigured || !currentStore) {
        setProducts([]);
        return;
    }

    const unsubscribe = db.collection('products')
        .where('storeId', '==', currentStore.storeId)
        .onSnapshot((snapshot) => {
            const productsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    ...data, 
                    id: doc.id,
                    _sortKey: data.id || 0
                };
            }) as any[];
            productsData.sort((a, b) => b._sortKey - a._sortKey);
            setProducts(productsData);
        }, (error) => {
            console.error("Error fetching products:", error);
        });
    return () => unsubscribe();
  }, [currentStore]);

  // 2. Listen for Orders
  useEffect(() => {
    if (!isFirebaseConfigured || !currentStore) {
        setOrders([]);
        return;
    }

    const unsubscribe = db.collection('orders')
        .where('storeId', '==', currentStore.storeId)
        .onSnapshot((snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                firestoreId: doc.id,
                ...doc.data()
            })) as OrderDetails[];
            
            ordersData.sort((a, b) => {
                const timeA = a.createdAt?.seconds || (Date.now() / 1000);
                const timeB = b.createdAt?.seconds || (Date.now() / 1000);
                return timeB - timeA;
            });
            
            setOrders(ordersData);

            setOrderDetails(prev => {
                if (!prev) return null;
                const updated = ordersData.find(o => o.orderId === prev.orderId);
                return updated || prev;
            });
        }, (error) => console.error("Error fetching orders:", error));
        
    return () => unsubscribe();
  }, [currentStore]);


  // --- HANDLERS ---

  const handleUpdateStoreSettings = async (settings: Store) => {
      if (!currentStore) return;
      try {
          await db.collection('stores').doc(currentStore.storeId).set(settings, { merge: true });
          setCurrentStore(settings);
          alert("Store settings updated.");
      } catch (e) { console.error(e); }
  };

  const handleAddProduct = async (newProductData: Omit<Product, 'id' | 'storeId'>) => {
      if (!currentStore) return;
      try {
        await db.collection('products').add({
            ...newProductData,
            storeId: currentStore.storeId, 
            id: Date.now(), 
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
          console.error("Error adding product: ", e);
          alert("Failed to add product");
      }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
      try {
          await db.collection('products').doc(String(updatedProduct.id)).update({
              name: updatedProduct.name,
              price: updatedProduct.price,
              unit: updatedProduct.unit,
              description: updatedProduct.description,
              imageUrl: updatedProduct.imageUrl
          });
      } catch (e) { console.error(e); }
  };

  const handleDeleteProduct = async (productId: number | string) => {
      try { await db.collection('products').doc(String(productId)).delete(); } catch (e) { console.error(e); }
  };

  const handleDeleteOrder = async (firestoreId: string) => {
      try { await db.collection('orders').doc(firestoreId).delete(); } catch (e) { console.error(e); }
  };

  const handlePlaceOrder = useCallback(async (customer: CustomerDetails, products: ProductOrder[]) => {
    if (!currentStore) return;

    const totalAmount = products.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderId = `ORD-${Date.now()}`;
    
    const newOrder: OrderDetails = {
      storeId: currentStore.storeId,
      userId: currentUser?.id,
      customer,
      products,
      totalAmount,
      orderId,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection('orders').add(newOrder);
        const orderWithId = { ...newOrder, firestoreId: docRef.id };
        setOrderDetails(orderWithId); 

        const upiUrl = generateUpiUrl({
            vpa: currentStore.vpa, 
            payeeName: currentStore.merchantName,
            amount: totalAmount,
            transactionNote: `Order #${orderId}`,
            transactionRef: orderId 
        });
        setPaymentUrl(upiUrl);
    } catch (e) {
        console.error("Error placing order: ", e);
        alert("Could not place order.");
    }
  }, [currentUser, currentStore]);

  const handleUpdateOrderStatus = async (firestoreId: string, status: OrderStatus, additionalData: Partial<OrderDetails> = {}) => {
      try {
          await db.collection('orders').doc(firestoreId).update({ status, ...additionalData });
      } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('temp_role_pref');
    setCurrentUser(null);
    setShowLoginModal(false);
    setPendingStoreNavigation(null);
    
    // Always redirect to landing page on logout
    setCurrentStore(null);
    setView('landing');
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowLoginModal(false);

    // CHECK FOR PENDING NAVIGATION (from Landing Page click)
    if (pendingStoreNavigation) {
        // User clicked a shop, was asked to login, and has now logged in.
        // We force them to customer mode and navigate to that shop.
        
        // 1. Force Preference
        localStorage.setItem('temp_role_pref', 'customer');
        
        // 2. Demote locally if they are admin, so they can shop
        if (user.role !== 'customer') {
            const demotedUser = { ...user, role: 'customer' as 'customer' };
            setCurrentUser(demotedUser);
        }
        
        // 3. Navigate
        navigateToStoreInternal(pendingStoreNavigation);
        
        // 4. Clear pending
        setPendingStoreNavigation(null);
        return;
    }
    
    // PRIORITY CHECK: LOGIN INTENT (Normal flow)
    // If the user's intent was to login as a customer (e.g. from checkout button inside a store),
    // we keep them on the customer view.
    if (loginTargetRole === 'customer') {
        localStorage.setItem('temp_role_pref', 'customer');
        setView('customer');
        return;
    }
    
    // Otherwise, they explicitly logged in via "Merchant Login", so we honor Admin Roles.
    localStorage.setItem('temp_role_pref', user.role === 'root' || user.role === 'seller' ? 'admin' : 'customer');

    if (user.role === 'root') {
        setView('admin');
    } else if (user.role === 'seller') {
        // Seller logic: Go to their store admin
        if (user.managedStoreId) {
            if (!currentStore || currentStore.storeId !== user.managedStoreId) {
                 const newUrl = `${window.location.pathname}?store=${user.managedStoreId}`;
                 window.history.pushState({path: newUrl}, '', newUrl);
                 fetchStoreDetails(user.managedStoreId, 'admin');
            } else {
                setView('admin');
            }
        } else {
            setView('admin');
        }
    } else {
        // Customer
        setView('customer');
    }
  };

  const initiateLogin = (role: 'admin' | 'customer') => {
      setLoginTargetRole(role);
      // We do NOT set temp_role_pref here; we wait for success.
      setShowLoginModal(true);
  };

  // --- RENDER HELPERS ---

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-100 animate-pulse text-slate-500 font-medium">Loading QuickOrder...</div>;
  }

  const renderView = () => {
    if (showLoginModal) {
        return (
            <div className="max-w-md mx-auto">
                 <button onClick={() => setShowLoginModal(false)} className="mb-4 text-sm text-slate-500 hover:text-slate-700 flex items-center">Back</button>
                 <Login targetRole={loginTargetRole} onLogin={handleLoginSuccess} />
            </div>
        );
    }

    // Default View (Landing)
    if (view === 'landing' && !currentStore) {
        const handleLandingAdminNav = () => {
             // If already logged in as Seller/Admin, go directly to dashboard
             if (currentUser && (currentUser.role === 'root' || currentUser.role === 'seller')) {
                 if (currentUser.role === 'seller' && currentUser.managedStoreId) {
                     const newUrl = `${window.location.pathname}?store=${currentUser.managedStoreId}`;
                     window.history.pushState({path: newUrl}, '', newUrl);
                     fetchStoreDetails(currentUser.managedStoreId, 'admin');
                 } else {
                     setView('admin');
                 }
             } else {
                 // Otherwise invoke login
                 initiateLogin('admin');
             }
        };

        return <LandingPage onNavigateToStore={handleNavigateToStore} onNavigateToAdmin={handleLandingAdminNav} />;
    }
    
    if (view === 'admin') {
      if (!currentUser || (currentUser.role === 'customer')) {
          return (
             <div className="max-w-md mx-auto">
                 <h2 className="text-center font-bold text-xl mb-4">Admin Access Required</h2>
                <Login targetRole="admin" onLogin={handleLoginSuccess} />
             </div>
          );
      }
      
      // Access Control: Seller can only see their own store dashboard
      if (currentUser.role === 'seller' && currentStore && currentUser.managedStoreId !== currentStore.storeId) {
          return <div className="text-center p-10 text-red-500 font-bold">You are authorized to manage "{currentUser.managedStoreId}", not this store.</div>
      }

      return (
        <AdminDashboard 
          currentStore={currentStore}
          products={products}
          orders={orders}
          currentUser={currentUser}
          onUpdateStoreSettings={handleUpdateStoreSettings}
          onAddProduct={handleAddProduct} 
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onNavigateToStore={handleNavigateToStore}
        />
      );
    }

    if (view === 'customer') {
      if (!currentStore) return <LandingPage onNavigateToStore={handleNavigateToStore} onNavigateToAdmin={() => initiateLogin('admin')} />;

      // Note: We don't force login here. Customer dashboard handles guest/login states.
      
      if (orderDetails) {
        return <OrderSummary 
            orderDetails={orderDetails} 
            paymentUrl={paymentUrl} 
            storeSettings={{ merchantVpa: currentStore.vpa, merchantName: currentStore.merchantName }} 
            onNewOrder={() => { setOrderDetails(null); setPaymentUrl(''); }} 
        />;
      }

      return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{currentStore.name}</h2>
                    <p className="text-xs text-slate-500">Store ID: {currentStore.storeId}</p>
                </div>
                <button onClick={() => { setCurrentStore(null); setView('landing'); window.history.pushState({}, '', window.location.pathname); }} className="text-xs text-slate-400 underline">Change Store</button>
            </div>

            <CustomerDashboard 
                products={products} 
                onPlaceOrder={handlePlaceOrder} 
                currentUser={currentUser}
                orders={orders}
                onLoginRequest={() => initiateLogin('customer')}
            />
        </div>
      );
    }
  };

  const showHeaderAndContainer = view !== 'landing' || currentStore || showLoginModal;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans text-slate-800">
      {showHeaderAndContainer && (
        <Header
          currentView={showLoginModal ? (loginTargetRole === 'admin' ? 'admin' : 'customer') : view}
          setView={setView}
          currentUser={currentUser}
          onLogout={handleLogout}
          onLogin={() => initiateLogin('customer')}
          onLogoClick={handleLogoClick}
        />
      )}
      <main className={`flex-grow ${showHeaderAndContainer ? 'container mx-auto px-4 py-8 md:py-12' : ''}`}>
        <div className={showHeaderAndContainer ? 'max-w-4xl mx-auto' : 'h-full'}>
          {renderView()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
