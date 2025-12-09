
import React, { useState, useCallback, useEffect } from 'react';
import { OrderDetails, ProductOrder, CustomerDetails, Product, View, User, OrderStatus, StoreSettings } from './types';
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
import { isUserAdmin } from './services/adminService';

const App: React.FC = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [view, setView] = useState<View>('landing');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTargetRole, setLoginTargetRole] = useState<'admin' | 'customer'>('customer');
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  
  // Store Settings (VPA, Name)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
      merchantVpa: 't.raviteja2025@oksbi', // Default Fallback
      merchantName: 'QuickOrder Store'
  });

  // 1. Listen for Authentication Changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
        setIsLoading(false);
        return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const storedPref = localStorage.getItem('temp_role_pref') as 'admin' | 'customer' || 'customer';
        
        // Dynamic Role Check
        let role: 'admin' | 'customer' = 'customer';
        
        if (storedPref === 'admin') {
            // Verify against database/root list
            const isAdmin = await isUserAdmin(firebaseUser.email, firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace(/\D/g, '') : null);
            if (isAdmin) {
                role = 'admin';
            } else {
                console.warn("User attempted to be admin but is not authorized. Demoting to customer.");
                role = 'customer';
            }
        }

        setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || undefined,
            phoneNumber: firebaseUser.phoneNumber || undefined,
            avatar: firebaseUser.photoURL || undefined,
            role: role 
        });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen for Products (Real-time)
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // We order by 'createdAt' (or the internal 'id' timestamp) to keep list consistent
    const unsubscribe = db.collection('products').orderBy('id', 'desc').onSnapshot((snapshot) => {
      const productsData = snapshot.docs.map(doc => {
        const data = doc.data();
        // CRITICAL FIX: Ensure 'id' is the Firestore Document ID string, not the timestamp number from data.
        // This ensures update/delete operations target the correct document.
        return {
            ...data,
            id: doc.id 
        };
      }) as Product[];
      setProducts(productsData);
    }, (error) => {
        console.error("Error fetching products:", error);
    });
    return () => unsubscribe();
  }, []);

  // 3. Listen for Orders (Real-time)
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = db.collection('orders').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        firestoreId: doc.id, // Capture the Firestore Document ID for updates
        ...doc.data()
      })) as OrderDetails[];
      
      setOrders(ordersData);

      // If the current user is looking at a specific order summary, keep it updated in real-time
      setOrderDetails(prev => {
        if (!prev) return null;
        const updated = ordersData.find(o => o.orderId === prev.orderId);
        return updated || prev;
      });

    }, (error) => {
        console.error("Error fetching orders:", error);
    });
    return () => unsubscribe();
  }, []);

  // 4. Listen for Store Settings (Real-time)
  useEffect(() => {
      if (!isFirebaseConfigured) return;
      
      const docRef = db.collection('settings').doc('storeConfig');
      
      const unsubscribe = docRef.onSnapshot((doc) => {
          if (doc.exists) {
              const data = doc.data() as StoreSettings;
              setStoreSettings({
                  merchantVpa: data.merchantVpa || 't.raviteja2025@oksbi',
                  merchantName: data.merchantName || 'QuickOrder Store'
              });
          }
      });
      return () => unsubscribe();
  }, []);

  const handleUpdateStoreSettings = async (newSettings: StoreSettings) => {
      if (!isFirebaseConfigured) return;
      try {
          await db.collection('settings').doc('storeConfig').set(newSettings, { merge: true });
          alert("Store payment settings updated successfully!");
      } catch (e) {
          console.error("Error updating settings:", e);
          alert("Failed to update settings.");
      }
  };

  const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
      if (!isFirebaseConfigured) return;
      try {
        await db.collection('products').add({
            ...newProductData,
            // We still save a timestamp 'id' field for sorting if needed, 
            // but the doc.id will be used for operations.
            id: Date.now(), 
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
          console.error("Error adding product: ", e);
          alert("Failed to add product");
      }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
      if (!isFirebaseConfigured) return;
      try {
          // Use the ID directly (which is now the Firestore Doc ID)
          await db.collection('products').doc(String(updatedProduct.id)).update({
              name: updatedProduct.name,
              price: updatedProduct.price,
              unit: updatedProduct.unit,
              description: updatedProduct.description,
              imageUrl: updatedProduct.imageUrl
          });
      } catch (e) {
          console.error("Error updating: ", e);
          alert("Failed to update product");
      }
  };

  const handleDeleteProduct = async (productId: number | string) => {
      if (!isFirebaseConfigured) return;
      try {
          await db.collection('products').doc(String(productId)).delete();
      } catch (e) {
          console.error("Error deleting: ", e);
      }
  };

  const handleDeleteOrder = async (firestoreId: string) => {
      if (!isFirebaseConfigured) return;
      try {
          await db.collection('orders').doc(firestoreId).delete();
      } catch (e) {
          console.error("Error deleting order: ", e);
          alert("Failed to delete order");
      }
  };

  const handlePlaceOrder = useCallback(async (customer: CustomerDetails, products: ProductOrder[]) => {
    if (!isFirebaseConfigured) {
        alert("App is not configured with Firebase.");
        return;
    }

    const totalAmount = products.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderId = `ORD-${Date.now()}`;
    
    const newOrder: OrderDetails = {
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
        // Updating state triggers render -> App shows OrderSummary because view is 'customer' and orderDetails is set.
        const orderWithId = { ...newOrder, firestoreId: docRef.id };
        setOrderDetails(orderWithId); 

        // UPDATED: Include transactionRef (orderId) for UPI Intent tracking
        const upiUrl = generateUpiUrl({
            vpa: storeSettings.merchantVpa, 
            payeeName: storeSettings.merchantName,
            amount: totalAmount,
            transactionNote: `Payment for Order #${orderId}`,
            transactionRef: orderId 
        });
        setPaymentUrl(upiUrl);
    } catch (e) {
        console.error("Error placing order: ", e);
        alert("Could not place order. Please try again.");
    }
  }, [currentUser, storeSettings]);

  const handleUpdateOrderStatus = async (firestoreId: string, status: OrderStatus, additionalData: Partial<OrderDetails> = {}) => {
      if (!isFirebaseConfigured) return;
      try {
          await db.collection('orders').doc(firestoreId).update({
              status,
              ...additionalData
          });
      } catch (e) {
          console.error("Error updating order status:", e);
          alert("Failed to update status");
      }
  };

  const handleNewOrder = useCallback(() => {
    setOrderDetails(null);
    setPaymentUrl('');
    setView('customer');
  }, []);

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
        await auth.signOut();
    }
    localStorage.removeItem('temp_role_pref');
    setCurrentUser(null);
    setView('landing');
    setShowLoginModal(false);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('temp_role_pref', user.role);
    setShowLoginModal(false);
    
    if (loginTargetRole === 'admin') {
        setView('admin');
    } else {
        setView('customer');
    }
  };

  const initiateLogin = (role: 'admin' | 'customer') => {
      setLoginTargetRole(role);
      localStorage.setItem('temp_role_pref', role);
      setShowLoginModal(true);
  };

  const handleViewChange = (newView: View) => {
      if (newView === 'admin') {
          setLoginTargetRole('admin');
          if (currentUser?.role !== 'admin') {
              initiateLogin('admin');
              return;
          }
      } else if (newView === 'customer') {
          setLoginTargetRole('customer');
          if (!currentUser) {
              initiateLogin('customer');
              return;
          }
      } else {
          setShowLoginModal(false);
      }
      
      setView(newView);
      
      if (newView !== 'customer') {
          setOrderDetails(null);
      }
  };

  if (!isFirebaseConfigured) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
              <div className="max-w-xl w-full bg-white rounded-xl shadow-lg border-2 border-red-500 p-8 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">Setup Required</h2>
                  <p className="mt-2 text-slate-600">Please check your firebaseConfig file.</p>
              </div>
          </div>
      );
  }

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-100 animate-pulse text-slate-500 font-medium">Loading QuickOrder...</div>;
  }

  const renderView = () => {
    if (showLoginModal) {
        return (
            <div className="max-w-md mx-auto">
                 <button 
                    onClick={() => setShowLoginModal(false)} 
                    className="mb-4 text-sm text-slate-500 hover:text-slate-700 flex items-center"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                 </button>
                 <Login 
                    targetRole={loginTargetRole} 
                    onLogin={handleLoginSuccess} 
                 />
            </div>
        );
    }

    if (view === 'landing') {
        return <LandingPage 
            onNavigateToCustomer={() => handleViewChange('customer')}
            onNavigateToAdmin={() => handleViewChange('admin')}
        />;
    }
    
    if (view === 'admin') {
      if (currentUser?.role !== 'admin') {
          return (
             <div className="max-w-md mx-auto">
                <Login targetRole="admin" onLogin={handleLoginSuccess} />
             </div>
          );
      }

      return (
        <AdminDashboard 
          products={products}
          orders={orders}
          currentUser={currentUser}
          storeSettings={storeSettings}
          onUpdateStoreSettings={handleUpdateStoreSettings}
          onAddProduct={handleAddProduct} 
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
        />
      );
    }

    if (view === 'customer') {
      if (orderDetails) {
        return <OrderSummary orderDetails={orderDetails} paymentUrl={paymentUrl} storeSettings={storeSettings} onNewOrder={handleNewOrder} />;
      }

      return (
        <CustomerDashboard 
            products={products} 
            onPlaceOrder={handlePlaceOrder} 
            currentUser={currentUser}
            orders={orders}
            onLoginRequest={() => initiateLogin('customer')}
        />
      );
    }
  };

  const showHeaderAndContainer = view !== 'landing' || showLoginModal;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans text-slate-800">
      {showHeaderAndContainer && (
        <Header
          currentView={showLoginModal ? loginTargetRole : view}
          setView={handleViewChange}
          currentUser={currentUser}
          onLogout={handleLogout}
          onLogin={() => initiateLogin('customer')}
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
