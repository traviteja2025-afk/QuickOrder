
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyDyrPVXpvER6alusJn1gE6W2H7rinGpCNk",
  authDomain: "quickorder-upi.firebaseapp.com",
  projectId: "quickorder-upi",
  storageBucket: "quickorder-upi.firebasestorage.app",
  messagingSenderId: "1024773947914",
  appId: "1:1024773947914:web:10fc48371831ecc3d095f3",
  measurementId: "G-ML1XSDNJMZ"
};

// Flag to tell App.tsx that configuration is present
export const isFirebaseConfigured = true;

// --- ROOT ADMINS (SUPER USERS) ---
// These users ALWAYS have access, even if database is empty.
export const ROOT_ADMIN_EMAILS = [
    "admin@example.com", 
    "t.raviteja2025@gmail.com", 
];

export const ROOT_ADMIN_PHONES = [
    "9876543210", 
];

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);