
import { db, ROOT_ADMIN_EMAILS, ROOT_ADMIN_PHONES } from './firebaseConfig';
import { Store } from '../types';

// Checks if a user is a root admin
export const isRootAdmin = (email?: string | null, phone?: string | null): boolean => {
    if (email && ROOT_ADMIN_EMAILS.includes(email)) return true;
    if (phone && ROOT_ADMIN_PHONES.includes(phone)) return true;
    return false;
};

// Checks if a user is an admin (either Root or in Database)
export const isUserAdmin = async (email?: string | null, phone?: string | null): Promise<boolean> => {
    // 1. Check Root Admins (Hardcoded in config) - Instant Access
    if (isRootAdmin(email, phone)) return true;

    // 2. Check Database Admins
    try {
        const adminsRef = db.collection('admins');
        
        if (email) {
            const snapshot = await adminsRef.where('email', '==', email).get();
            if (!snapshot.empty) return true;
        }

        if (phone) {
            const snapshot = await adminsRef.where('phone', '==', phone).get();
            if (!snapshot.empty) return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
};

export const getManagedStores = async (email?: string | null, phone?: string | null): Promise<Store[]> => {
    try {
        const storesRef = db.collection('stores');
        let emailStores: Store[] = [];
        let phoneStores: Store[] = [];

        if (email) {
            const snapshot = await storesRef.where('ownerEmail', '==', email).get();
            emailStores = snapshot.docs.map(doc => ({ ...doc.data(), storeId: doc.id } as Store));
        }

        if (phone) {
            const snapshot = await storesRef.where('ownerPhone', '==', phone).get();
            phoneStores = snapshot.docs.map(doc => ({ ...doc.data(), storeId: doc.id } as Store));
        }

        // Combine and Deduplicate by storeId
        const allStores = [...emailStores, ...phoneStores];
        const uniqueStores = Array.from(new Map(allStores.map(s => [s.storeId, s])).values());
        
        return uniqueStores;
    } catch (error) {
        console.error("Error checking store ownership:", error);
        return [];
    }
};

export const getAdmins = async () => {
    const querySnapshot = await db.collection('admins').get();
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addAdmin = async (email: string, phone: string, name: string) => {
    await db.collection('admins').add({ email, phone, name, createdAt: new Date() });
};

export const removeAdmin = async (adminId: string) => {
    await db.collection('admins').doc(adminId).delete();
};

export const getAllStores = async (): Promise<Store[]> => {
    try {
        const snapshot = await db.collection('stores').get();
        const stores = snapshot.docs.map(doc => ({ ...doc.data(), storeId: doc.id } as Store));
        return stores;
    } catch (e) {
        console.error("Error fetching stores:", e);
        return [];
    }
};

export const createStore = async (storeData: Store) => {
    await db.collection('stores').doc(storeData.storeId).set(storeData);
};

export const deleteStore = async (storeId: string) => {
    await db.collection('stores').doc(storeId).delete();
};
