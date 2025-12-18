
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
import { isRootAdmin, getManagedStores } from './services/adminService';

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
  const fetchStoreDetails = useCallback(async (storeId: string, targetView: View = 'customer') => {
      setIsLoading(true);
      try {
          const doc = await db.collection('stores').doc(storeId).get();
          if (doc.exists) {
              const data = doc.data();
              const storeData = { ...data, storeId: doc.id } as Store;
              setCurrentStore(storeData);
              setView(targetView); 
          } else {
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
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeIdFromUrl = params.get('store');

    if (storeIdFromUrl) {
        fetchStoreDetails(storeIdFromUrl);
    } else {
        setIsLoading(false);
    }
  }, [fetchStoreDetails]);

  useEffect(() => {
    const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        const storeId = params.get('store');

        if (storeId) {
            if (currentStore?.storeId !== storeId) {
                 fetchStoreDetails(storeId);
            }
        } else {
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
      if (currentUser?.role === 'root' && view === 'admin') {
           const newUrl = `${window.location.pathname}?store=${storeId}`;
           window.history.pushState({path: newUrl}, '', newUrl);
           fetchStoreDetails(storeId, 'admin');
           return;
      }

      // Interception: If user is not logged in, prompt login first.
      if (!currentUser) {
          setPendingStoreNavigation(storeId);
          initiateLogin('customer');
          return;
      }

      navigateToStoreInternal(storeId);
  };

  const navigateToStoreInternal = (storeId: string) => {
      const newUrl = `${window.location.pathname}?store=${storeId}`;
      window.history.pushState({path: newUrl}, '', newUrl);
      
      if (currentUser && currentUser.role !== 'customer') {
          const demotedUser = { ...currentUser, role: 'customer' as 'customer' };
          setCurrentUser(demotedUser);
          localStorage.setItem('temp_role_pref', 'customer');
      }
      
      setLoginTargetRole('customer');
      fetchStoreDetails(storeId);
  };

  const handleLogoClick = () => {
      setCurrentStore(null);
      setView('landing');
      setShowLoginModal(false);
      setPendingStoreNavigation(null);
      window.history.pushState({}, '', window.location.pathname);
  };

  const handleClearStoreSelection = () => {
    setCurrentStore(null);
    const newUrl = window.location.pathname;
    window.history.pushState({}, '', newUrl);
    // View remains 'admin', so the selector will show up
  };

  // --- AUTH LISTENERS ---
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const storedPref = localStorage.getItem('temp_role_pref') as 'root' | 'seller' | 'customer' || 'customer';
        let finalRole: 'root' | 'seller' | 'customer' = 'customer';
        let managedStoreIds: string[] = [];

        if (storedPref !== 'customer') {
            if (isRootAdmin(firebaseUser.email, firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace(/\D/g, '') : null)) {
                finalRole = 'root';
            } else {
                const managedStores = await getManagedStores(firebaseUser.email, firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace(/\D/g, '') : null);
                if (managedStores.length > 0) {
                    finalRole = 'seller';
                    managedStoreIds = managedStores.map(s => s.storeId);
                }
            }
        }

        setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || undefined,
            phoneNumber: firebaseUser.phoneNumber || undefined,
            role: finalRole,
            managedStoreIds,
            avatar: firebaseUser.photoURL || undefined,
        });

      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  // --- DATA LISTENERS ---
  
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
        }, (error) => console.error("Error products:", error));
    return () => unsubscribe();
  }, [currentStore]);

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
        }, (error) => console.error("Error orders:", error));
        
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
      } catch (e) { console.error(e); alert("Failed to add product"); }
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
    } catch (e) { console.error(e); alert("Could not place order."); }
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
    setCurrentStore(null);
    setView('landing');
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowLoginModal(false);

    if (pendingStoreNavigation) {
        localStorage.setItem('temp_role_pref', 'customer');
        if (user.role !== 'customer') {
            const demotedUser = { ...user, role: 'customer' as 'customer' };
            setCurrentUser(demotedUser);
        }
        navigateToStoreInternal(pendingStoreNavigation);
        setPendingStoreNavigation(null);
        return;
    }
    
    if (loginTargetRole === 'customer') {
        localStorage.setItem('temp_role_pref', 'customer');
        setView('customer');
        return;
    }
    
    localStorage.setItem('temp_role_pref', user.role === 'root' || user.role === 'seller' ? 'admin' : 'customer');

    if (user.role === 'root') {
        setView('admin');
    } else if (user.role === 'seller') {
        if (user.managedStoreIds && user.managedStoreIds.length === 1) {
             const singleId = user.managedStoreIds[0];
             const newUrl = `${window.location.pathname}?store=${singleId}`;
             window.history.pushState({path: newUrl}, '', newUrl);
             fetchStoreDetails(singleId, 'admin');
        } else {
            // Multiple stores or none? Go to admin dashboard for selection
            setView('admin');
            setCurrentStore(null);
        }
    } else {
        setView('customer');
    }
  };

  const initiateLogin = (role: 'admin' | 'customer') => {
      setLoginTargetRole(role);
      setShowLoginModal(true);
  };

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

    if (view === 'landing' && !currentStore) {
        const handleLandingAdminNav = () => {
             if (currentUser && (currentUser.role === 'root' || currentUser.role === 'seller')) {
                 if (currentUser.role === 'seller' && currentUser.managedStoreIds && currentUser.managedStoreIds.length === 1) {
                     const singleId = currentUser.managedStoreIds[0];
                     const newUrl = `${window.location.pathname}?store=${singleId}`;
                     window.history.pushState({path: newUrl}, '', newUrl);
                     fetchStoreDetails(singleId, 'admin');
                 } else {
                     setView('admin');
                 }
             } else {
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
          onNavigateToStore={(id) => fetchStoreDetails(id, 'admin')}
          onClearStoreSelection={handleClearStoreSelection}
        />
      );
    }

    if (view === 'customer') {
      if (!currentStore) return <LandingPage onNavigateToStore={handleNavigateToStore} onNavigateToAdmin={() => initiateLogin('admin')} />;

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
            <div className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center transition-colors ${currentStore.isActive !== false ? 'border-slate-100' : 'border-red-200 bg-red-50/20'}`}>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{currentStore.name}</h2>
                    <p className="text-xs text-slate-500">Store ID: {currentStore.storeId}</p>
                    {currentStore.isActive === false && <p className="text-xs font-bold text-red-600 mt-1 uppercase tracking-tighter">Temporarily Closed</p>}
                </div>
                <button onClick={() => { setCurrentStore(null); setView('landing'); window.history.pushState({}, '', window.location.pathname); }} className="text-xs text-slate-400 underline">Change Store</button>
            </div>

            <CustomerDashboard 
                products={products} 
                onPlaceOrder={handlePlaceOrder} 
                currentUser={currentUser}
                orders={orders}
                onLoginRequest={() => initiateLogin('customer')}
                currentStore={currentStore}
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
