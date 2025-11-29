
import React, { useState, useCallback, useEffect } from 'react';
import { OrderDetails, ProductOrder, CustomerDetails, Product, View, User } from './types';
import { generateUpiUrl } from './services/upiService';
import Header from './components/Header';
import Footer from './components/Footer';
import OrderForm from './components/OrderForm';
import OrderSummary from './components/OrderSummary';
import AdminDashboard from './components/admin/AdminDashboard';
import Login from './components/admin/Login';
import LandingPage from './components/LandingPage';

// Firebase Imports
import { db, auth, isFirebaseConfigured } from './services/firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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

  // 1. Listen for Authentication Changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
        setIsLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const determinedRole = localStorage.getItem('temp_role_pref') as 'admin' | 'customer' || 'customer';
        
        setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || undefined,
            phoneNumber: firebaseUser.phoneNumber || undefined,
            avatar: firebaseUser.photoURL || undefined,
            role: determinedRole 
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

    const q = query(collection(db, 'products'), orderBy('id', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      })) as unknown as Product[];
      setProducts(productsData);
    }, (error) => {
        console.error("Error fetching products:", error);
    });
    return () => unsubscribe();
  }, []);

  // 3. Listen for Orders (Real-time)
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const q = query(collection(db, 'orders'), orderBy('orderId', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as OrderDetails[];
      setOrders(ordersData);
    }, (error) => {
        console.error("Error fetching orders:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
      if (!isFirebaseConfigured) return;
      try {
        await addDoc(collection(db, 'products'), {
            ...newProductData,
            id: Date.now(), 
            createdAt: new Date()
        });
      } catch (e) {
          console.error("Error adding product: ", e);
          alert("Failed to add product");
      }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
      if (!isFirebaseConfigured) return;
      try {
          const productRef = doc(db, 'products', String(updatedProduct.id));
          await updateDoc(productRef, {
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
          await deleteDoc(doc(db, 'products', String(productId)));
      } catch (e) {
          console.error("Error deleting: ", e);
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
      customer,
      products,
      totalAmount,
      orderId,
      status: 'pending'
    };

    try {
        await addDoc(collection(db, 'orders'), newOrder);
        setOrderDetails(newOrder); 

        const upiUrl = generateUpiUrl({
            vpa: 'your-business-upi@oksbi', 
            payeeName: 'Your Business Name',
            amount: totalAmount,
            transactionNote: `Payment for Order #${orderId}`
        });
        setPaymentUrl(upiUrl);
    } catch (e) {
        console.error("Error placing order: ", e);
        alert("Could not place order. Please try again.");
    }
  }, []);

  const handleConfirmPaymentFirestore = async (orderId: string) => {
      alert("To implement confirmation, we need to map Firestore Document IDs to the Order object.");
  }

  const handleNewOrder = useCallback(() => {
    setOrderDetails(null);
    setPaymentUrl('');
    setView('customer');
  }, []);

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
        await signOut(auth);
    }
    localStorage.removeItem('temp_role_pref');
    setCurrentUser(null);
    if (view === 'admin') {
        setView('landing');
    }
  };

  const handleLoginSuccess = (user: User) => {
    setShowLoginModal(false);
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
          }
      } else if (newView === 'customer') {
          setLoginTargetRole('customer');
          if (!currentUser) {
              initiateLogin('customer');
          }
      } else {
          setShowLoginModal(false);
      }
      setView(newView);
  };

  // --- RENDER HELPERS ---

  if (!isFirebaseConfigured) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
              <div className="max-w-xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-red-100">
                  <div className="bg-red-500 p-6 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h2 className="text-2xl font-bold text-white">Firebase Setup Required</h2>
                  </div>
                  <div className="p-8 space-y-6">
                      <p className="text-slate-600 text-lg">
                          The application cannot connect to the backend because the API keys are missing.
                      </p>
                      
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <h3 className="font-semibold text-slate-800 mb-2">How to fix this:</h3>
                          <ol className="list-decimal list-inside space-y-2 text-slate-600">
                              <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Firebase Console</a>.</li>
                              <li>Open your project settings.</li>
                              <li>Scroll down to "Your Apps" and find the "SDK Setup and Configuration".</li>
                              <li>Copy the <code className="bg-slate-200 px-1 py-0.5 rounded text-sm">firebaseConfig</code> object.</li>
                              <li>Open the file <code className="bg-slate-200 px-1 py-0.5 rounded text-sm text-red-500">services/firebaseConfig.ts</code> in your editor.</li>
                              <li>Replace the placeholder values with your actual keys.</li>
                          </ol>
                      </div>
                      
                      <div className="text-center">
                          <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                              I have updated the file, Reload
                          </button>
                      </div>
                  </div>
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
          onAddProduct={handleAddProduct} 
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onConfirmPayment={handleConfirmPaymentFirestore}
        />
      );
    }

    if (view === 'customer') {
      if (!orderDetails) {
        return <OrderForm 
                    products={products} 
                    onPlaceOrder={handlePlaceOrder} 
                    currentUser={currentUser}
                />;
      }
      return <OrderSummary orderDetails={orderDetails} paymentUrl={paymentUrl} onNewOrder={handleNewOrder} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans text-slate-800">
      {view !== 'landing' && (
        <Header
          currentView={view}
          setView={handleViewChange}
          currentUser={currentUser}
          onLogout={handleLogout}
          onLogin={() => initiateLogin('customer')}
        />
      )}
      <main className={`flex-grow ${view !== 'landing' ? 'container mx-auto px-4 py-8 md:py-12' : ''}`}>
        <div className={view !== 'landing' ? 'max-w-4xl mx-auto' : 'h-full'}>
          {renderView()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
